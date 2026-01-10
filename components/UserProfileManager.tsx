
import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from '../constants';

interface UserProfileManagerProps {
  profile: UserProfile | null;
  onSave: (profile: UserProfile) => void;
  onClose: () => void;
}

const UserProfileManager: React.FC<UserProfileManagerProps> = ({ profile, onSave, onClose }) => {
  const [name, setName] = useState(profile?.name || '');
  const [motto, setMotto] = useState(profile?.motto || '');
  const [avatar, setAvatar] = useState(profile?.avatar || 'fa-user');
  const [color, setColor] = useState(profile?.color || 'bg-indigo-600');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      motto: motto.trim(),
      avatar,
      color
    });
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size too large. Please select an image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const AVATAR_ICONS = [
    'fa-user', 'fa-user-astronaut', 'fa-user-ninja', 'fa-user-tie', 
    'fa-user-graduate', 'fa-user-secret', 'fa-user-nurse', 'fa-user-md'
  ];

  const isCustomImage = avatar.startsWith('data:');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[250] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 relative">
        <div className="p-8 pb-4 flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">User Profile</h2>
          <button onClick={onClose} className="h-10 w-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-400"><i className="fa-solid fa-xmark"></i></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className={`h-24 w-24 rounded-[2rem] overflow-hidden ${color} flex items-center justify-center text-white text-4xl shadow-xl shadow-indigo-100 ring-4 ring-white relative group`}>
              {isCustomImage ? (
                <img src={avatar} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <i className={`fa-solid ${avatar}`}></i>
              )}
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-lg"
              >
                <i className="fa-solid fa-camera"></i>
              </button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept="image/*" 
            />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Profile Identity</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Your Name</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="How should Artha call you?"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none font-bold transition-all"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Financial Motto</label>
              <input
                type="text"
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                placeholder="e.g. Save today, thrive tomorrow"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none font-medium text-sm transition-all"
              />
            </div>

            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-200 transition-all"
              >
                <i className="fa-solid fa-upload mr-2"></i> Custom Photo
              </button>
              {isCustomImage && (
                <button 
                  type="button"
                  onClick={() => setAvatar('fa-user')}
                  className="px-4 py-3 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100"
                >
                  Reset
                </button>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Choose Icon</label>
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                {AVATAR_ICONS.map(i => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatar(i)}
                    className={`h-10 w-10 shrink-0 flex items-center justify-center rounded-xl transition-all ${avatar === i ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-400'}`}
                  >
                    <i className={`fa-solid ${i}`}></i>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Profile Theme</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_COLORS.slice(0, 8).map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-7 w-7 rounded-full border-2 transition-all ${color === c ? 'border-slate-800 scale-110 shadow-sm' : 'border-transparent'} ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfileManager;
