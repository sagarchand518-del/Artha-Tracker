
import React, { useState } from 'react';

interface LoginProps {
  onUnlock: () => void;
  correctPassword: string;
}

const Login: React.FC<LoginProps> = ({ onUnlock, correctPassword }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 10) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(false);
      
      if (nextPin === correctPassword) {
        onUnlock();
      }
    }
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin === correctPassword) {
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 z-[1000] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <div className="text-center space-y-2">
          <div className="h-20 w-20 bg-gradient-to-br from-orange-500 to-purple-600 rounded-[2rem] flex items-center justify-center text-white text-3xl shadow-xl mx-auto mb-4 animate-bounce">
            <i className="fa-solid fa-lock"></i>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Artha Tracker</h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Application Locked</p>
        </div>

        <div className={`flex gap-3 h-12 items-center justify-center transition-transform ${error ? 'animate-shake' : ''}`}>
          {Array.from({ length: Math.max(pin.length, 4) }).map((_, i) => (
            <div 
              key={i} 
              className={`h-4 w-4 rounded-full transition-all duration-300 ${i < pin.length ? 'bg-indigo-600 scale-125 shadow-lg shadow-indigo-200' : 'bg-slate-200'}`}
            />
          ))}
        </div>

        {error && <p className="text-rose-500 font-black text-xs uppercase tracking-tighter">Incorrect Password</p>}

        <div className="grid grid-cols-3 gap-4 w-full">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="h-20 bg-white rounded-[2rem] text-2xl font-black text-slate-700 shadow-sm border border-slate-100 hover:bg-slate-50 active:scale-90 transition-all"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-20 bg-slate-50 rounded-[2rem] text-sm font-black text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest"
          >
            Clear
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="h-20 bg-white rounded-[2rem] text-2xl font-black text-slate-700 shadow-sm border border-slate-100 hover:bg-slate-50 active:scale-90 transition-all"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-20 bg-slate-50 rounded-[2rem] text-xl font-black text-slate-400 hover:text-rose-600 transition-all"
          >
            <i className="fa-solid fa-delete-left"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="w-full">
             <input 
                type="password" 
                value={pin} 
                onChange={(e) => setPin(e.target.value)} 
                className="sr-only" 
                autoFocus 
            />
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;
