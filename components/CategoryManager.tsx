
import React, { useState, useEffect } from 'react';
import { Category, TransactionType } from '../types';
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from '../constants';

interface CategoryManagerProps {
  categories: Category[];
  onAdd: (cat: Category) => void;
  onUpdate: (cat: Category) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onAdd, onUpdate, onDelete, onClose }) => {
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(AVAILABLE_ICONS[0]);
  const [color, setColor] = useState(AVAILABLE_COLORS[0]);
  const [catToDelete, setCatToDelete] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setIcon(AVAILABLE_ICONS[0]);
    setColor(AVAILABLE_COLORS[0]);
    setEditingId(null);
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setIcon(cat.icon);
    setColor(cat.color);
    setType(cat.type);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      onUpdate({
        id: editingId,
        name: name.trim(),
        icon,
        color,
        type,
        isDefault: categories.find(c => c.id === editingId)?.isDefault || false
      });
    } else {
      const newCategory: Category = {
        id: `custom-${Date.now()}`,
        name: name.trim(),
        icon,
        color,
        type,
        isDefault: false
      };
      onAdd(newCategory);
    }
    resetForm();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Category Manager</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Personalize your transaction classification</p>
          </div>
          <button 
            onClick={onClose} 
            className="h-12 w-12 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs shadow-md">
                <i className={`fa-solid ${editingId ? 'fa-pen-to-square' : 'fa-plus'}`}></i>
              </div>
              <h3 className="font-black text-slate-700 uppercase tracking-tight">
                {editingId ? 'Update Category' : 'Create Category'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Classification</label>
                <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200/50 shadow-inner">
                  <button
                    type="button"
                    disabled={!!editingId}
                    onClick={() => setType(TransactionType.EXPENSE)}
                    className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${type === TransactionType.EXPENSE ? 'bg-white text-rose-600 shadow-md ring-1 ring-slate-100' : 'text-slate-500 hover:text-slate-700'} ${editingId ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    disabled={!!editingId}
                    onClick={() => setType(TransactionType.INCOME)}
                    className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${type === TransactionType.INCOME ? 'bg-white text-emerald-600 shadow-md ring-1 ring-slate-100' : 'text-slate-500 hover:text-slate-700'} ${editingId ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Income
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Category Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Subscriptions"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none font-bold transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Choose Icon</label>
                <div className="grid grid-cols-6 gap-2 h-40 overflow-y-auto p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  {AVAILABLE_ICONS.map(i => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIcon(i)}
                      className={`h-11 flex items-center justify-center rounded-xl transition-all ${icon === i ? 'bg-indigo-600 text-white shadow-lg scale-110' : 'bg-white text-slate-400 hover:bg-slate-100'}`}
                    >
                      <i className={`fa-solid ${i}`}></i>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Brand Color</label>
                <div className="grid grid-cols-9 gap-2">
                  {AVAILABLE_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`h-7 w-7 rounded-full border-2 transition-all ${color === c ? 'border-slate-800 scale-125 shadow-md' : 'border-transparent'} ${c}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-[1.5rem] font-black hover:bg-slate-200 transition-all active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-[2] py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
                >
                  {editingId ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-slate-800 rounded-lg flex items-center justify-center text-white text-xs shadow-md">
                  <i className="fa-solid fa-list-ul"></i>
                </div>
                <h3 className="font-black text-slate-700 uppercase tracking-tight">Active Categories</h3>
              </div>
              <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{categories.length} Total</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[60vh] pr-2">
              {categories.map(cat => (
                <div 
                  key={cat.id} 
                  onClick={() => handleEdit(cat)}
                  className={`flex items-center justify-between p-4 bg-white rounded-2xl border transition-all group cursor-pointer ${editingId === cat.id ? 'border-indigo-600 ring-2 ring-indigo-50 shadow-md scale-[1.02]' : 'border-slate-100 hover:shadow-md'}`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`h-10 w-10 rounded-xl ${cat.color} flex items-center justify-center text-white text-sm shadow-sm shrink-0`}>
                      <i className={`fa-solid ${cat.icon}`}></i>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{cat.name}</p>
                      <p className={`text-[9px] font-black uppercase tracking-widest ${cat.type === TransactionType.INCOME ? 'text-emerald-500' : 'text-rose-500'}`}>{cat.type}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                       className="h-9 w-9 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                       onClick={(e) => { e.stopPropagation(); handleEdit(cat); }}
                    >
                        <i className="fa-solid fa-pen text-xs"></i>
                    </button>
                    {!cat.isDefault && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); setCatToDelete(cat.id); }}
                            className="h-9 w-9 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100"
                        >
                            <i className="fa-solid fa-trash-can text-xs"></i>
                        </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {catToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-xs text-center space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="h-20 w-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-xl tracking-tight">Delete Category?</h3>
              <p className="text-slate-500 text-sm font-medium mt-2 leading-relaxed">
                Existing transactions will keep this category, but it won't be available for new entries.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  onDelete(catToDelete);
                  setCatToDelete(null);
                  if (editingId === catToDelete) resetForm();
                }}
                className="w-full py-4 text-sm font-black text-white bg-rose-600 hover:bg-rose-700 rounded-2xl shadow-lg shadow-rose-100 transition-all active:scale-95"
              >
                Yes, Delete
              </button>
              <button 
                onClick={() => setCatToDelete(null)}
                className="w-full py-4 text-sm font-black text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
