
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
}

const Dashboard: React.FC<DashboardProps> = ({ 
  transactions, 
  categories, 
  budgets, 
  goals, 
  initialBalances, 
  currentBSDate, 
  config
}) => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const separator = currentBSDate.includes('-') ? '-' : '/';
  const [curYear, curMonth] = currentBSDate.split(separator).map(Number);

  // Helper to calculate total current balance
  const getTotalBalances = () => {
    let cash = initialBalances.cash;
    let bank = initialBalances.bank;

    transactions.forEach(t => {
      const val = t.type === TransactionType.INCOME ? t.amount : -t.amount;
      if (t.account === AccountType.CASH) cash += val;
      else bank += val;
    });

    return { cash, bank, total: cash + bank };
  };

  const currentBalances = getTotalBalances();

  // Totals for Summary Display
  const totalIncome = transactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);

  // Comparison Calculations
  const comparisonData = useMemo(() => {
    const incomeTransactions = transactions.filter(t => t.type === TransactionType.INCOME);
    
    // Month Helpers
    const prevMonth = curMonth === 1 ? 12 : curMonth - 1;
    const yearForPrevMonth = curMonth === 1 ? curYear - 1 : curYear;

    const curMonthIncome = incomeTransactions
      .filter(t => {
        const tSep = t.bsDate.includes('-') ? '-' : '/';
        const [y, m] = t.bsDate.split(tSep).map(Number);
        return y === curYear && m === curMonth;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const prevMonthIncome = incomeTransactions
      .filter(t => {
        const tSep = t.bsDate.includes('-') ? '-' : '/';
        const [y, m] = t.bsDate.split(tSep).map(Number);
        return y === yearForPrevMonth && m === prevMonth;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const curYearIncome = incomeTransactions
      .filter(t => {
        const tSep = t.bsDate.includes('-') ? '-' : '/';
        const [y] = t.bsDate.split(tSep).map(Number);
        return y === curYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const prevYearIncome = incomeTransactions
      .filter(t => {
        const tSep = t.bsDate.includes('-') ? '-' : '/';
        const [y] = t.bsDate.split(tSep).map(Number);
        return y === curYear - 1;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const calcChange = (cur: number, prev: number) => {
      if (prev === 0) return cur > 0 ? 100 : 0;
      return ((cur - prev) / prev) * 100;
    };

    return {
      monthly: { current: curMonthIncome, previous: prevMonthIncome, change: calcChange(curMonthIncome, prevMonthIncome) },
      annual: { current: curYearIncome, previous: prevYearIncome, change: calcChange(curYearIncome, prevYearIncome) }
    };
  }, [transactions, curYear, curMonth]);

  // Budget Calculations
  const currentMonthBudgets = budgets.filter(b => b.year === curYear && b.month === curMonth);
  const totalMonthlyBudget = currentMonthBudgets.reduce((sum, b) => sum + b.amount, 0);
  const totalMonthlySpent = transactions.filter(t => {
    if (t.type !== TransactionType.EXPENSE) return false;
    const tSep = t.bsDate.includes('-') ? '-' : '/';
    const [y, m] = t.bsDate.split(tSep).map(Number);
    return y === curYear && m === curMonth;
  }).reduce((sum, t) => sum + t.amount, 0);
  
  const budgetUtilization = totalMonthlyBudget > 0 ? Math.min((totalMonthlySpent / totalMonthlyBudget) * 100, 100) : 0;
  const isOverBudget = totalMonthlyBudget > 0 && totalMonthlySpent > totalMonthlyBudget;

  const renderWidget = (widget: WidgetConfig) => {
    if (!widget.visible) return null;

    switch (widget.id) {
      case DashboardWidget.SUMMARY_CARDS:
        return (
          <div key={widget.id} className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                <i className="fa-solid fa-coins text-5xl rotate-12"></i>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <button 
                  onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                  className="h-5 w-5 flex items-center justify-center rounded-md bg-slate-50 text-slate-400 hover:text-indigo-600 transition-colors shadow-sm"
                >
                  <i className={`fa-solid ${isBalanceVisible ? 'fa-eye-slash' : 'fa-eye'} text-[9px]`}></i>
                </button>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Available</p>
              </div>
              <h3 className={`text-2xl font-black transition-all ${currentBalances.total >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                {isBalanceVisible ? `Rs. ${currentBalances.total.toLocaleString()}` : 'Rs. ••••••••'}
              </h3>
            </div>
            
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg shrink-0">
                <i className="fa-solid fa-wallet"></i>
              </div>
              <div className="min-w-0">
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-tight">Cash Balance</p>
                <h3 className="text-lg font-extrabold text-slate-800 truncate">
                  {isBalanceVisible ? `Rs. ${currentBalances.cash.toLocaleString()}` : 'Rs. •••••'}
                </h3>
              </div>
            </div>

            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg shrink-0">
                <i className="fa-solid fa-building-columns"></i>
              </div>
              <div className="min-w-0">
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-tight">Bank Balance</p>
                <h3 className="text-lg font-extrabold text-slate-800 truncate">
                  {isBalanceVisible ? `Rs. ${currentBalances.bank.toLocaleString()}` : 'Rs. •••••'}
                </h3>
              </div>
            </div>

            <div className="col-span-2 lg:col-span-3 grid grid-cols-2 gap-3 mt-1">
              <div className="bg-green-50/50 p-3 rounded-2xl flex items-center gap-3">
                <div className="h-7 w-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px]">
                  <i className="fa-solid fa-arrow-down"></i>
                </div>
                <div>
                  <p className="text-slate-400 text-[9px] font-bold uppercase">Income</p>
                  <p className="text-sm font-bold text-green-600">
                    {isBalanceVisible ? `Rs. ${totalIncome.toLocaleString()}` : 'Rs. •••••'}
                  </p>
                </div>
              </div>
              <div className="bg-red-50/50 p-3 rounded-2xl flex items-center gap-3">
                <div className="h-7 w-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-[10px]">
                  <i className="fa-solid fa-arrow-up"></i>
                </div>
                <div>
                  <p className="text-slate-400 text-[9px] font-bold uppercase">Expense</p>
                  <p className="text-sm font-bold text-red-600">
                    {isBalanceVisible ? `Rs. ${totalExpense.toLocaleString()}` : 'Rs. •••••'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case DashboardWidget.INCOME_COMPARISON:
        const showAnnual = comparisonData.annual.previous > 0;
        return (
          <div key={widget.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-sm">
                  <i className="fa-solid fa-chart-line"></i>
                </div>
                <div>
                  <h3 className="text-slate-800 font-black tracking-tight leading-none">Income Insights</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Growth Analysis</p>
                </div>
            </div>

            <div className={`grid grid-cols-1 ${showAnnual ? 'md:grid-cols-2' : ''} gap-4`}>
              {/* Monthly Comparison */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Trend</p>
                    <p className="text-lg font-black text-slate-800">Rs. {comparisonData.monthly.current.toLocaleString()}</p>
                    <p className="text-[9px] text-slate-400 font-bold">vs Rs. {comparisonData.monthly.previous.toLocaleString()} (Last Month)</p>
                  </div>
                  {comparisonData.monthly.previous > 0 && (
                    <div className={`px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] font-black ${comparisonData.monthly.change >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      <i className={`fa-solid ${comparisonData.monthly.change >= 0 ? 'fa-caret-up' : 'fa-caret-down'}`}></i>
                      {Math.abs(Math.round(comparisonData.monthly.change))}%
                    </div>
                  )}
                </div>
              </div>

              {/* Annual Comparison - Only visible if previous year data exists */}
              {showAnnual && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Annual Trend</p>
                      <p className="text-lg font-black text-slate-800">Rs. {comparisonData.annual.current.toLocaleString()}</p>
                      <p className="text-[9px] text-slate-400 font-bold">vs Rs. {comparisonData.annual.previous.toLocaleString()} (Last Year)</p>
                    </div>
                    <div className={`px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] font-black ${comparisonData.annual.change >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      <i className={`fa-solid ${comparisonData.annual.change >= 0 ? 'fa-caret-up' : 'fa-caret-down'}`}></i>
                      {Math.abs(Math.round(comparisonData.annual.change))}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case DashboardWidget.BUDGET_PROGRESS:
        return (
          <div key={widget.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center text-xl">
                  <i className="fa-solid fa-chart-pie"></i>
                </div>
                <div>
                  <h3 className="text-slate-800 font-black tracking-tight leading-none">Monthly Budget</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {BS_MONTHS[curMonth - 1]} {curYear}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg ${isOverBudget ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {isOverBudget ? 'Over Budget' : 'On Track'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Budget</p>
                <p className="text-xl font-black text-slate-800">Rs. {totalMonthlyBudget.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Spent So Far</p>
                <p className={`text-xl font-black ${isOverBudget ? 'text-rose-600' : 'text-slate-800'}`}>
                  Rs. {totalMonthlySpent.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                <span>Usage</span>
                <span>{Math.round((totalMonthlySpent / (totalMonthlyBudget || 1)) * 100)}%</span>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${isOverBudget ? 'bg-gradient-to-r from-rose-500 to-red-600' : 'bg-gradient-to-r from-indigo-500 to-purple-600'}`}
                  style={{ width: `${budgetUtilization}%` }}
                ></div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      {config.map(renderWidget)}
    </div>
  );
};

export default Dashboard;
