
import React, { useState, useRef, useMemo } from 'react';
import { Category, TransactionType } from '../types';
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from '../constants';

interface CategoryManagerProps {
  categories: Category[];
  onAdd: (cat: Category) => void;
  onUpdate: (cat: Category) => void;
  onDelete: (id: string) => void;
  onReorder?: (categories: Category[]) => void;
  onClose: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onAdd, onUpdate, onDelete, onReorder, onClose }) => {
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(AVAILABLE_ICONS[0]);
  const [color, setColor] = useState(AVAILABLE_COLORS[0]);
  const [catToDelete, setCatToDelete] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // View Control
  const [activeTab, setActiveTab] = useState<TransactionType>(TransactionType.EXPENSE);

  // Drag and Drop
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

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
    // Switch view to match the item being edited
    setActiveTab(cat.type);
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

  // Drag and Drop Logic
  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null || !onReorder) return;
    
    // Create a copy of the full list
    let _categories = [...categories];

    // Filter to get the current view's list
    const currentViewList = _categories.filter(c => c.type === activeTab);
    
    // Get the items being moved
    const draggedItemContent = currentViewList[dragItem.current];
    const targetIndexItem = currentViewList[dragOverItem.current];
    
    // We need to find their indices in the REAL global array
    const globalDragIndex = _categories.findIndex(c => c.id === draggedItemContent.id);
    const globalDropIndex = _categories.findIndex(c => c.id === targetIndexItem.id);

    // Remove the dragged item from global array
    _categories.splice(globalDragIndex, 1);
    // Insert it at the new position
    _categories.splice(globalDropIndex, 0, draggedItemContent);

    onReorder(_categories);
    
    // Reset refs
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const filteredCategories = categories.filter(c => c.type === activeTab);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300 border border-slate-100 dark:border-slate-800">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Category Studio</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Design & Organize</p>
          </div>
          <button 
            onClick={onClose} 
            className="h-12 w-12 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12">
          {/* Left Panel: Editor Form */}
          <div className="lg:col-span-5 p-8 bg-slate-50/50 dark:bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 flex flex-col">
             <div className="mb-6 flex items-center justify-between">
                <h3 className="font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight flex items-center gap-2">
                  <i className={`fa-solid ${editingId ? 'fa-pen-nib' : 'fa-magic'} text-indigo-500`}></i>
                  {editingId ? 'Edit Mode' : 'Creator Mode'}
                </h3>
                {editingId && (
                  <button onClick={resetForm} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider">
                    Cancel
                  </button>
                )}
             </div>

             {/* Live Preview Card */}
             <div className="mb-8 flex justify-center">
                <div className={`relative px-6 py-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 shadow-sm bg-white dark:bg-slate-800 ${type === TransactionType.INCOME ? 'border-emerald-100 dark:border-emerald-900/30' : 'border-rose-100 dark:border-rose-900/30'}`}>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-white dark:bg-slate-800 text-[8px] font-black uppercase tracking-widest text-slate-300 border border-slate-100 dark:border-slate-700 rounded-md">
                      Preview
                    </div>
                    <div className="flex flex-col items-center gap-3 min-w-[120px]">
                        <div className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center text-white shadow-md transition-colors duration-300`}>
                            <i className={`fa-solid ${icon} text-lg`}></i>
                        </div>
                        <span className="font-black text-slate-700 dark:text-slate-200 text-sm">{name || 'Category Name'}</span>
                        <div className={`h-1 w-8 rounded-full ${type === TransactionType.INCOME ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                    </div>
                </div>
             </div>

             <form onSubmit={handleSubmit} className="space-y-5">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Type</label>
                  <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      disabled={!!editingId}
                      onClick={() => setType(TransactionType.EXPENSE)}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all ${type === TransactionType.EXPENSE ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      disabled={!!editingId}
                      onClick={() => setType(TransactionType.INCOME)}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all ${type === TransactionType.INCOME ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Income
                    </button>
                  </div>
               </div>

               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Name</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Groceries"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm text-slate-700 dark:text-slate-200"
                  />
               </div>

               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Icon</label>
                  <div className="grid grid-cols-6 gap-2 h-32 overflow-y-auto p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl custom-scrollbar">
                    {AVAILABLE_ICONS.map(i => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setIcon(i)}
                        className={`h-9 w-9 flex items-center justify-center rounded-lg transition-all ${icon === i ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-105' : 'text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-500'}`}
                      >
                        <i className={`fa-solid ${i}`}></i>
                      </button>
                    ))}
                  </div>
               </div>

               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Color</label>
                  <div className="flex flex-wrap gap-2.5">
                    {AVAILABLE_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`h-6 w-6 rounded-full border-2 transition-all ${color === c ? 'border-slate-800 dark:border-white scale-110 shadow-sm' : 'border-transparent opacity-80 hover:opacity-100'} ${c}`}
                      />
                    ))}
                  </div>
               </div>

               <button
                  type="submit"
                  className="w-full py-4 mt-4 bg-indigo-600 text-white rounded-xl font-black text-sm shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-[0.98]"
                >
                  {editingId ? 'Save Changes' : 'Create Category'}
               </button>
             </form>
          </div>

          {/* Right Panel: List & Reorder */}
          <div className="lg:col-span-7 p-8 flex flex-col h-full">
             <div className="flex items-center justify-between mb-6">
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <button 
                      onClick={() => setActiveTab(TransactionType.EXPENSE)}
                      className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${activeTab === TransactionType.EXPENSE ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Expenses
                    </button>
                    <button 
                      onClick={() => setActiveTab(TransactionType.INCOME)}
                      className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${activeTab === TransactionType.INCOME ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Income
                    </button>
                </div>
                <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                   <i className="fa-solid fa-arrow-down-up"></i>
                   Drag to Reorder
                </div>
             </div>

             <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {filteredCategories.map((cat, index) => (
                   <div 
                      key={cat.id}
                      draggable
                      onDragStart={(e) => {
                         dragItem.current = index;
                         // Add opacity to dragged item visually
                         e.currentTarget.style.opacity = '0.5';
                      }}
                      onDragEnd={(e) => {
                         e.currentTarget.style.opacity = '1';
                         dragItem.current = null;
                         dragOverItem.current = null;
                      }}
                      onDragEnter={(e) => {
                         dragOverItem.current = index;
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleSort}
                      className={`group flex items-center gap-4 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-900 transition-all cursor-move select-none ${editingId === cat.id ? 'ring-2 ring-indigo-500 border-transparent bg-indigo-50/10' : ''}`}
                   >
                      <div className="text-slate-300 group-hover:text-indigo-400 cursor-grab active:cursor-grabbing px-2">
                         <i className="fa-solid fa-grip-vertical"></i>
                      </div>
                      
                      <div className={`h-10 w-10 rounded-lg ${cat.color} flex items-center justify-center text-white shadow-sm shrink-0`}>
                         <i className={`fa-solid ${cat.icon}`}></i>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate">{cat.name}</p>
                            {cat.isDefault && <i className="fa-solid fa-lock text-[10px] text-slate-300" title="System Default"></i>}
                         </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={(e) => { e.stopPropagation(); handleEdit(cat); }}
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-600 transition-all"
                         >
                            <i className="fa-solid fa-pen text-xs"></i>
                         </button>
                         {!cat.isDefault && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); setCatToDelete(cat.id); }}
                                className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/50 hover:text-rose-600 transition-all"
                            >
                                <i className="fa-solid fa-trash text-xs"></i>
                            </button>
                         )}
                      </div>
                   </div>
                ))}
                {filteredCategories.length === 0 && (
                  <div className="py-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                     <p className="text-slate-400 text-xs font-bold">No categories found.</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>

      {catToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[120] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-xs text-center space-y-6 animate-in zoom-in duration-200 border border-slate-100 dark:border-slate-800">
            <div className="h-20 w-20 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div>
              <h3 className="font-black text-slate-800 dark:text-slate-100 text-xl tracking-tight">Delete Category?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-2 leading-relaxed">
                Transactions using this category will remain, but will appear as "Other".
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  onDelete(catToDelete);
                  setCatToDelete(null);
                  if (editingId === catToDelete) resetForm();
                }}
                className="w-full py-4 text-sm font-black text-white bg-rose-600 hover:bg-rose-700 rounded-2xl shadow-lg shadow-rose-100 dark:shadow-none transition-all active:scale-95"
              >
                Yes, Delete
              </button>
              <button 
                onClick={() => setCatToDelete(null)}
                className="w-full py-4 text-sm font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-all active:scale-95"
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
