import React, { useState, useEffect, useMemo } from 'react';
import { TransactionType, Transaction, Category, AccountType, AccountBalances } from '../types';
import { bsToAd, adToBs, getCurrentBSDate, formatNepaliCurrency } from '../utils/bsCalendar';
import BSDatePicker from './BSDatePicker';

interface TransactionFormProps {
  categories: Category[];
  transactions: Transaction[];
  initialBalances: AccountBalances;
  onAdd: (t: Transaction) => void;
  onUpdate?: (t: Transaction) => void;
  onClose: () => void;
  initialData?: Transaction | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ 
  categories, 
  transactions,
  initialBalances,
  onAdd, 
  onUpdate, 
  onClose, 
  initialData 
}) => {
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [account, setAccount] = useState<AccountType>(AccountType.CASH);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [description, setDescription] = useState('');
  const [bsDate, setBsDate] = useState(getCurrentBSDate());
  const [dateMode, setDateMode] = useState<'BS' | 'AD'>('BS');

  // Convert current BS state to AD for the native input
  const adValue = useMemo(() => {
    try {
      const date = bsToAd(bsDate);
      return date.toISOString().split('T')[0];
    } catch (e) {
      return new Date().toISOString().split('T')[0];
    }
  }, [bsDate]);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAccount(initialData.account || AccountType.CASH);
      setAmount(initialData.amount.toFixed(2));
      setCategory(initialData.category);
      setDescription(initialData.description);
      setBsDate(initialData.bsDate);
    } else {
      // Default category for Expense is food, for Income is salary
      const defaultCat = type === TransactionType.EXPENSE ? 'food' : 'salary';
      setCategory(defaultCat);
    }
  }, [initialData, type]);

  const filteredCategories = categories.filter(c => c.type === type);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const firstCat = categories.filter(c => c.type === newType)[0];
    if (firstCat) setCategory(firstCat.id);
  };

  const handleAdDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAd = new Date(e.target.value);
    if (!isNaN(newAd.getTime())) {
      setBsDate(adToBs(newAd));
    }
  };

  const isInsufficient = useMemo(() => {
    if (type !== TransactionType.EXPENSE) return false;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return false;

    let currentBalance = 0;
    if (account === AccountType.CASH) currentBalance = initialBalances.cash;
    else if (account === AccountType.BANK) currentBalance = initialBalances.bank;
    else if (account === AccountType.ESEWA) currentBalance = initialBalances.esewa || 0;
    else if (account === AccountType.KHALTI) currentBalance = initialBalances.khalti || 0;

    transactions.forEach(t => {
      if (initialData && t.id === initialData.id) return;

      if (t.account === account) {
        if (t.type === TransactionType.INCOME) currentBalance += t.amount;
        else currentBalance -= t.amount;
      }
    });

    return numAmount > currentBalance;
  }, [amount, type, account, transactions, initialBalances, initialData]);

  const handleAmountBlur = () => {
    const num = parseFloat(amount);
    if (!isNaN(num)) {
      setAmount(num.toFixed(2));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    if (isInsufficient) return;

    const transactionData: Transaction = {
      id: initialData ? initialData.id : crypto.randomUUID(),
      amount: Math.abs(Number(amount)),
      type,
      account,
      category,
      description,
      bsDate,
      adDate: bsToAd(bsDate)
    };

    if (initialData && onUpdate) {
      onUpdate(transactionData);
    } else {
      onAdd(transactionData);
    }
    onClose();
  };

  // Determine theme colors based on type
  const activeColorClass = type === TransactionType.EXPENSE ? 'text-rose-600' : 'text-emerald-600';
  const activeButtonClass = type === TransactionType.EXPENSE ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700';

  const accountOptions = [
    { 
      id: AccountType.CASH, 
      label: 'Cash', 
      icon: 'fa-wallet', 
      activeClass: 'border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-200',
      inactiveClass: 'border-slate-200 text-slate-500 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600'
    },
    { 
      id: AccountType.BANK, 
      label: 'Bank', 
      icon: 'fa-building-columns', 
      activeClass: 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200',
      inactiveClass: 'border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600'
    },
    { 
      id: AccountType.ESEWA, 
      label: 'eSewa', 
      icon: 'fa-wallet', 
      activeClass: 'border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-200',
      inactiveClass: 'border-slate-200 text-slate-500 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600'
    },
    { 
      id: AccountType.KHALTI, 
      label: 'Khalti', 
      icon: 'fa-wallet', 
      activeClass: 'border-purple-600 bg-purple-600 text-white shadow-md shadow-purple-200',
      inactiveClass: 'border-slate-200 text-slate-500 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-600'
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {initialData ? 'Edit Entry' : 'New Entry'}
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
                <span className={`text-[9px] font-black ${type === TransactionType.EXPENSE ? 'text-rose-600 bg-rose-50' : 'text-emerald-600 bg-emerald-50'} px-1.5 py-0.5 rounded uppercase`}>
                  {dateMode === 'BS' ? 'Bikram Sambat' : 'Gregorian AD'}
                </span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entry Date</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex p-1.5 bg-slate-100 rounded-[1.5rem] border border-slate-200/50 shadow-inner">
            <button
              type="button"
              onClick={() => handleTypeChange(TransactionType.EXPENSE)}
              className={`flex-1 py-3 text-sm font-black rounded-[1.2rem] transition-all ${type === TransactionType.EXPENSE ? 'bg-white text-rose-600 shadow-md ring-1 ring-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <i className="fa-solid fa-arrow-up-from-bracket mr-2"></i>Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange(TransactionType.INCOME)}
              className={`flex-1 py-3 text-sm font-black rounded-[1.2rem] transition-all ${type === TransactionType.INCOME ? 'bg-white text-emerald-600 shadow-md ring-1 ring-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <i className="fa-solid fa-arrow-down-to-bracket mr-2"></i>Income
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Account</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {accountOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAccount(opt.id)}
                    className={`py-3 rounded-2xl border-2 font-bold flex flex-col items-center justify-center gap-1 transition-all relative ${account === opt.id ? opt.activeClass : opt.inactiveClass}`}
                  >
                    {account === opt.id && (
                      <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-white shadow-sm animate-in zoom-in duration-200"></div>
                    )}
                    <i className={`fa-solid ${opt.icon}`}></i>
                    <span className="text-[10px] uppercase">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-slate-700">Amount</label>
                <span className={`text-xs font-black transition-all ${activeColorClass}`}>
                  {formatNepaliCurrency(amount || 0)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">Rs.</span>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onBlur={handleAmountBlur}
                  placeholder="0.00"
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl focus:ring-2 outline-none text-2xl font-black transition-all ${isInsufficient ? 'border-red-500 bg-red-50 text-red-700 focus:ring-red-500' : `border-slate-200 text-slate-800 ${type === TransactionType.EXPENSE ? 'focus:ring-rose-500' : 'focus:ring-emerald-500'}`}`}
                />
              </div>
              {isInsufficient && (
                <p className="mt-2 text-[10px] font-black text-red-500 flex items-center gap-1 animate-pulse uppercase tracking-tight">
                  <i className="fa-solid fa-circle-exclamation"></i> Insufficient balance
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <label className="text-sm font-bold text-slate-700">Date</label>
                <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => setDateMode('BS')}
                    className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${dateMode === 'BS' ? `bg-white ${activeColorClass} shadow-sm ring-1 ring-slate-200` : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    B.S.
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateMode('AD')}
                    className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${dateMode === 'AD' ? `bg-white ${activeColorClass} shadow-sm ring-1 ring-slate-200` : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    A.D.
                  </button>
                </div>
              </div>
              
              {dateMode === 'BS' ? (
                <BSDatePicker value={bsDate} onChange={setBsDate} />
              ) : (
                <div className="relative group">
                  <input
                    type="date"
                    value={adValue}
                    onChange={handleAdDateChange}
                    className={`w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 ${type === TransactionType.EXPENSE ? 'focus:ring-rose-500' : 'focus:ring-emerald-500'} focus:bg-white outline-none cursor-pointer transition-all text-slate-700 font-bold`}
                  />
                  <div className={`absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center text-slate-400 transition-colors pointer-events-none ${type === TransactionType.EXPENSE ? 'group-hover:text-rose-600' : 'group-hover:text-emerald-600'}`}>
                    <i className="fa-solid fa-calendar-day text-xl"></i>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Category</label>
              <div className="grid grid-cols-4 gap-2">
                {filteredCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${category === cat.id ? `border-indigo-600 bg-indigo-50 ${activeColorClass} shadow-sm` : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}`}
                  >
                    <div className={`h-8 w-8 rounded-lg ${cat.color} flex items-center justify-center text-white text-xs mb-2`}>
                      <i className={`fa-solid ${cat.icon}`}></i>
                    </div>
                    <span className="text-[9px] font-black uppercase truncate w-full text-center tracking-tighter">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Note (Optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What was this for?"
                className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 ${type === TransactionType.EXPENSE ? 'focus:ring-rose-500' : 'focus:ring-emerald-500'} outline-none text-sm font-medium`}
              />
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-slate-100 bg-white sticky bottom-0">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isInsufficient}
            className={`w-full py-5 text-white rounded-[1.5rem] font-black text-lg shadow-xl transition-all active:scale-[0.98] ${isInsufficient ? 'bg-slate-300 cursor-not-allowed shadow-none' : `${activeButtonClass} ${type === TransactionType.EXPENSE ? 'shadow-rose-100' : 'shadow-emerald-100'}`}`}
          >
            {isInsufficient ? 'Insufficient Funds' : (initialData ? 'Update Record' : 'Save Transaction')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;