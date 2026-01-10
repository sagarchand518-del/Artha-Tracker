
import React, { useState } from 'react';
import { AccountBalances } from '../types';

interface AccountSettingsProps {
  initialBalances: AccountBalances;
  onSave: (balances: AccountBalances) => void;
  onClose: () => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ initialBalances, onSave, onClose }) => {
  const [cash, setCash] = useState(initialBalances.cash.toString());
  const [bank, setBank] = useState(initialBalances.bank.toString());
  const [esewa, setEsewa] = useState((initialBalances.esewa || 0).toString());
  const [khalti, setKhalti] = useState((initialBalances.khalti || 0).toString());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      cash: parseFloat(cash) || 0,
      bank: parseFloat(bank) || 0,
      esewa: parseFloat(esewa) || 0,
      khalti: parseFloat(khalti) || 0
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Manage Accounts</h2>
            <p className="text-sm text-slate-500 font-medium">Set starting balances</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="bg-amber-50/30 p-4 rounded-2xl border border-amber-100">
            <label className="flex items-center gap-2 text-sm font-bold text-amber-700 mb-2">
              <i className="fa-solid fa-wallet"></i> Starting Cash Balance
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rs.</span>
              <input
                type="number"
                value={cash}
                onChange={(e) => setCash(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-bold"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100">
            <label className="flex items-center gap-2 text-sm font-bold text-blue-700 mb-2">
              <i className="fa-solid fa-building-columns"></i> Starting Bank Balance
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rs.</span>
              <input
                type="number"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="bg-green-50/30 p-4 rounded-2xl border border-green-100">
            <label className="flex items-center gap-2 text-sm font-bold text-green-700 mb-2">
              <i className="fa-solid fa-wallet text-green-600"></i> Starting eSewa Balance
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rs.</span>
              <input
                type="number"
                value={esewa}
                onChange={(e) => setEsewa(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-bold"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="bg-purple-50/30 p-4 rounded-2xl border border-purple-100">
            <label className="flex items-center gap-2 text-sm font-bold text-purple-700 mb-2">
              <i className="fa-solid fa-wallet text-purple-600"></i> Starting Khalti Balance
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rs.</span>
              <input
                type="number"
                value={khalti}
                onChange={(e) => setKhalti(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-bold"
                placeholder="0.00"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all active:scale-95 mt-4"
          >
            Save Account Settings
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccountSettings;
