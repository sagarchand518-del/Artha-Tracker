
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, Category } from '../types';

interface TransactionHistoryProps {
  transactions: Transaction[];
  categories: Category[];
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
  onClose: () => void;
}

type SortKey = 'date' | 'amount' | 'category';
type SortOrder = 'asc' | 'desc';

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ 
  transactions, 
  categories, 
  onEdit, 
  onDelete, 
  onClose 
}) => {
  const [sortBy, setSortBy] = useState<SortKey>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterCategory, setFilterCategory] = useState<string | 'all'>('all');
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  const getCategoryInfo = (id: string, type: TransactionType) => {
    return categories.find(c => c.id === id) || 
           { id: 'other', name: 'Other', icon: 'fa-question', color: 'bg-slate-400', type: TransactionType.EXPENSE };
  };

  const filteredAndSortedTransactions = useMemo(() => {
    let list = [...transactions];
    
    // Filter by Category
    if (filterCategory !== 'all') {
      list = list.filter(t => t.category === filterCategory);
    }

    // Sort
    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') comparison = a.adDate.getTime() - b.adDate.getTime();
      else if (sortBy === 'amount') comparison = a.amount - b.amount;
      else if (sortBy === 'category') {
        const catA = getCategoryInfo(a.category, a.type).name.toLowerCase();
        const catB = getCategoryInfo(b.category, b.type).name.toLowerCase();
        comparison = catA.localeCompare(catB);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return list;
  }, [transactions, sortBy, sortOrder, filterCategory, categories]);

  const confirmDelete = () => {
    if (transactionToDelete) {
      onDelete(transactionToDelete);
      setTransactionToDelete(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Transaction History</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Detailed record of all entries</p>
          </div>
          <button 
            onClick={onClose} 
            className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200/50 gap-1">
            {(['date', 'amount', 'category'] as SortKey[]).map(key => (
              <button 
                key={key} 
                onClick={() => setSortBy(key)} 
                className={`px-4 py-1.5 rounded-lg capitalize text-[10px] font-black transition-all ${sortBy === key ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                {key}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} 
            className="h-9 w-9 flex items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm text-indigo-600 active:scale-95 transition-all"
          >
            <i className={`fa-solid ${sortOrder === 'asc' ? 'fa-arrow-up-wide-short' : 'fa-arrow-down-wide-short'}`}></i>
          </button>
        </div>

        {/* Category Filter Scroll */}
        <div className="bg-white px-4 py-3 border-b border-slate-100 overflow-x-auto no-scrollbar flex gap-2 shrink-0">
          <button 
            onClick={() => setFilterCategory('all')}
            className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${filterCategory === 'all' ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${filterCategory === cat.id ? `${cat.color} text-white shadow-md` : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
            >
              <i className={`fa-solid ${cat.icon}`}></i>
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredAndSortedTransactions.length > 0 ? (
            <div className="space-y-2">
              {filteredAndSortedTransactions.map((t) => {
                const cat = getCategoryInfo(t.category, t.type);
                return (
                  <div key={t.id} className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center group hover:bg-slate-50 transition-colors">
                    <div className={`h-11 w-11 rounded-xl ${cat.color} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                      <i className={`fa-solid ${cat.icon} text-lg`}></i>
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 truncate">
                          <p className="font-bold text-slate-800 truncate text-sm">{t.description || cat.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {t.bsDate} • {cat.name} • <span className="text-slate-500">{t.account}</span>
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className={`font-black text-sm ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-slate-800'}`}>
                            {t.type === TransactionType.INCOME ? '+' : '-'} Rs. {t.amount.toLocaleString()}
                          </p>
                          <div className="flex justify-end gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onEdit(t)} className="h-6 w-6 flex items-center justify-center bg-indigo-50 text-indigo-500 rounded-lg hover:bg-indigo-600 hover:text-white transition-all">
                              <i className="fa-solid fa-pen text-[10px]"></i>
                            </button>
                            <button onClick={() => setTransactionToDelete(t)} className="h-6 w-6 flex items-center justify-center bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-600 hover:text-white transition-all">
                              <i className="fa-solid fa-trash text-[10px]"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <i className="fa-solid fa-receipt text-6xl mb-4 opacity-20"></i>
              <p className="font-bold">No transactions found</p>
              {filterCategory !== 'all' && (
                <button 
                  onClick={() => setFilterCategory('all')}
                  className="mt-4 text-xs font-bold text-indigo-600 underline"
                >
                  Clear filter
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {transactionToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 text-center space-y-6 animate-in zoom-in duration-200">
            <div className="h-20 w-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
              <i className="fa-solid fa-trash-can"></i>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Delete Record?</h3>
              <p className="text-sm text-slate-500 font-medium mt-2">
                This transaction will be removed. You can undo this for a few seconds.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmDelete} 
                className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-100 transition-all active:scale-95"
              >
                Delete Now
              </button>
              <button 
                onClick={() => setTransactionToDelete(null)} 
                className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default TransactionHistory;
