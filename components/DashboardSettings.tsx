import React, { useState } from 'react';
import { DashboardWidget, WidgetConfig } from '../types';

interface DashboardSettingsProps {
  config: WidgetConfig[];
  onChange: (config: WidgetConfig[]) => void;
  onSetPassword: (pwd: string | null) => void;
  appPassword: string | null;
  onClose: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const DashboardSettings: React.FC<DashboardSettingsProps> = ({ config, onChange, onSetPassword, appPassword, onClose, darkMode, onToggleDarkMode }) => {
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [newPwd, setNewPwd] = useState('');

  const toggleVisibility = (id: DashboardWidget) => {
    const newConfig = config.map(w => w.id === id ? { ...w, visible: !w.visible } : w);
    onChange(newConfig);
  };

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const newConfig = [...config];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newConfig.length) {
      [newConfig[index], newConfig[targetIndex]] = [newConfig[targetIndex], newConfig[index]];
      onChange(newConfig);
    }
  };

  const handleUpdatePassword = () => {
    if (newPwd.trim()) {
      onSetPassword(newPwd.trim());
      setNewPwd('');
      setShowPwdForm(false);
    }
  };

  const handleRemovePassword = () => {
    if (confirm('Disable app lock? This will remove password protection.')) {
      onSetPassword(null);
      setShowPwdForm(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Settings</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Dashboard & Security</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 h-10 w-10 flex items-center justify-center rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[70vh] no-scrollbar">
          {/* Appearance Section */}
          <div className="space-y-3">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Appearance</h3>
             <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-900/40 text-orange-600 flex items-center justify-center">
                        <i className={`fa-solid ${darkMode ? 'fa-moon' : 'fa-sun'}`}></i>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Dark Mode</p>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                            {darkMode ? 'Enabled' : 'Disabled'}
                        </p>
                    </div>
                </div>
                <button 
                  onClick={onToggleDarkMode}
                  className={`h-6 w-11 rounded-full relative transition-colors ${darkMode ? 'bg-orange-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${darkMode ? 'left-6' : 'left-1'}`}></div>
                </button>
             </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Dashboard Section */}
          <div className="space-y-3">
             <div className="flex items-center justify-between ml-1">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Dashboard Layout</h3>
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">Move to sort</span>
             </div>
             <div className="space-y-2">
                {config.map((widget, index) => (
                    <div 
                    key={widget.id} 
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${widget.visible ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm' : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 opacity-60'}`}
                    >
                    <div className="flex items-center gap-3">
                        <button 
                        onClick={() => toggleVisibility(widget.id)}
                        className={`h-6 w-10 rounded-full relative transition-colors ${widget.visible ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${widget.visible ? 'left-5' : 'left-1'}`}></div>
                        </button>
                        <span className={`font-bold text-xs ${widget.visible ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}`}>
                        {widget.label}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                        <button 
                        disabled={index === 0}
                        onClick={() => moveWidget(index, 'up')}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 disabled:opacity-10 transition-all"
                        >
                        <i className="fa-solid fa-chevron-up text-[10px]"></i>
                        </button>
                        <button 
                        disabled={index === config.length - 1}
                        onClick={() => moveWidget(index, 'down')}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 disabled:opacity-10 transition-all"
                        >
                        <i className="fa-solid fa-chevron-down text-[10px]"></i>
                        </button>
                    </div>
                    </div>
                ))}
             </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Security Section */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Security</h3>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl ${appPassword ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'} flex items-center justify-center`}>
                        <i className={`fa-solid ${appPassword ? 'fa-shield-halved' : 'fa-lock-open'}`}></i>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">App Lock</p>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                            {appPassword ? 'Password Protection Active' : 'No Password Set'}
                        </p>
                    </div>
                </div>
                {appPassword ? (
                    <button onClick={handleRemovePassword} className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-700">Disable</button>
                ) : (
                    <button onClick={() => setShowPwdForm(true)} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700">Enable</button>
                )}
              </div>

              {showPwdForm && (
                <div className="space-y-3 mt-2 animate-in slide-in-from-top-2 duration-200">
                    <input 
                        type="password"
                        placeholder="Enter new PIN/Password"
                        value={newPwd}
                        onChange={(e) => setNewPwd(e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-bold text-sm dark:text-slate-100"
                    />
                    <div className="flex gap-2">
                        <button onClick={() => setShowPwdForm(false)} className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl transition-all">Cancel</button>
                        <button onClick={handleUpdatePassword} className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-white bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none transition-all">Set Lock</button>
                    </div>
                </div>
              )}

              {appPassword && !showPwdForm && (
                  <button onClick={() => setShowPwdForm(true)} className="w-full py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Change Password
                  </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky bottom-0">
          <button
            onClick={onClose}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-[0.98]"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardSettings;