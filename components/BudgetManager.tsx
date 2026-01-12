
import React, { useState, useEffect, useMemo } from 'react';
import { Category, TransactionType, Budget, Transaction } from '../types';
import { BS_MONTHS } from '../constants';

interface BudgetManagerProps {
  categories: Category[];
  budgets: Budget[];
  transactions: Transaction[];
  onSave: (budgets: Budget[]) => void;
  onClose: () => void;
  currentBSDate: string;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ categories, budgets, transactions, onSave, onClose, currentBSDate }) => {
  const separator = currentBSDate.includes('-') ? '-' : '/';
  const [bsYear, bsMonth] = currentBSDate.split(separator).map(Number);
  const [selectedYear, setSelectedYear] = useState(bsYear);
  const [selectedMonth, setSelectedMonth] = useState(bsMonth);

  const expenseCategories = categories.filter(c => c.type === TransactionType.EXPENSE);
  
  // Local state for the form
  const [localBudgets, setLocalBudgets] = useState<Record<string, string>>({});

  // Synchronize local budgets whenever the selected year, month, or global budgets change
  useEffect(() => {
    const initial: Record<string, string> = {};
    budgets.forEach(b => {
      if (b.year === selectedYear && b.month === selectedMonth) {
        initial[b.categoryId] = b.amount.toString();
      }
    });
    setLocalBudgets(initial);
  }, [selectedYear, selectedMonth, budgets]);

  // Calculate spending per category for the selected month/year
  const spentPerCategory = useMemo(() => {
    const spent: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type !== TransactionType.EXPENSE) return;
      const tSep = t.bsDate.includes('-') ? '-' : '/';
      const [y, m] = t.bsDate.split(tSep).map(Number);
      if (y === selectedYear && m === selectedMonth) {
        spent[t.category] = (spent[t.category] || 0) + t.amount;
      }
    });
    return spent;
  }, [transactions, selectedYear, selectedMonth]);

  const alertSummary = useMemo(() => {
    let over = 0;
    let approaching = 0;
    expenseCategories.forEach(cat => {
      const spent = spentPerCategory[cat.id] || 0;
      const budgetInput = localBudgets[cat.id];
      if (budgetInput) {
        const budgetVal = parseFloat(budgetInput);
        if (!isNaN(budgetVal) && budgetVal > 0) {
          if (spent > budgetVal) over++;
          // Updated check to 80% from 85%
          else if (spent > budgetVal * 0.8) approaching++;
        }
      }
    });
    return { over, approaching };
  }, [expenseCategories, spentPerCategory, localBudgets]);

  const handleSave = () => {
    const updatedBudgets = budgets.filter(b => b.year !== selectedYear || b.month !== selectedMonth);
    
    Object.keys(localBudgets).forEach((catId) => {
      const amount = localBudgets[catId];
      const numAmount = parseFloat(amount);
      if (!isNaN(numAmount) && numAmount > 0) {
        updatedBudgets.push({
          id: `${selectedYear}-${selectedMonth}-${catId}`,
          categoryId: catId,
          amount: numAmount,
          year: selectedYear,
          month: selectedMonth
        });
      }
    });

    onSave(updatedBudgets);
    onClose();
  };

  const handleInputChange = (catId: string, value: string) => {
    setLocalBudgets(prev => ({ ...prev, [catId]: value }));
  };

  const yearOptions = Array.from({ length: 2100 - 2000 + 1 }, (_, i) => 2000 + i);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-300 border border-slate-100 dark:border-slate-800">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Monthly Budgets</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Set limits for your expenses</p>
          </div>
          <button onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex gap-4">
          <div className="flex-1 space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Year</label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Month</label>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {BS_MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Summary Alert */}
          {(alertSummary.over > 0 || alertSummary.approaching > 0) && (
            <div className={`p-4 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2 border ${alertSummary.over > 0 ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800'}`}>
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm ${alertSummary.over > 0 ? 'bg-rose-500' : 'bg-amber-500'}`}>
                <i className={`fa-solid ${alertSummary.over > 0 ? 'fa-triangle-exclamation' : 'fa-bell'}`}></i>
              </div>
              <div>
                <h4 className={`text-sm font-black ${alertSummary.over > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-amber-700 dark:text-amber-400'}`}>
                  {alertSummary.over > 0 ? 'Budget Limit Exceeded' : 'Approaching Limits'}
                </h4>
                <p className={`text-xs font-medium mt-1 leading-snug ${alertSummary.over > 0 ? 'text-rose-600 dark:text-rose-300' : 'text-amber-600 dark:text-amber-300'}`}>
                  {alertSummary.over > 0 
                    ? `You have exceeded the budget for ${alertSummary.over} categor${alertSummary.over === 1 ? 'y' : 'ies'}. Adjust limits or review spending.` 
                    : `${alertSummary.approaching} categor${alertSummary.approaching === 1 ? 'y is' : 'ies are'} nearing the set limit (80%+ used).`}
                </p>
              </div>
            </div>
          )}

          {expenseCategories.map(cat => {
            const spent = spentPerCategory[cat.id] || 0;
            const budgetInput = localBudgets[cat.id];
            const budgetVal = parseFloat(budgetInput) || 0;
            const isOver = budgetVal > 0 && spent > budgetVal;
            // Updated check to 80% from 85%
            const isApproaching = budgetVal > 0 && spent > budgetVal * 0.8 && spent <= budgetVal;

            return (
              <div key={cat.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg ${cat.color} flex items-center justify-center text-white text-xs shadow-sm`}>
                      <i className={`fa-solid ${cat.icon}`}></i>
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-700 dark:text-slate-200 text-xs truncate uppercase tracking-tight">{cat.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Spent: Rs. {spent.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOver && (
                      <span className="text-[8px] font-black bg-rose-50 text-rose-600 dark:bg-rose-900/20 px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse border border-rose-100 dark:border-rose-900">
                        Exceeded
                      </span>
                    )}
                    {isApproaching && (
                      <span className="text-[8px] font-black bg-amber-50 text-amber-600 dark:bg-amber-900/20 px-2 py-0.5 rounded-full uppercase tracking-widest border border-amber-100 dark:border-amber-900">
                        Approaching
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-black uppercase">Rs.</span>
                  <input
                    type="number"
                    value={budgetInput || ''}
                    onChange={(e) => handleInputChange(cat.id, e.target.value)}
                    placeholder="No limit set"
                    className={`w-full pl-12 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border rounded-2xl focus:ring-2 outline-none text-sm font-black transition-all ${isOver ? 'border-rose-300 focus:ring-rose-500 text-rose-600' : isApproaching ? 'border-amber-300 focus:ring-amber-500' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500 text-slate-700 dark:text-white'}`}
                  />
                  {isOver && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500 animate-pulse">
                      <i className="fa-solid fa-circle-exclamation"></i>
                    </div>
                  )}
                  {isApproaching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500">
                       <i className="fa-solid fa-triangle-exclamation"></i>
                    </div>
                  )}
                  
                  {budgetVal > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700 rounded-b-2xl overflow-hidden opacity-0 group-focus-within:opacity-100 transition-opacity">
                      <div 
                        className={`h-full transition-all duration-500 ${isOver ? 'bg-rose-500' : isApproaching ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min((spent / budgetVal) * 100, 100)}%` }}
                      ></div>
                    </div>
                  )}
                </div>
                {/* Always visible Mini Progress Bar below input */}
                 {budgetVal > 0 && (
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-rose-500' : isApproaching ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min((spent / budgetVal) * 100, 100)}%` }}
                      ></div>
                    </div>
                  )}
              </div>
            );
          })}
        </div>

        <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky bottom-0">
          <button
            onClick={handleSave}
            className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-[0.98]"
          >
            Save Budgets for {BS_MONTHS[selectedMonth - 1]}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetManager;
