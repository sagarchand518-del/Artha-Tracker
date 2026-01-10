import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, Category, Budget, FinancialGoal, DashboardWidget, WidgetConfig, AccountBalances, AccountType } from '../types';
import { BS_MONTHS } from '../constants';

interface DashboardProps {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  goals: FinancialGoal[];
  initialBalances: AccountBalances;
  currentBSDate: string;
  config: WidgetConfig[];
  onBudgetClick?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  transactions, 
  categories, 
  budgets, 
  goals, 
  initialBalances, 
  currentBSDate, 
  config,
  onBudgetClick
}) => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const separator = currentBSDate.includes('-') ? '-' : '/';
  const [curYear, curMonth] = currentBSDate.split(separator).map(Number);

  const currentBalances = useMemo(() => {
    let cash = initialBalances.cash;
    let bank = initialBalances.bank;
    let esewa = initialBalances.esewa || 0;
    let khalti = initialBalances.khalti || 0;

    transactions.forEach(t => {
      const val = t.type === TransactionType.INCOME ? t.amount : -t.amount;
      if (t.account === AccountType.CASH) cash += val;
      else if (t.account === AccountType.BANK) bank += val;
      else if (t.account === AccountType.ESEWA) esewa += val;
      else if (t.account === AccountType.KHALTI) khalti += val;
    });

    return { cash, bank, esewa, khalti, total: cash + bank + esewa + khalti };
  }, [transactions, initialBalances]);

  const totalIncome = useMemo(() => transactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const totalExpense = useMemo(() => transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0), [transactions]);

  const currentMonthStats = useMemo(() => {
    const monthSpent = transactions.filter(t => {
      if (t.type !== TransactionType.EXPENSE) return false;
      const tSep = t.bsDate.includes('-') ? '-' : '/';
      const [y, m] = t.bsDate.split(tSep).map(Number);
      return y === curYear && m === curMonth;
    }).reduce((sum, t) => sum + t.amount, 0);

    const monthBudget = budgets.filter(b => b.year === curYear && b.month === curMonth)
                              .reduce((sum, b) => sum + b.amount, 0);

    return { monthSpent, monthBudget };
  }, [transactions, budgets, curYear, curMonth]);

  const renderWidget = (widget: WidgetConfig) => {
    if (!widget.visible) return null;

    switch (widget.id) {
      case DashboardWidget.SUMMARY_CARDS:
        const accounts = [
          { type: AccountType.CASH, label: 'Cash', balance: currentBalances.cash, icon: 'fa-wallet', color: 'bg-amber-100/50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200/30' },
          { type: AccountType.BANK, label: 'Bank', balance: currentBalances.bank, icon: 'fa-building-columns', color: 'bg-indigo-100/50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200/30' },
          { type: AccountType.ESEWA, label: 'eSewa', balance: currentBalances.esewa, icon: 'fa-wallet', color: 'bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200/30' },
          { type: AccountType.KHALTI, label: 'Khalti', balance: currentBalances.khalti, icon: 'fa-wallet', color: 'bg-purple-100/50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200/30' },
        ].filter(acc => acc.balance !== 0);

        return (
          <div className="space-y-4 h-full">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-center relative overflow-hidden group min-h-[160px]">
              <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-[0.05] transition-all duration-700 translate-x-2 -translate-y-2">
                <i className="fa-solid fa-piggy-bank text-[8rem] rotate-12"></i>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <button 
                  onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                  className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-brand-500 transition-all shadow-sm active:scale-90"
                >
                  <i className={`fa-solid ${isBalanceVisible ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                </button>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Total Assets</p>
              </div>
              <div className="flex items-baseline gap-1.5 z-10">
                <span className="text-slate-400 dark:text-slate-600 font-bold text-lg">Rs.</span>
                <h3 className={`text-4xl font-black tracking-tight transition-all ${currentBalances.total >= 0 ? 'text-slate-800 dark:text-white' : 'text-rose-600'}`}>
                  {isBalanceVisible ? currentBalances.total.toLocaleString() : '••••••••'}
                </h3>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {accounts.map(acc => (
                <div key={acc.type} className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3 group hover:border-brand-200 dark:hover:border-brand-900 transition-all cursor-default`}>
                  <div className={`h-10 w-10 rounded-xl ${acc.color} border flex items-center justify-center text-sm shadow-sm group-hover:scale-105 transition-transform shrink-0`}>
                    <i className={`fa-solid ${acc.icon}`}></i>
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-400 dark:text-slate-500 text-[9px] font-black uppercase tracking-widest truncate">{acc.label}</p>
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">
                      {isBalanceVisible ? `Rs. ${acc.balance.toLocaleString()}` : 'Rs. ••••'}
                    </h3>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div className="bg-emerald-500/5 dark:bg-emerald-500/5 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-500/10 flex items-center gap-3 group">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-sm shadow-sm group-hover:rotate-6 transition-transform shrink-0">
                    <i className="fa-solid fa-arrow-trend-up"></i>
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase tracking-widest truncate">Income</p>
                    <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 truncate">
                      {isBalanceVisible ? `Rs. ${totalIncome.toLocaleString()}` : 'Rs. ••••'}
                    </p>
                  </div>
               </div>
               <div className="bg-rose-500/5 dark:bg-rose-500/5 p-4 rounded-2xl border border-rose-100 dark:border-rose-500/10 flex items-center gap-3 group">
                  <div className="h-10 w-10 rounded-xl bg-rose-500 text-white flex items-center justify-center text-sm shadow-sm group-hover:rotate-6 transition-transform shrink-0">
                    <i className="fa-solid fa-arrow-trend-down"></i>
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase tracking-widest truncate">Expense</p>
                    <p className="text-sm font-black text-rose-600 dark:text-rose-400 truncate">
                      {isBalanceVisible ? `Rs. ${totalExpense.toLocaleString()}` : 'Rs. ••••'}
                    </p>
                  </div>
               </div>
            </div>
          </div>
        );

      case DashboardWidget.BUDGET_PROGRESS:
        const { monthSpent, monthBudget } = currentMonthStats;
        const utilization = monthBudget > 0 ? Math.min((monthSpent / monthBudget) * 100, 100) : 0;
        const overLimit = monthBudget > 0 && monthSpent > monthBudget;

        return (
          <button 
            key={widget.id} 
            onClick={onBudgetClick}
            className="w-full h-full text-left bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 space-y-4 hover:border-rose-200 dark:hover:border-rose-900 transition-all active:scale-[0.99] group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center text-lg group-hover:scale-105 transition-transform shrink-0">
                  <i className="fa-solid fa-chart-pie"></i>
                </div>
                <div>
                  <h3 className="text-slate-800 dark:text-white text-sm font-black tracking-tight leading-none">Monthly Budget</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {BS_MONTHS[curMonth - 1]} Target
                  </p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${overLimit ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800' : 'bg-brand-50 text-brand-600 border-brand-100 dark:bg-brand-900/20 dark:border-brand-800'}`}>
                {overLimit ? 'Limit Exceeded' : 'On Track'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800/50">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Budget</p>
                <p className="text-sm font-black text-slate-800 dark:text-slate-100">Rs. {monthBudget.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800/50">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Spent</p>
                <p className={`text-sm font-black ${overLimit ? 'text-rose-600' : 'text-slate-800 dark:text-slate-100'}`}>
                  Rs. {monthSpent.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-2 w-full">
              <div className="flex justify-between items-center text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] px-1">
                <span>Usage</span>
                <span className={overLimit ? 'text-rose-600' : 'text-brand-600'}>{Math.round((monthSpent / (monthBudget || 1)) * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${overLimit ? 'bg-rose-500' : 'bg-brand-500'}`}
                  style={{ width: `${utilization}%` }}
                ></div>
              </div>
            </div>
          </button>
        );

      case DashboardWidget.GOALS_SUMMARY:
        return (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 space-y-4 h-full flex flex-col">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center text-lg shrink-0">
                <i className="fa-solid fa-bullseye"></i>
              </div>
              <div>
                <h3 className="text-slate-800 dark:text-white text-sm font-black tracking-tight leading-none">Savings Goals</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Vision</p>
              </div>
            </div>
            <div className="space-y-4 flex-1">
               {goals.length > 0 ? goals.slice(0, 3).map(goal => {
                 const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                 return (
                   <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-2 truncate max-w-[70%]">
                           <div className={`h-5 w-5 rounded-lg ${goal.color} flex items-center justify-center text-white text-[8px] shrink-0 shadow-sm`}>
                              <i className={`fa-solid ${goal.icon}`}></i>
                           </div>
                           <span className="truncate">{goal.name}</span>
                        </span>
                        <span className="bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${goal.color} transition-all duration-1000`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                   </div>
                 );
               }) : (
                 <div className="h-full flex flex-col items-center justify-center py-6 text-center bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                   <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">No active goals</p>
                 </div>
               )}
            </div>
          </div>
        );

      case DashboardWidget.INCOME_COMPARISON:
         // This widget is currently not utilized in the default view logic or data props in App.tsx
         // but if enabled via config, it should render blank or placeholder if no logic passed
         // Since logic is not fully passed in this version of Dashboard.tsx (simplified for this task), 
         // I'll render a placeholder or the actual component if we had the logic from the previous iteration.
         // Re-implementing the component from the read file context:
         return (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 space-y-4 h-full">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center text-lg shadow-sm">
                  <i className="fa-solid fa-chart-line"></i>
                </div>
                <div>
                  <h3 className="text-slate-800 dark:text-white text-sm font-black tracking-tight leading-none">Analysis</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Income Trends</p>
                </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 relative group overflow-hidden h-full flex flex-col justify-center">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly</p>
                 <p className="text-xl font-black text-slate-800 dark:text-white">
                   {isBalanceVisible ? `Rs. ${totalIncome.toLocaleString()}` : '••••••'}
                 </p>
                 <p className="text-[9px] text-slate-400 font-bold mt-1">Current Month Income</p>
            </div>
          </div>
         );

      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
      {config.map(widget => {
         const component = renderWidget(widget);
         if (!component) return null;
         
         const isFullWidth = widget.id === DashboardWidget.SUMMARY_CARDS;
         
         return (
           <div key={widget.id} className={isFullWidth ? "col-span-1 xl:col-span-2" : "col-span-1"}>
             {component}
           </div>
         );
      })}
    </div>
  );
};

export default Dashboard;