
import React, { useState } from 'react';
import { FinancialGoal } from '../types';
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from '../constants';
import BSDatePicker from './BSDatePicker';

interface FinancialGoalManagerProps {
  goals: FinancialGoal[];
  onSave: (goals: FinancialGoal[]) => void;
  onClose: () => void;
}

const FinancialGoalManager: React.FC<FinancialGoalManagerProps> = ({ goals, onSave, onClose }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDateBS, setTargetDateBS] = useState('');
  const [icon, setIcon] = useState(AVAILABLE_ICONS[2]); // Default home icon
  const [color, setColor] = useState(AVAILABLE_COLORS[12]); // Default indigo

  const resetForm = () => {
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setTargetDateBS('');
    setIcon(AVAILABLE_ICONS[2]);
    setColor(AVAILABLE_COLORS[12]);
    setEditingGoal(null);
    setIsAdding(false);
  };

  const handleEdit = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setCurrentAmount(goal.currentAmount.toString());
    setTargetDateBS(goal.targetDateBS);
    setIcon(goal.icon);
    setColor(goal.color);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      onSave(goals.filter(g => g.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newGoal: FinancialGoal = {
      id: editingGoal?.id || crypto.randomUUID(),
      name,
      targetAmount: parseFloat(targetAmount) || 0,
      currentAmount: parseFloat(currentAmount) || 0,
      targetDateBS,
      icon,
      color
    };

    if (editingGoal) {
      onSave(goals.map(g => g.id === editingGoal.id ? newGoal : g));
    } else {
      onSave([...goals, newGoal]);
    }
    resetForm();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Savings Goals</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Track your future milestones</p>
          </div>
          <button 
            onClick={onClose} 
            className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!isAdding ? (
            <div className="space-y-4">
              <button 
                onClick={() => setIsAdding(true)}
                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 group"
              >
                <div className="h-8 w-8 rounded-full bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center transition-colors">
                  <i className="fa-solid fa-plus"></i>
                </div>
                <span>Set New Goal</span>
              </button>

              {goals.length === 0 ? (
                <div className="py-12 text-center text-slate-400 italic">
                  No goals set yet. Start dreaming!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goals.map(goal => {
                    const progress = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
                    return (
                      <div key={goal.id} className="bg-white border border-slate-100 p-5 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow relative group">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`h-12 w-12 rounded-2xl ${goal.color} flex items-center justify-center text-white shadow-md`}>
                            <i className={`fa-solid ${goal.icon} text-xl`}></i>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(goal)} className="p-2 text-indigo-400 hover:text-indigo-600"><i className="fa-solid fa-pen"></i></button>
                            <button onClick={() => handleDelete(goal.id)} className="p-2 text-rose-400 hover:text-rose-600"><i className="fa-solid fa-trash"></i></button>
                          </div>
                        </div>
                        <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight truncate">{goal.name}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">By {goal.targetDateBS}</p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm font-bold">
                            <span className="text-slate-600">Rs. {goal.currentAmount.toLocaleString()}</span>
                            <span className="text-slate-400">Target: {goal.targetAmount.toLocaleString()}</span>
                          </div>
                          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-[2px]">
                            <div 
                              className={`h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-1000`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <div className="text-right">
                             <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">{progress}% Complete</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-4 mb-4">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-slate-600"
                >
                  <i className="fa-solid fa-arrow-left"></i>
                </button>
                <h3 className="font-black text-slate-700 uppercase tracking-widest text-sm">
                  {editingGoal ? 'Edit Goal' : 'Create New Goal'}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Goal Name</label>
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. New Car, Vacation"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Target Amount (Rs.)</label>
                    <input
                      required
                      type="number"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none font-black text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Current Savings (Rs.)</label>
                    <input
                      type="number"
                      value={currentAmount}
                      onChange={(e) => setCurrentAmount(e.target.value)}
                      placeholder="Amount already saved"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <BSDatePicker 
                    label="Target Completion Date (BS)"
                    value={targetDateBS}
                    onChange={setTargetDateBS}
                  />

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Pick Icon</label>
                    <div className="grid grid-cols-6 gap-2 h-32 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-100">
                      {AVAILABLE_ICONS.map(i => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setIcon(i)}
                          className={`h-10 flex items-center justify-center rounded-xl transition-all ${icon === i ? 'bg-indigo-600 text-white shadow-md scale-105' : 'bg-white text-slate-400 hover:bg-slate-100'}`}
                        >
                          <i className={`fa-solid ${i}`}></i>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Pick Color</label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_COLORS.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className={`h-6 w-6 rounded-full border-2 transition-all ${color === c ? 'border-indigo-600 scale-125' : 'border-transparent'} ${c}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-2 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialGoalManager;
