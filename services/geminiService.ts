
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, TransactionType, AccountType } from "../types";

// Helper to get AI instance safely
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing from environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getSmartInsights = async (transactions: Transaction[]): Promise<string> => {
  if (transactions.length === 0) return "Add transactions to get personalized tips!";

  const ai = getAI();
  if (!ai) return "Connect to the internet and set your API key to get smart insights.";

  const summary = transactions.slice(0, 50).map(t => ({
    type: t.type,
    amount: t.amount,
    category: t.category,
    date: t.bsDate,
    desc: t.description
  }));

  const prompt = `
    As a personal finance expert, analyze these transactions and provide 3-4 ultra-concise tips.
    
    Transactions: ${JSON.stringify(summary)}

    CRITICAL RULES:
    1. Each tip MUST be exactly one short, actionable sentence.
    2. DO NOT use bullet points, '*' symbols, or numbering.
    3. Start each sentence directly.
    4. Use "Rs." for currency.
    5. Be encouraging but very brief.
    6. Example: "Try limiting weekend dining to save Rs. 1500 this month."
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Track more to see saving opportunities!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Insights will appear once more data is available.";
  }
};

/**
 * Parses unstructured transaction text into a structured Transaction object.
 */
export const parseTransactionNotification = async (text: string, currentBSYear: number): Promise<Partial<Transaction> | null> => {
  const ai = getAI();
  if (!ai) return null;

  const prompt = `
    Analyze the following transaction notification text and extract details in JSON.
    Current BS Year: ${currentBSYear}.
    Map category to one of: food, transport, rent, shopping, bills, health, entertainment, salary, freelance, gift, investment, other.
    Notification Text: "${text}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            type: { type: Type.STRING, enum: [TransactionType.INCOME, TransactionType.EXPENSE] },
            category: { type: Type.STRING },
            account: { type: Type.STRING, enum: [AccountType.CASH, AccountType.BANK] },
            description: { type: Type.STRING },
            bsDate: { type: Type.STRING }
          },
          required: ["amount", "type", "description", "bsDate"]
        }
      }
    });

    const resultStr = response.text?.trim();
    if (!resultStr) return null;
    
    return JSON.parse(resultStr);
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    return null;
  }
};
