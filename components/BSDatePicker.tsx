
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BS_MONTHS, BS_MONTHS_NEPALI } from '../constants';
import { getDays, bsToAd, getCurrentBSDate } from '../utils/bsCalendar';

interface BSDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  inline?: boolean;
}

const BSDatePicker: React.FC<BSDatePickerProps> = ({ value, onChange, label, inline = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const today = useMemo(() => getCurrentBSDate(), []);
  
  // Use current date as default view if no value
  const [viewYear, setViewYear] = useState(2082);
  const [viewMonth, setViewMonth] = useState(9); // Default to Poush 2082
  const containerRef = useRef<HTMLDivElement>(null);

  const yearOptions = useMemo(() => Array.from({ length: 2101 - 2000 }, (_, i) => 2000 + i), []);

  useEffect(() => {
    const dateToUse = value || today;
    const separator = dateToUse.includes('-') ? '-' : '/';
    const parts = dateToUse.split(separator);
    if (parts.length === 3) {
      const vYear = parseInt(parts[0]);
      const vMonth = parseInt(parts[1]);
      if (!isNaN(vYear) && !isNaN(vMonth)) {
        setViewYear(vYear);
        setViewMonth(vMonth);
      }
    }
  }, [value, today]);

  useEffect(() => {
    if (!inline) {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [inline]);

  const selectDate = (y: number, m: number, d: number) => {
    const formatted = `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    onChange(formatted);
    if (!inline) setIsOpen(false);
  };

  const changeMonth = (delta: number) => {
    let nextM = viewMonth + delta;
    let nextY = viewYear;
    if (nextM > 12) { nextM = 1; nextY++; }
    else if (nextM < 1) { nextM = 12; nextY--; }
    
    if (nextY >= 2000 && nextY <= 2100) {
      setViewMonth(nextM);
      setViewYear(nextY);
    }
  };

  const changeYear = (newYear: number) => {
    if (newYear >= 2000 && newYear <= 2100) {
      setViewYear(newYear);
    }
  };

  // Uses the getDays helper for accurate day counts per month
  const calendarDays = useMemo(() => getDays(viewYear, viewMonth - 1), [viewYear, viewMonth]);
  const firstDayAD = bsToAd(`${viewYear}-${viewMonth.toString().padStart(2, '0')}-01`);
  const startDayOfWeek = firstDayAD.getUTCDay();
  
  const emptySlots = Array.from({ length: startDayOfWeek }, (_, i) => i);

  const activeValue = value || today;
  const separator = activeValue.includes('-') ? '-' : '/';
  const activeParts = activeValue.split(separator);
  const selYear = activeParts.length === 3 ? parseInt(activeParts[0]) : 2082;
  const selMonth = activeParts.length === 3 ? parseInt(activeParts[1]) : 9;
  const selDay = activeParts.length === 3 ? parseInt(activeParts[2]) : 22;

  const CalendarGrid = (
    <div className={`${inline ? 'w-full bg-white rounded-[2rem] p-5 border border-slate-200' : 'absolute top-full left-0 md:left-auto md:right-0 w-full md:w-[350px] mt-3 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-6 z-[100] animate-in fade-in zoom-in duration-200 origin-top-right'}`}>
      {/* Year Selector UI */}
      <div className="mb-4 p-1 bg-slate-50 rounded-2xl flex items-center border border-slate-100/50">
        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); changeYear(viewYear - 1); }}
          className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-white hover:text-orange-600 text-slate-400 transition-all active:scale-90"
          title="Previous Year"
        >
          <i className="fa-solid fa-angles-left text-[10px]"></i>
        </button>
        <div className="flex-1 px-2 relative group">
          <select 
            value={viewYear} 
            onChange={(e) => changeYear(Number(e.target.value))}
            className="w-full bg-transparent border-none text-xs font-black text-slate-700 text-center outline-none cursor-pointer hover:text-orange-600 appearance-none py-1"
          >
            {yearOptions.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] text-slate-300">
            <i className="fa-solid fa-caret-down"></i>
          </div>
        </div>
        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); changeYear(viewYear + 1); }}
          className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-white hover:text-orange-600 text-slate-400 transition-all active:scale-90"
          title="Next Year"
        >
          <i className="fa-solid fa-angles-right text-[10px]"></i>
        </button>
      </div>

      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
             <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest leading-none">{viewYear}</span>
             <span className="h-0.5 w-0.5 rounded-full bg-slate-300"></span>
             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Year Selection</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
             <span className="text-xl font-black text-slate-800 leading-none">{BS_MONTHS[viewMonth - 1]}</span>
             <span className="text-[10px] font-bold text-slate-300">({BS_MONTHS_NEPALI[viewMonth - 1]})</span>
          </div>
        </div>
        <div className="flex gap-1.5 bg-slate-50 p-1 rounded-xl">
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); changeMonth(-1); }}
            className="h-8 w-8 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-orange-600 transition-all active:scale-90"
          >
            <i className="fa-solid fa-chevron-left text-[10px]"></i>
          </button>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); changeMonth(1); }}
            className="h-8 w-8 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-orange-600 transition-all active:scale-90"
          >
            <i className="fa-solid fa-chevron-right text-[10px]"></i>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className={`text-center text-[10px] font-black py-1 ${i === 6 ? 'text-rose-500' : 'text-slate-400'}`}>
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {emptySlots.map(i => <div key={`empty-${i}`} className="h-11"></div>)}
        {calendarDays.map(d => {
          const isSelected = selYear === viewYear && selMonth === viewMonth && selDay === d;
          const dateStr = `${viewYear}-${viewMonth.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
          const isToday = today === dateStr;
          
          const dayOfWeek = (startDayOfWeek + d - 1) % 7;
          const isSaturday = dayOfWeek === 6;
          
          const currentAD = bsToAd(dateStr);
          const adDayNum = currentAD.getUTCDate();
          
          return (
            <button
              key={d}
              type="button"
              onClick={(e) => { e.stopPropagation(); selectDate(viewYear, viewMonth, d); }}
              className={`h-11 w-full flex flex-col items-center justify-center rounded-xl transition-all relative
                ${isSelected ? 'bg-orange-600 text-white shadow-lg shadow-orange-100 scale-105 z-10' : ''}
                ${!isSelected ? 'hover:bg-orange-50 text-slate-700' : ''}
                ${isToday && !isSelected ? 'text-orange-600 ring-2 ring-orange-100 bg-white' : ''}
                ${isSaturday && !isSelected ? 'text-rose-500' : ''}
              `}
            >
              <span className="text-sm font-bold leading-none">{d}</span>
              <span className={`absolute bottom-1 right-1 text-[8px] font-bold ${isSelected ? 'text-white/70' : 'text-slate-300'}`}>
                {adDayNum}
              </span>
              {isToday && !isSelected && <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-orange-600"></div>}
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const [y, m, d] = today.split('-').map(Number);
              selectDate(y, m, d);
            }}
            className="py-2.5 text-xs font-black text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-2xl transition-all active:scale-95"
          >
            Today
          </button>
          {!inline && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
              className="py-2.5 text-xs font-black text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all active:scale-95"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (inline) {
    return (
      <div className="flex flex-col gap-3 w-full">
        <div className="flex items-center justify-between px-1">
          {label && <label className="text-sm font-bold text-slate-700">{label}</label>}
          <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">Selected: {activeValue}</span>
        </div>
        {CalendarGrid}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 w-full relative" ref={containerRef}>
      {label && <label className="text-sm font-bold text-slate-700 mb-1 ml-1">{label}</label>}
      
      <div className="relative group">
        <input
          type="text"
          value={value || today}
          readOnly
          onClick={() => setIsOpen(!isOpen)}
          placeholder="YYYY-MM-DD"
          className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-600 focus:bg-white outline-none cursor-pointer transition-all text-slate-700 font-bold"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="h-10 w-10 flex items-center justify-center text-slate-400 group-hover:text-orange-600 transition-colors"
            >
                <i className="fa-solid fa-calendar-day text-xl"></i>
            </button>
        </div>
      </div>

      {isOpen && CalendarGrid}
    </div>
  );
};

export default BSDatePicker;
