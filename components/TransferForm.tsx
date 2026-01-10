
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, AccountType, AccountBalances, FinancialGoal } from '../types';
import { getCurrentBSDate, bsToAd } from '../utils/bsCalendar';
import BSDatePicker from './BSDatePicker';

interface TransferFormProps {
  transactions: Transaction[];
  initialBalances: AccountBalances;
  goals: FinancialGoal[];
  onTransfer: (expense: Transaction, destination: Transaction | string) => void;
  onClose: () => void;
}

const TransferForm: React.FC<TransferFormProps> = ({ 
  transactions, 
  initialBalances,
  goals,
  onTransfer, 
  onClose 
}) => {
  const [fromAccount, setFromAccount] = useState<AccountType>(AccountType.BANK);
  const [destType, setDestType] = useState<'ACCOUNT' | 'GOAL'>('ACCOUNT');
  const [toAccount, setToAccount] = useState<AccountType>(AccountType.ESEWA);
  const [toGoalId, setToGoalId] = useState<string>(goals[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [bsDate, setBsDate] = useState(getCurrentBSDate());

  const currentBalance = useMemo(() => {
    let bal = 0;
    if (fromAccount === AccountType.CASH) bal = initialBalances.cash;
    else if (fromAccount === AccountType.BANK) bal = initialBalances.bank;
    else if (fromAccount === AccountType.ESEWA) bal = initialBalances.esewa || 0;
    else if (fromAccount === AccountType.KHALTI) bal = initialBalances.khalti || 0;

    transactions.forEach(t => {
      if (t.account === fromAccount) {
        bal += (t.type === TransactionType.INCOME ? t.amount : -t.amount);
      }
    });
    return bal;
  }, [fromAccount, transactions, initialBalances]);

  const isInsufficient = useMemo(() => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > currentBalance;
  }, [amount, currentBalance]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || isInsufficient) return;
    if (destType === 'ACCOUNT' && fromAccount === toAccount) return;
    if (destType === 'GOAL' && !toGoalId) return;

    const adDate = bsToAd(bsDate);
    const commonId = crypto.randomUUID();

    const expense: Transaction = {
      id: `${commonId}-out`,
      amount: numAmount,
      type: TransactionType.EXPENSE,
      account: fromAccount,
      category: 'transfer-exp',
      description: destType === 'ACCOUNT' ? `Transfer to ${toAccount}` : `Contribution to goal: ${goals.find(g => g.id === toGoalId)?.name}`,
      bsDate,
      adDate
    };

    if (destType === 'ACCOUNT') {
      const income: Transaction = {
        id: `${commonId}-in`,
        amount: numAmount,
        type: TransactionType.INCOME,
        account: toAccount,
        category: 'transfer-inc',
        description: `Transfer from ${fromAccount}`,
        bsDate,
        adDate
      };
      onTransfer(expense, income);
    } else {
      onTransfer(expense, toGoalId);
    }
    
    onClose();
  };

  const accountOptions = [
    { type: AccountType.CASH, label: 'Cash', icon: 'fa-wallet' },
    { type: AccountType.BANK, label: 'Bank', icon: 'fa-building-columns' },
    { type: AccountType.ESEWA, label: 'eSewa', icon: 'fa-wallet' },
    { type: AccountType.KHALTI, label: 'Khalti', icon: 'fa-wallet' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Transfer Funds</h2>
          <button onClick={onClose} className="h-10 w-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">From Source</label>
              <div className="grid grid-cols-2 gap-2">
                {accountOptions.map(opt => (
                  <button
                    key={`from-${opt.type}`}
                    type="button"
                    onClick={() => setFromAccount(opt.type)}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${fromAccount === opt.type ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-50 text-slate-400 hover:bg-slate-50'}`}
                  >
                    <i className={`fa-solid ${opt.icon}`}></i>
                    <span className="text-[10px] font-black uppercase">{opt.label}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[10px] font-bold text-slate-400 text-right">Balance: Rs. {currentBalance.toLocaleString()}</p>
            </div>

            <div className="flex justify-center -my-3 relative z-10">
               <div className="h-10 w-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg ring-4 ring-white">
                  <i className="fa-solid fa-arrow-down"></i>
               </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3 ml-1">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">To Destination</label>
                <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
                  <button 
                    type="button" 
                    onClick={() => setDestType('ACCOUNT')}
                    className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${destType === 'ACCOUNT' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                  >Account</button>
                  <button 
                    type="button" 
                    onClick={() => setDestType('GOAL')}
                    className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${destType === 'GOAL' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                  >Savings Goal</button>
                </div>
              </div>

              {destType === 'ACCOUNT' ? (
                <div className="grid grid-cols-2 gap-2">
                  {accountOptions.map(opt => (
                    <button
                      key={`to-${opt.type}`}
                      type="button"
                      onClick={() => setToAccount(opt.type)}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${toAccount === opt.type ? 'border-emerald-600 bg-emerald-50 text-emerald-600' : 'border-slate-50 text-slate-400 hover:bg-slate-50'}`}
                    >
                      <i className={`fa-solid ${opt.icon}`}></i>
                      <span className="text-[10px] font-black uppercase">{opt.label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {goals.length > 0 ? (
                    <select
                      value={toGoalId}
                      onChange={(e) => setToGoalId(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-600 outline-none font-bold text-sm"
                    >
                      {goals.map(g => (
                        <option key={g.id} value={g.id}>{g.name} (Goal: Rs. {g.targetAmount.toLocaleString()})</option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-center">
                       <p className="text-[10px] font-bold text-amber-700 uppercase">No goals set yet. Go to Goals to create one.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Transfer Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">Rs.</span>
                <input
                  required
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl focus:ring-2 outline-none text-xl font-black transition-all ${isInsufficient ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-200 focus:ring-indigo-600'}`}
                />
              </div>
              {isInsufficient && (
                <p className="text-[10px] font-black text-rose-600 mt-2 uppercase tracking-tight">
                  <i className="fa-solid fa-circle-exclamation mr-1"></i> Insufficient funds in {fromAccount}
                </p>
              )}
              {destType === 'ACCOUNT' && fromAccount === toAccount && (
                <p className="text-[10px] font-black text-amber-600 mt-2 uppercase tracking-tight">
                  <i className="fa-solid fa-triangle-exclamation mr-1"></i> Source and destination must be different
                </p>
              )}
            </div>

            <BSDatePicker label="Transfer Date (BS)" value={bsDate} onChange={setBsDate} />
          </div>

          <button
            type="submit"
            disabled={isInsufficient || (destType === 'ACCOUNT' && fromAccount === toAccount) || !amount || (destType === 'GOAL' && goals.length === 0)}
            className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none uppercase tracking-widest text-sm"
          >
            Confirm Transfer
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransferForm;
