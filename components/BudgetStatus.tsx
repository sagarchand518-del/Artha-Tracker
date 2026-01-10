
import React from 'react';
import { Transaction, Category, Budget, TransactionType } from '../types';
import { BS_MONTHS } from '../constants';

interface BudgetStatusProps {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  currentBSDate: string;
  onOpenManager: () => void;
  onClose: () => void;
}

const BudgetStatus: React.FC<BudgetStatusProps> = ({ 
  transactions, 
  categories, 
  budgets, 
  currentBSDate, 
  onOpenManager, 
  onClose 
}) => {
  const separator = currentBSDate.includes('-') ? '-' : '/';
  const [curYear, curMonth] = currentBSDate.split(separator).map(Number);

  // Current Month Data
  const monthlyTransactions = transactions.filter(t => {
    const tSep = t.bsDate.includes('-') ? '-' : '/';
    const [y, m] = t.bsDate.split(tSep).map(Number);
    return y === curYear && m === curMonth;
  });

  const currentMonthBudgets = budgets.filter(b => b.year === curYear && b.month === curMonth);
  const budgetProgress = currentMonthBudgets.map(budget => {
    const spent = monthlyTransactions
      .filter(t => t.type === TransactionType.EXPENSE && t.category === budget.categoryId)
      .reduce((sum, t) => sum + t.amount, 0);
    const category = categories.find(c => c.id === budget.categoryId);
    return {
      ...budget,
      spent,
      category,
      percentage: Math.min((spent / budget.amount) * 100, 100),
      isOver: spent > budget.amount
    };
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Budget Status</h2>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded uppercase tracking-wider">
                  {BS_MONTHS[curMonth - 1]} {curYear}
                </span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {budgetProgress.length > 0 ? (
            <div className="space-y-8">
              {budgetProgress.map(bp => (
                <div key={bp.id} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl ${bp.category?.color || 'bg-slate-400'} flex items-center justify-center text-white shadow-sm`}>
                        <i className={`fa-solid ${bp.category?.icon} text-sm`}></i>
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{bp.category?.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target: Rs. {bp.amount.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-base font-black ${bp.isOver ? 'text-red-600' : 'text-slate-700'}`}>
                        Rs. {bp.spent.toLocaleString()}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                        {Math.round(bp.percentage)}% Consumed
                      </p>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner p-[2px]">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ease-out ${bp.isOver ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-gradient-to-r from-indigo-500 to-blue-600 shadow-[0_0_8px_rgba(79,70,229,0.3)]'}`}
                      style={{ width: `${bp.percentage}%` }}
                    ></div>
                  </div>
                  {bp.isOver && (
                    <p className="text-[10px] font-black text-red-500 flex items-center gap-1.5 animate-pulse px-1">
                      <i className="fa-solid fa-triangle-exclamation"></i>
                      BUDGET EXCEEDED BY RS. {(bp.spent - bp.amount).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 text-center">
              <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-200">
                <i className="fa-solid fa-bullseye text-4xl"></i>
              </div>
              <p className="font-black text-slate-800 text-lg mb-1">No Budgets Found</p>
              <p className="text-sm font-medium text-slate-400 max-w-[200px] mb-8">
                You haven't set any spending limits for {BS_MONTHS[curMonth - 1]}.
              </p>
              <button 
                onClick={onOpenManager}
                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                Set Budgets Now
              </button>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-white sticky bottom-0 flex gap-4">
          <button
            type="button"
            onClick={onOpenManager}
            className="flex-1 py-4 bg-slate-50 text-slate-600 border border-slate-200 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all active:scale-[0.98]"
          >
            Manage Targets
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-50 hover:bg-indigo-700 transition-all active:scale-[0.98]"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetStatus;
