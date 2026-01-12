
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Transaction, TransactionType, Category, Budget, FinancialGoal, DashboardWidget, WidgetConfig, AccountType, AccountBalances, UserProfile, AppNotification } from './types';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransferForm from './components/TransferForm';
import CategoryManager from './components/CategoryManager';
import BudgetManager from './components/BudgetManager';
import BudgetStatus from './components/BudgetStatus';
import FinancialGoalManager from './components/FinancialGoalManager';
import TransactionHistory from './components/TransactionHistory';
import DashboardSettings from './components/DashboardSettings';
import AccountSettings from './components/AccountSettings';
import ExportManager from './components/ExportManager';
import Login from './components/Login';
import DeveloperDetails from './components/DeveloperDetails';
import UserProfileManager from './components/UserProfileManager';
import { DEFAULT_CATEGORIES } from './constants';
import { getSmartInsights } from './services/geminiService';
import { getCurrentBSDate } from './utils/bsCalendar';

interface BudgetAlertData {
  type: 'WARNING' | 'BREACH';
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  limit: number;
  spent: number;
}

const BudgetBreachAlert: React.FC<{ data: BudgetAlertData; onClose: () => void }> = ({ data, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 8000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isBreach = data.type === 'BREACH';
  
  // Dynamic Styles
  const containerBorder = isBreach ? "border-rose-200 dark:border-rose-900/50" : "border-amber-200 dark:border-amber-900/50";
  const shadowColor = isBreach ? "shadow-[0_20px_50px_rgba(244,63,94,0.15)]" : "shadow-[0_20px_50px_rgba(245,158,11,0.15)]";
  const iconBg = isBreach ? "bg-rose-500 shadow-rose-200" : "bg-amber-500 shadow-amber-200";
  const titleColor = isBreach ? "text-rose-500" : "text-amber-500";
  const cardBg = isBreach ? "bg-rose-50/50 dark:bg-rose-900/10 border-rose-100/50 dark:border-rose-900/20" : "bg-amber-50/50 dark:bg-amber-900/10 border-amber-100/50 dark:border-amber-900/20";
  const progressBg = isBreach ? "bg-rose-500" : "bg-amber-500";
  const totalColor = isBreach ? "text-rose-600" : "text-amber-600";

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[3000] w-full max-w-sm px-4 animate-in slide-in-from-top-10 duration-500">
      <div className={`bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border ${containerBorder} p-5 rounded-[2.5rem] ${shadowColor} flex flex-col gap-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 ${iconBg} text-white rounded-2xl flex items-center justify-center text-lg animate-pulse shadow-lg`}>
              <i className={`fa-solid ${isBreach ? 'fa-triangle-exclamation' : 'fa-bell'}`}></i>
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800 dark:text-white tracking-tight">
                {isBreach ? 'Budget Exceeded!' : 'Budget Alert'}
              </h4>
              <p className={`text-[9px] font-black ${titleColor} uppercase tracking-widest`}>
                {isBreach ? 'Limit Reached' : 'Approaching Limit'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><i className="fa-solid fa-xmark"></i></button>
        </div>
        <div className={`flex items-center gap-4 p-3 ${cardBg} rounded-2xl border`}>
          <div className={`h-10 w-10 rounded-xl ${data.categoryColor} flex items-center justify-center text-white shadow-sm`}>
            <i className={`fa-solid ${data.categoryIcon}`}></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate uppercase tracking-tight">{data.categoryName}</p>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Limit: Rs. {data.limit.toLocaleString()}</span>
              <span className={`text-[9px] font-black ${totalColor} uppercase`}>Total: Rs. {data.spent.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full ${progressBg} w-full`}></div>
        </div>
      </div>
    </div>
  );
};

const NotificationCenter: React.FC<{ 
  notifications: AppNotification[]; 
  onClose: () => void;
  onClear: () => void;
  onMarkRead: (id: string) => void;
}> = ({ notifications, onClose, onClear, onMarkRead }) => {
  return (
    <div className="fixed inset-0 z-[2500] flex items-start justify-end p-4 pointer-events-none">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in slide-in-from-right-10 duration-300 border border-slate-100 dark:border-slate-800 relative z-10 pointer-events-auto mt-16 md:mt-24">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Alert Center</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Stay updated with Artha</p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={onClear} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Clear All</button>
             <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400"><i className="fa-solid fa-xmark"></i></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-200 dark:text-slate-700">
                <i className="fa-solid fa-bell-slash text-2xl"></i>
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">All clear!</p>
            </div>
          ) : (
            notifications.map(n => (
              <div 
                key={n.id} 
                onClick={() => onMarkRead(n.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${n.isRead ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-60' : 'bg-slate-50 dark:bg-slate-800/50 border-indigo-100 dark:border-indigo-900/30'}`}
              >
                {!n.isRead && <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-brand-500"></div>}
                <div className="flex gap-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white shrink-0 ${n.categoryColor || 'bg-indigo-500'}`}>
                    <i className={`fa-solid ${n.categoryIcon || 'fa-bell'}`}></i>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight truncate">{n.title}</p>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-snug mt-1">{n.message}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">{n.dateBS}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const INITIAL_DASHBOARD_CONFIG: WidgetConfig[] = [
  { id: DashboardWidget.SUMMARY_CARDS, visible: true, label: 'Financial Summary' },
  { id: DashboardWidget.INCOME_VS_EXPENSE, visible: true, label: 'Income vs Expense' },
  { id: DashboardWidget.EXPENSE_BREAKDOWN, visible: true, label: 'Expense Breakdown' },
  { id: DashboardWidget.BUDGET_PROGRESS, visible: true, label: 'Monthly Budget Progress' },
  { id: DashboardWidget.GOALS_SUMMARY, visible: true, label: 'Goals Summary' },
  { id: DashboardWidget.INCOME_COMPARISON, visible: false, label: 'Income Growth Analysis' },
];

const WelcomeSplash: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const steps = [
    {
      icon: "fa-coins",
      title: "Artha Tracker",
      subtitle: "Personal Finance, Simplified",
      description: "Take control of your financial life with elegance and ease. Track every rupee precisely.",
      gradient: "from-brand-500 to-orange-400",
      accent: "text-brand-600",
      bgClass: "bg-brand-500"
    },
    {
      icon: "fa-calendar-days",
      title: "Nepali Calendar",
      subtitle: "Native BS Support",
      description: "Designed for Nepal. Seamlessly switch between Bikram Sambat and Gregorian dates.",
      gradient: "from-rose-500 to-pink-400",
      accent: "text-rose-600",
      bgClass: "bg-rose-500"
    },
    {
      icon: "fa-wand-magic-sparkles",
      title: "Smart Insights",
      subtitle: "Gemini AI Powered",
      description: "Get personalized financial tips and automatic notification parsing powered by AI.",
      gradient: "from-indigo-600 to-blue-500",
      accent: "text-indigo-600",
      bgClass: "bg-indigo-600"
    },
    {
      icon: "fa-bullseye",
      title: "Reach Goals",
      subtitle: "Dream Big",
      description: "Set savings targets and watch your wealth grow. Build your financial future today.",
      gradient: "from-emerald-500 to-teal-400",
      accent: "text-emerald-600",
      bgClass: "bg-emerald-500"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setDirection('forward');
      setStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setDirection('backward');
      setStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-[#0a0c12] z-[2000] flex flex-col items-center justify-center p-6 overflow-hidden transition-colors duration-1000">
      {/* Dynamic Animated Background Blobs */}
      <div className={`absolute top-[-20%] left-[-20%] w-[150%] h-[150%] bg-gradient-to-br ${steps[step].gradient} opacity-[0.03] dark:opacity-[0.05] transition-all duration-1000 rounded-full animate-slow-spin`}></div>
      <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full blur-[120px] opacity-20 animate-pulse transition-all duration-1000 ${steps[step].bgClass}`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full blur-[120px] opacity-20 animate-pulse delay-700 transition-all duration-1000 ${steps[step].bgClass}`}></div>

      <div className="relative z-10 w-full max-w-sm flex flex-col h-[85vh] justify-between">
        <div className="flex justify-between items-center">
           {step > 0 ? (
             <button onClick={handleBack} className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:text-slate-600 transition-all active:scale-90">
                <i className="fa-solid fa-arrow-left"></i>
             </button>
           ) : <div className="w-10 h-10" />}
           <button onClick={onComplete} className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-colors">Skip</button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
          <div 
            key={step} 
            className={`flex flex-col items-center gap-8 animate-in ${direction === 'forward' ? 'slide-in-from-right-12' : 'slide-in-from-left-12'} fade-in duration-700 ease-out`}
          >
            {/* Playful Interactive Icon Container */}
            <div className={`h-40 w-40 bg-gradient-to-br ${steps[step].gradient} rounded-[3.5rem] flex items-center justify-center text-white text-6xl shadow-2xl ring-8 ring-white dark:ring-slate-900 transition-all duration-500 hover:scale-110 hover:rotate-6 group cursor-default`}>
              <i className={`fa-solid ${steps[step].icon} group-hover:animate-bounce-short`}></i>
            </div>
            
            <div className="space-y-4">
              <div className="inline-block px-4 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-4 duration-1000 delay-200">
                <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${steps[step].accent}`}>{steps[step].subtitle}</span>
              </div>
              
              <h1 className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter leading-none animate-in slide-in-from-bottom-6 duration-1000 delay-400">
                {steps[step].title}
              </h1>
              
              <p className="text-lg font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px] mx-auto animate-in slide-in-from-bottom-8 duration-1000 delay-600">
                {steps[step].description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-10">
          {/* Enhanced Progress Indicator */}
          <div className="flex gap-2.5">
            {steps.map((_, i) => (
              <button 
                key={i} 
                onClick={() => {
                  setDirection(i > step ? 'forward' : 'backward');
                  setStep(i);
                }}
                className={`h-2.5 rounded-full transition-all duration-500 ease-spring ${i === step ? `w-10 ${steps[step].bgClass}` : 'w-2.5 bg-slate-200 dark:bg-slate-800'}`} 
              />
            ))}
          </div>

          <button 
            onClick={handleNext} 
            className={`group w-full py-5 text-white rounded-[2rem] font-black text-lg shadow-xl transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-4 ${steps[step].bgClass} shadow-${steps[step].bgClass}/20`}
          >
            <span className="tracking-tight">{step === steps.length - 1 ? 'Start Journey' : 'Continue'}</span>
            <i className={`fa-solid ${step === steps.length - 1 ? 'fa-rocket' : 'fa-arrow-right'} text-sm transition-transform group-hover:translate-x-1`}></i>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slow-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-slow-spin {
          animation: slow-spin 30s linear infinite;
        }
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .group-hover\\:animate-bounce-short:hover, .animate-bounce-short {
          animation: bounce-short 0.8s ease-in-out infinite;
        }
        .ease-spring {
          transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>
    </div>
  );
};

const App: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [initialBalances, setInitialBalances] = useState<AccountBalances>({ cash: 0, bank: 0, esewa: 0, khalti: 0 });
  const [dashboardConfig, setDashboardConfig] = useState<WidgetConfig[]>(INITIAL_DASHBOARD_CONFIG);
  const [appPassword, setAppPassword] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [darkMode, setDarkMode] = useState<boolean>(localStorage.getItem('artha_dark_mode') === 'true');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [budgetAlert, setBudgetAlert] = useState<BudgetAlertData | null>(null);
  
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [isDevDetailsOpen, setIsDevDetailsOpen] = useState(false);
  const [showUndoSnackbar, setShowUndoSnackbar] = useState(false);
  const [lastDeletedTransaction, setLastDeletedTransaction] = useState<Transaction | null>(null);
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isCatManagerOpen, setIsCatManagerOpen] = useState(false);
  const [isBudgetManagerOpen, setIsBudgetManagerOpen] = useState(false);
  const [isBudgetStatusOpen, setIsBudgetStatusOpen] = useState(false);
  const [isGoalManagerOpen, setIsGoalManagerOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAccountManagerOpen, setIsAccountManagerOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  
  const [insights, setInsights] = useState<string | null>(localStorage.getItem('artha_cached_insights'));
  const [loadingInsights, setLoadingInsights] = useState(false);

  const currentBS = useMemo(() => getCurrentBSDate(), []);

  const unreadNotifCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  const greetingData = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: "Good Morning", icon: "fa-sun-low", color: "text-amber-500" };
    if (hour >= 12 && hour < 17) return { text: "Good Afternoon", icon: "fa-sun", color: "text-brand-500" };
    if (hour >= 17 && hour < 21) return { text: "Good Evening", icon: "fa-moon-stars", color: "text-indigo-500" };
    return { text: "Good Night", icon: "fa-moon", color: "text-slate-400" };
  }, []);

  useEffect(() => {
    const seenWelcome = sessionStorage.getItem('artha_seen_welcome');
    if (seenWelcome) setShowWelcome(false);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('artha_dark_mode', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    const saved = localStorage.getItem('artha_transactions');
    if (saved) setTransactions(JSON.parse(saved).map((t: any) => ({ ...t, adDate: new Date(t.adDate) })));
    const savedCats = localStorage.getItem('artha_categories');
    if (savedCats) setCategories(JSON.parse(savedCats));
    const savedBudgets = localStorage.getItem('artha_budgets');
    if (savedCats) setBudgets(JSON.parse(savedBudgets || '[]'));
    const savedGoals = localStorage.getItem('artha_goals');
    if (savedGoals) setGoals(JSON.parse(savedGoals));
    const savedBalances = localStorage.getItem('artha_balances');
    if (savedBalances) setInitialBalances(JSON.parse(savedBalances));
    const savedConfig = localStorage.getItem('artha_dashboard_config');
    if (savedConfig) setDashboardConfig(JSON.parse(savedConfig));
    const savedPwd = localStorage.getItem('artha_password');
    if (savedPwd) { setAppPassword(savedPwd); setIsLocked(true); }
    const savedProf = localStorage.getItem('artha_profile');
    if (savedProf) setUserProfile(JSON.parse(savedProf));
    const savedNotifs = localStorage.getItem('artha_notifications');
    if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
  }, []);

  useEffect(() => localStorage.setItem('artha_transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('artha_categories', JSON.stringify(categories)), [categories]);
  useEffect(() => localStorage.setItem('artha_budgets', JSON.stringify(budgets)), [budgets]);
  useEffect(() => localStorage.setItem('artha_goals', JSON.stringify(goals)), [goals]);
  useEffect(() => localStorage.setItem('artha_balances', JSON.stringify(initialBalances)), [initialBalances]);
  useEffect(() => localStorage.setItem('artha_dashboard_config', JSON.stringify(dashboardConfig)), [dashboardConfig]);
  useEffect(() => localStorage.setItem('artha_notifications', JSON.stringify(notifications)), [notifications]);
  useEffect(() => { if (userProfile) localStorage.setItem('artha_profile', JSON.stringify(userProfile)); }, [userProfile]);

  const addNotification = (notif: Partial<AppNotification>) => {
    const fullNotif: AppNotification = {
      id: crypto.randomUUID(),
      type: 'INFO',
      title: 'Notification',
      message: '',
      dateBS: currentBS,
      isRead: false,
      ...notif
    };
    setNotifications(prev => [fullNotif, ...prev]);
  };

  const checkBudgetBreach = useCallback((newTransaction: Transaction, currentTransactions: Transaction[]) => {
    if (newTransaction.type !== TransactionType.EXPENSE) return;
    
    const separator = newTransaction.bsDate.includes('-') ? '-' : '/';
    const [y, m] = newTransaction.bsDate.split(separator).map(Number);
    const budget = budgets.find(b => b.year === y && b.month === m && b.categoryId === newTransaction.category);
    
    if (!budget) return;

    // Calculate total spent BEFORE this new transaction
    const previousSpent = currentTransactions
      .filter(t => {
        if (t.type !== TransactionType.EXPENSE || t.category !== newTransaction.category) return false;
        const tSep = t.bsDate.includes('-') ? '-' : '/';
        const [ty, tm] = t.bsDate.split(tSep).map(Number);
        return ty === y && tm === m;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const newTotalSpent = previousSpent + newTransaction.amount;
    const category = categories.find(c => c.id === newTransaction.category);
    
    // Thresholds
    const prevPercentage = previousSpent / budget.amount;
    const newPercentage = newTotalSpent / budget.amount;

    // Logic for 80% Warning (Updated from 90%)
    if (prevPercentage < 0.8 && newPercentage >= 0.8 && newPercentage <= 1.0) {
      setBudgetAlert({
        type: 'WARNING',
        categoryName: category?.name || 'Category',
        categoryIcon: category?.icon || 'fa-tag',
        categoryColor: category?.color || 'bg-slate-500',
        limit: budget.amount,
        spent: newTotalSpent
      });
      addNotification({
        type: 'BUDGET_WARNING',
        title: 'Budget Alert: 80% Reached',
        message: `You've used over 80% of your ${category?.name} budget. Spent: Rs. ${newTotalSpent.toLocaleString()} / ${budget.amount.toLocaleString()}`,
        categoryIcon: category?.icon,
        categoryColor: category?.color
      });
    }

    // Logic for 100% Breach
    else if (prevPercentage <= 1.0 && newPercentage > 1.0) {
      setBudgetAlert({
        type: 'BREACH',
        categoryName: category?.name || 'Category',
        categoryIcon: category?.icon || 'fa-tag',
        categoryColor: category?.color || 'bg-slate-500',
        limit: budget.amount,
        spent: newTotalSpent
      });
      addNotification({
        type: 'BUDGET_EXCEEDED',
        title: 'Budget Breached!',
        message: `You spent Rs. ${newTotalSpent.toLocaleString()} on ${category?.name}, which exceeds your Rs. ${budget.amount.toLocaleString()} limit.`,
        categoryIcon: category?.icon,
        categoryColor: category?.color
      });
    }
  }, [budgets, categories, currentBS]);

  const handleAddTransaction = (t: Transaction) => {
    checkBudgetBreach(t, transactions);
    setTransactions(prev => [t, ...prev]);
  };

  const handleUpdateTransaction = (t: Transaction) => {
    const otherTransactions = transactions.filter(old => old.id !== t.id);
    checkBudgetBreach(t, otherTransactions);
    setTransactions(prev => prev.map(old => old.id === t.id ? t : old));
  };

  const handleTransfer = (outTx: Transaction, inTxOrGoalId: Transaction | string) => {
    // Check budget for the outgoing transaction as it is an expense
    checkBudgetBreach(outTx, transactions);

    if (typeof inTxOrGoalId === 'string') {
      setTransactions(prev => [outTx, ...prev]);
      
      const goal = goals.find(g => g.id === inTxOrGoalId);
      if (goal) {
        setGoals(prev => prev.map(g => g.id === inTxOrGoalId ? { ...g, currentAmount: g.currentAmount + outTx.amount } : g));
        
        addNotification({
          type: 'INFO',
          title: 'Goal Fund Added',
          message: `Rs. ${outTx.amount.toLocaleString()} added to ${goal.name}`,
          categoryIcon: goal.icon,
          categoryColor: goal.color
        });

        if (goal.currentAmount + outTx.amount >= goal.targetAmount && goal.currentAmount < goal.targetAmount) {
          setTimeout(() => {
            addNotification({
              type: 'GOAL_REACHED',
              title: 'Goal Reached! 🏆',
              message: `You've achieved your goal: ${goal.name}`,
              categoryIcon: 'fa-trophy',
              categoryColor: 'bg-yellow-500'
            });
          }, 500);
        }
      }
    } else {
      setTransactions(prev => [outTx, inTxOrGoalId, ...prev]);
      addNotification({
        type: 'INFO',
        title: 'Transfer Successful',
        message: `Rs. ${outTx.amount.toLocaleString()} transferred to ${inTxOrGoalId.account}`,
        categoryIcon: 'fa-right-left',
        categoryColor: 'bg-indigo-500'
      });
    }
  };

  const handleDeleteTransaction = (t: Transaction) => {
    setLastDeletedTransaction(t);
    setTransactions(prev => prev.filter(old => old.id !== t.id));
    setShowUndoSnackbar(true);
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    undoTimeoutRef.current = setTimeout(() => setShowUndoSnackbar(false), 5000);
  };

  const handleUndoDelete = () => {
    if (lastDeletedTransaction) {
      setTransactions(prev => [lastDeletedTransaction, ...prev]);
      setShowUndoSnackbar(false);
      setLastDeletedTransaction(null);
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    }
  };

  const fetchInsights = useCallback(async () => {
    if (!isOnline || transactions.length === 0) return;
    setLoadingInsights(true);
    const result = await getSmartInsights(transactions);
    setInsights(result);
    localStorage.setItem('artha_cached_insights', result);
    setLoadingInsights(false);
  }, [transactions, isOnline]);

  const closeAllModals = () => {
    setIsHistoryOpen(false); setIsBudgetStatusOpen(false); setIsGoalManagerOpen(false);
    setIsMoreMenuOpen(false); setIsExportOpen(false); setIsCatManagerOpen(false);
    setIsAccountManagerOpen(false); setIsSettingsOpen(false); setIsInsightsOpen(false);
    setIsDevDetailsOpen(false); setIsTransferOpen(false); setIsProfileOpen(false);
    setIsNotifOpen(false);
  };

  const NavItem = ({ icon, label, onClick, active = false, colorClass = "" }: any) => (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group ${active ? 'bg-brand-500 text-white shadow-lg shadow-brand-100' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'}`}>
      <div className={`h-10 w-10 flex items-center justify-center rounded-xl transition-all ${active ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-700'} ${colorClass}`}>
        <i className={`fa-solid ${icon} text-lg`}></i>
      </div>
      <span className="font-bold text-sm tracking-tight">{label}</span>
      {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white"></div>}
    </button>
  );

  const isAtHome = !isHistoryOpen && !isBudgetStatusOpen && !isGoalManagerOpen && !isMoreMenuOpen && !isExportOpen && !isCatManagerOpen && !isAccountManagerOpen && !isSettingsOpen && !isInsightsOpen && !isDevDetailsOpen && !isProfileOpen;

  if (showWelcome) return <WelcomeSplash onComplete={() => { setShowWelcome(false); sessionStorage.setItem('artha_seen_welcome', 'true'); }} />;
  if (isLocked) return <Login onUnlock={() => setIsLocked(false)} correctPassword={appPassword || ''} />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#06080d] flex flex-col lg:flex-row">
      {budgetAlert && <BudgetBreachAlert data={budgetAlert} onClose={() => setBudgetAlert(null)} />}
      {isNotifOpen && (
        <NotificationCenter 
          notifications={notifications} 
          onClose={() => setIsNotifOpen(false)} 
          onClear={() => setNotifications([])}
          onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))}
        />
      )}

      {/* Desktop Vertical Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-[#0a0c12] border-r border-slate-100 dark:border-slate-800/50 h-screen sticky top-0 z-[100] p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="h-10 w-10 bg-brand-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
            <i className="fa-solid fa-coins"></i>
          </div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Artha Tracker</h1>
        </div>
        <button 
          onClick={() => setIsProfileOpen(true)}
          className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 mb-8 hover:border-brand-300 transition-all text-left"
        >
          <div className={`h-10 w-10 rounded-xl overflow-hidden ${userProfile?.color || 'bg-brand-500'} flex items-center justify-center text-white`}>
            {userProfile?.avatar.startsWith('data:') ? <img src={userProfile.avatar} className="h-full w-full object-cover" /> : <i className={`fa-solid ${userProfile?.avatar || 'fa-user'}`}></i>}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">{userProfile?.name || 'Guest'}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{userProfile?.motto || 'Managing Artha'}</p>
          </div>
        </button>
        <nav className="flex-1 space-y-1">
          <NavItem icon="fa-house" label="Dashboard" onClick={closeAllModals} active={isAtHome} />
          <NavItem icon="fa-receipt" label="Transactions" onClick={() => { closeAllModals(); setIsHistoryOpen(true); }} active={isHistoryOpen} />
          <NavItem icon="fa-chart-pie" label="Budgets" onClick={() => { closeAllModals(); setIsBudgetStatusOpen(true); }} active={isBudgetStatusOpen} />
          <NavItem icon="fa-bullseye" label="Savings Goals" onClick={() => { closeAllModals(); setIsGoalManagerOpen(true); }} active={isGoalManagerOpen} />
          <NavItem icon="fa-right-left" label="Transfer" onClick={() => setIsTransferOpen(true)} />
        </nav>
        <div className="mt-auto pt-6 space-y-4">
          <button 
            onClick={() => { setEditingTransaction(null); setIsFormOpen(true); }}
            className="w-full py-4 bg-brand-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-100 dark:shadow-none hover:bg-brand-700 transition-all active:scale-95"
          >
            <i className="fa-solid fa-plus mr-2"></i> New Record
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen">
        <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 py-8 lg:py-12 flex-1">
          <header className="mb-10 lg:hidden flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsProfileOpen(true)} className="h-12 w-12 rounded-2xl overflow-hidden bg-white shadow-md border border-slate-100 flex items-center justify-center text-white shrink-0">
                {userProfile?.avatar.startsWith('data:') ? <img src={userProfile.avatar} className="h-full w-full object-cover" /> : <div className={`h-full w-full flex items-center justify-center ${userProfile?.color || 'bg-brand-500'}`}><i className="fa-solid fa-user"></i></div>}
              </button>
              <div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${greetingData.color}`}>
                  <i className={`fa-solid ${greetingData.icon} mr-1.5`}></i>{greetingData.text}
                </span>
                <h1 className="text-xl font-black text-slate-800 dark:text-white">Artha Tracker</h1>
              </div>
            </div>
            <button 
              onClick={() => setIsNotifOpen(true)}
              className="h-12 w-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 relative active:scale-90 transition-all"
            >
              <i className="fa-solid fa-bell text-lg"></i>
              {unreadNotifCount > 0 && <div className="absolute top-2.5 right-2.5 h-4 w-4 bg-brand-500 text-white text-[8px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#0a0c12] animate-pulse">{unreadNotifCount}</div>}
            </button>
          </header>

          <header className="hidden lg:flex justify-between items-end mb-10">
            <div>
              <p className={`text-sm font-black uppercase tracking-[0.2em] ${greetingData.color}`}>
                <i className={`fa-solid ${greetingData.icon} mr-2`}></i>{greetingData.text}, {userProfile?.name?.split(' ')[0] || 'Guest'}
              </p>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight mt-1">Financial Overview</h2>
            </div>
            <div className="flex items-center gap-3">
               <button onClick={fetchInsights} className="h-11 px-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest shadow-sm hover:border-indigo-200 transition-all flex items-center gap-2 active:scale-95">
                 <i className="fa-solid fa-wand-magic-sparkles"></i> AI Tips
               </button>
               <button 
                  onClick={() => setIsNotifOpen(true)}
                  className="h-11 w-11 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 relative hover:text-brand-500 transition-all active:scale-95"
               >
                  <i className="fa-solid fa-bell text-lg"></i>
                  {unreadNotifCount > 0 && <div className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-brand-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#06080d] animate-bounce">{unreadNotifCount}</div>}
               </button>
               <div className="h-11 w-px bg-slate-100 dark:bg-slate-800 mx-1"></div>
               <div className="text-right">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active System</p>
                 <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{currentBS} BS</p>
               </div>
            </div>
          </header>

          <Dashboard 
            transactions={transactions} categories={categories} budgets={budgets} goals={goals} 
            initialBalances={initialBalances} currentBSDate={currentBS} config={dashboardConfig}
            onBudgetClick={() => setIsBudgetStatusOpen(true)}
          />
        </div>
      </main>

      {/* Global Undo Snackbar */}
      {showUndoSnackbar && (
        <div className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full shadow-2xl z-[3000] flex items-center gap-4 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <span className="text-sm font-bold">Transaction deleted</span>
          <button 
            onClick={handleUndoDelete}
            className="text-brand-400 dark:text-brand-600 font-black text-sm uppercase tracking-wide hover:text-brand-300 dark:hover:text-brand-700"
          >
            Undo
          </button>
          <button 
            onClick={() => setShowUndoSnackbar(false)}
            className="ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-300 dark:hover:text-slate-600"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}

      {/* Floating Action for Mobile */}
      <button onClick={() => { setEditingTransaction(null); setIsFormOpen(true); }} className="lg:hidden fixed bottom-28 right-6 h-16 w-16 bg-brand-600 text-white rounded-[1.8rem] shadow-2xl flex items-center justify-center text-2xl z-40 active:scale-90 transition-all"><i className="fa-solid fa-plus"></i></button>

      {/* Modals & Overlays */}
      {isFormOpen && <TransactionForm categories={categories} transactions={transactions} initialBalances={initialBalances} onAdd={handleAddTransaction} onUpdate={handleUpdateTransaction} initialData={editingTransaction} onClose={() => setIsFormOpen(false)} />}
      {isTransferOpen && <TransferForm transactions={transactions} initialBalances={initialBalances} goals={goals} onTransfer={handleTransfer} onClose={() => setIsTransferOpen(false)} />}
      {isHistoryOpen && <TransactionHistory 
          transactions={transactions} 
          categories={categories} 
          onEdit={(t) => { setEditingTransaction(t); setIsFormOpen(true); }} 
          onDelete={handleDeleteTransaction} 
          onUndo={handleUndoDelete}
          showUndo={showUndoSnackbar}
          onClose={() => setIsHistoryOpen(false)} 
        />}
      {isBudgetStatusOpen && <BudgetStatus transactions={transactions} categories={categories} budgets={budgets} currentBSDate={currentBS} onOpenManager={() => { setIsBudgetStatusOpen(false); setIsBudgetManagerOpen(true); }} onClose={() => setIsBudgetStatusOpen(false)} />}
      {isBudgetManagerOpen && <BudgetManager categories={categories} budgets={budgets} transactions={transactions} onSave={setBudgets} onClose={() => setIsBudgetManagerOpen(false)} currentBSDate={currentBS} />}
      {isGoalManagerOpen && <FinancialGoalManager goals={goals} onSave={setGoals} onClose={() => setIsGoalManagerOpen(false)} />}
      {isCatManagerOpen && (
        <CategoryManager 
          categories={categories} 
          onAdd={(c) => setCategories(prev => [...prev, c])} 
          onUpdate={(c) => setCategories(prev => prev.map(old => old.id === c.id ? c : old))} 
          onDelete={(id) => setCategories(prev => prev.filter(c => c.id !== id))} 
          onReorder={(newCats) => setCategories(newCats)}
          onClose={() => setIsCatManagerOpen(false)} 
        />
      )}
      {isAccountManagerOpen && <AccountSettings initialBalances={initialBalances} onSave={setInitialBalances} onClose={() => setIsAccountManagerOpen(false)} />}
      {isSettingsOpen && <DashboardSettings config={dashboardConfig} onChange={setDashboardConfig} onClose={() => setIsSettingsOpen(false)} appPassword={appPassword} onSetPassword={(p) => { setAppPassword(p); if(p) localStorage.setItem('artha_password', p); else localStorage.removeItem('artha_password'); }} darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} />}
      {isExportOpen && <ExportManager transactions={transactions} categories={categories} onClose={() => setIsExportOpen(false)} currentBSDate={currentBS} />}
      {isProfileOpen && <UserProfileManager profile={userProfile} onSave={setUserProfile} onClose={() => setIsProfileOpen(false)} />}
      {isDevDetailsOpen && <DeveloperDetails onClose={() => setIsDevDetailsOpen(false)} />}
      
      <footer className="lg:hidden fixed bottom-0 inset-x-0 bg-white/80 dark:bg-[#0a0c12]/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 px-2 py-4 flex justify-around items-center z-[100] shadow-lg">
        <button onClick={closeAllModals} className={`flex flex-col items-center gap-1.5 flex-1 ${isAtHome ? 'text-brand-600' : 'text-slate-400'}`}><i className="fa-solid fa-house text-lg"></i><span className="text-[9px] font-black uppercase tracking-widest">Home</span></button>
        <button onClick={() => { closeAllModals(); setIsHistoryOpen(true); }} className={`flex flex-col items-center gap-1.5 flex-1 ${isHistoryOpen ? 'text-indigo-600' : 'text-slate-400'}`}><i className="fa-solid fa-receipt text-lg"></i><span className="text-[9px] font-black uppercase tracking-widest">List</span></button>
        <button onClick={() => { closeAllModals(); setIsGoalManagerOpen(true); }} className={`flex flex-col items-center gap-1.5 flex-1 ${isGoalManagerOpen ? 'text-emerald-600' : 'text-slate-400'}`}><i className="fa-solid fa-bullseye text-lg"></i><span className="text-[9px] font-black uppercase tracking-widest">Goal</span></button>
        <button onClick={() => setIsMoreMenuOpen(true)} className={`flex flex-col items-center gap-1.5 flex-1 ${isMoreMenuOpen ? 'text-slate-800' : 'text-slate-400'}`}><i className="fa-solid fa-bars-staggered text-lg"></i><span className="text-[9px] font-black uppercase tracking-widest">More</span></button>
      </footer>

      {isMoreMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-end justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-sm rounded-[2.5rem] p-6 space-y-1 animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">More Actions</h2><button onClick={() => setIsMoreMenuOpen(false)} className="text-slate-400"><i className="fa-solid fa-xmark"></i></button></div>
            {[
              { label: 'Transfer Funds', icon: 'fa-right-left', color: 'text-indigo-600', onClick: () => { setIsTransferOpen(true); setIsMoreMenuOpen(false); } },
              { label: 'Monthly Budgets', icon: 'fa-chart-pie', color: 'text-rose-600', onClick: () => { setIsBudgetStatusOpen(true); setIsMoreMenuOpen(false); } },
              { label: 'AI Insights', icon: 'fa-wand-magic-sparkles', color: 'text-indigo-600', onClick: () => { setIsInsightsOpen(true); setIsMoreMenuOpen(false); } },
              { label: 'Categories', icon: 'fa-tags', color: 'text-purple-600', onClick: () => { setIsCatManagerOpen(true); setIsMoreMenuOpen(false); } },
              { label: 'Accounts', icon: 'fa-building-columns', color: 'text-slate-600', onClick: () => { setIsAccountManagerOpen(true); setIsMoreMenuOpen(false); } },
              { label: 'Settings', icon: 'fa-gears', color: 'text-slate-600', onClick: () => { setIsSettingsOpen(true); setIsMoreMenuOpen(false); } },
              { label: 'Developer', icon: 'fa-code', color: 'text-orange-600', onClick: () => { setIsDevDetailsOpen(true); setIsMoreMenuOpen(false); } }
            ].map(item => (
              <button key={item.label} onClick={item.onClick} className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all">
                <div className={`h-10 w-10 bg-slate-100 dark:bg-slate-800 ${item.color} rounded-xl flex items-center justify-center`}><i className={`fa-solid ${item.icon}`}></i></div>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
