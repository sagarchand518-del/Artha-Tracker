
import React from 'react';

interface DeveloperDetailsProps {
  onClose: () => void;
}

const DeveloperDetails: React.FC<DeveloperDetailsProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[300] flex items-center justify-center p-4">
      <div className="bg-white/90 w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 relative border border-white/20">
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center bg-white/50 backdrop-blur-md rounded-full text-slate-400 hover:text-slate-600 transition-colors z-10"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>
        
        <div className="p-8 pt-12 flex flex-col items-center space-y-8">
          {/* Hero Section */}
          <div className="relative group">
            <div className="h-32 w-32 bg-gradient-to-tr from-orange-500 via-rose-500 to-indigo-600 rounded-[3rem] flex items-center justify-center text-white text-5xl shadow-2xl group-hover:rotate-6 transition-transform duration-500">
              <i className="fa-solid fa-user-graduate"></i>
            </div>
          </div>
          
          <div className="text-center space-y-1">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none">Sagar Chand</h2>
          </div>

          {/* Info Card List */}
          <div className="w-full space-y-3">
             <div className="flex items-center gap-4 p-4 bg-white/50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-colors">
                <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-graduation-cap"></i>
                </div>
                <div className="text-left">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Education</p>
                    <p className="text-xs font-bold text-slate-700">Bachelor of Business Studies (Finance)</p>
                </div>
             </div>

             <div className="flex items-center gap-4 p-4 bg-white/50 rounded-2xl border border-slate-100 group hover:border-orange-200 transition-colors">
                <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-location-dot"></i>
                </div>
                <div className="text-left">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Address</p>
                    <p className="text-xs font-bold text-slate-700">Belauri-06, Kanchanpur</p>
                </div>
             </div>

             <div className="flex items-center gap-4 p-4 bg-white/50 rounded-2xl border border-slate-100 group hover:border-emerald-200 transition-colors">
                <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-phone"></i>
                </div>
                <div className="text-left">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact No.</p>
                    <p className="text-xs font-bold text-slate-700">+977-9821680302</p>
                </div>
             </div>

             <div className="flex items-center gap-4 p-4 bg-white/50 rounded-2xl border border-slate-100 group hover:border-rose-200 transition-colors">
                <div className="h-10 w-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-envelope"></i>
                </div>
                <div className="text-left min-w-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">E-Mail</p>
                    <p className="text-xs font-bold text-slate-700 truncate">sagarchand518@gmail.com</p>
                </div>
             </div>
          </div>

          <div className="w-full h-px bg-slate-100/50" />

          {/* Footer Branding */}
          <div className="text-center">
             <div className="flex gap-4 justify-center">
                <a href="mailto:sagarchand518@gmail.com" className="h-12 w-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg">
                   <i className="fa-solid fa-paper-plane"></i>
                </a>
                <a href="tel:+9779821680302" className="h-12 w-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg">
                   <i className="fa-solid fa-phone"></i>
                </a>
                <div className="h-12 w-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg">
                   <i className="fa-solid fa-shield-check"></i>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperDetails;
