
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Transaction, TransactionType, Category } from '../types';
import { BS_MONTHS } from '../constants';

interface IncomeExpenseChartProps {
  transactions: Transaction[];
  currentBSDate: string;
}

interface ExpensePieChartProps {
  transactions: Transaction[];
  categories: Category[];
  currentBSDate: string;
}

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ transactions, currentBSDate }) => {
  const data = useMemo(() => {
    // Default safety
    const safeDate = currentBSDate || '2082-01-01';
    const separator = safeDate.includes('/') ? '/' : '-';
    const dateParts = safeDate.split(separator);
    
    if (dateParts.length < 2) return [];

    const curYear = parseInt(dateParts[0], 10);
    const curMonthRaw = parseInt(dateParts[1], 10);
    // Convert 1-based month to 0-based index safely
    const currentMonthIndex = isNaN(curMonthRaw) ? 0 : Math.max(0, curMonthRaw - 1);

    const chartData = [];
    
    // Generate buckets for the last 6 months
    for (let i = 5; i >= 0; i--) {
      let mIndex = currentMonthIndex - i;
      let y = curYear;
      
      // Handle year wrap-around for previous months
      while (mIndex < 0) {
        mIndex += 12;
        y -= 1;
      }
      
      // Safety modulo
      mIndex = mIndex % 12;

      chartData.push({ 
        monthIndex: mIndex + 1, // Store as 1-based for transaction matching
        year: y, 
        name: BS_MONTHS[mIndex] ? BS_MONTHS[mIndex].substring(0, 3) : 'UNK', 
        fullDate: `${BS_MONTHS[mIndex]} ${y}`,
        Income: 0, 
        Expense: 0 
      });
    }

    // Aggregate transactions
    if (transactions && transactions.length > 0) {
      transactions.forEach(t => {
        if (!t.bsDate) return;
        
        const tSep = t.bsDate.includes('/') ? '/' : '-';
        const tParts = t.bsDate.split(tSep);
        if (tParts.length < 2) return;

        const y = parseInt(tParts[0], 10);
        const m = parseInt(tParts[1], 10);
        
        if (isNaN(y) || isNaN(m)) return;

        // Find the correct bucket
        const entry = chartData.find(d => d.monthIndex === m && d.year === y);
        if (entry) {
          if (t.type === TransactionType.INCOME) {
            entry.Income += (t.amount || 0);
          } else if (t.type === TransactionType.EXPENSE) {
            entry.Expense += (t.amount || 0);
          }
        }
      });
    }

    return chartData;
  }, [transactions, currentBSDate]);

  // Calculate max value for nice Y-axis scaling
  const maxValue = Math.max(...data.map(d => Math.max(d.Income, d.Expense)), 1000);
  const hasData = data.some(d => d.Income > 0 || d.Expense > 0);

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 h-[340px] flex flex-col w-full relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6 shrink-0 z-10">
        <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center text-lg">
          <i className="fa-solid fa-chart-column"></i>
        </div>
        <div>
          <h3 className="text-slate-800 dark:text-white text-sm font-black tracking-tight leading-none">Financial Activity</h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Income vs Expense (Last 6 Months)</p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 relative">
        {hasData ? (
          <div className="absolute inset-0">
            <ResponsiveContainer width="99%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} 
                  tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                  domain={[0, 'auto']}
                />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9', opacity: 0.4 }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', 
                    padding: '16px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 100
                  }}
                  labelStyle={{ fontSize: '12px', fontWeight: '800', color: '#1e293b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                />
                <Legend 
                  iconType="circle" 
                  iconSize={8}
                  wrapperStyle={{ paddingTop: '10px', fontSize: '12px', fontWeight: '600' }} 
                />
                <Bar 
                  dataKey="Income" 
                  fill="#10b981" 
                  radius={[6, 6, 6, 6]} 
                  barSize={12} 
                  animationDuration={1500} 
                />
                <Bar 
                  dataKey="Expense" 
                  fill="#f43f5e" 
                  radius={[6, 6, 6, 6]} 
                  barSize={12} 
                  animationDuration={1500} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
             <i className="fa-solid fa-chart-simple text-4xl mb-3 opacity-20"></i>
             <p className="text-xs font-bold uppercase tracking-widest opacity-50">No activity yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const ExpenseBreakdownChart: React.FC<ExpensePieChartProps> = ({ transactions, categories, currentBSDate }) => {
  const data = useMemo(() => {
    const safeDate = currentBSDate || '2082-01-01';
    const separator = safeDate.includes('/') ? '/' : '-';
    const dateParts = safeDate.split(separator);
    const curYear = parseInt(dateParts[0], 10);
    const curMonth = parseInt(dateParts[1], 10);

    const categoryTotals: Record<string, number> = {};
    let total = 0;

    if (transactions && transactions.length > 0) {
      transactions.forEach(t => {
        if (t.type !== TransactionType.EXPENSE || !t.bsDate) return;
        
        const tSep = t.bsDate.includes('/') ? '/' : '-';
        const tParts = t.bsDate.split(tSep);
        if (tParts.length < 2) return;

        const y = parseInt(tParts[0], 10);
        const m = parseInt(tParts[1], 10);
        
        if (y === curYear && m === curMonth) {
          categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
          total += t.amount;
        }
      });
    }

    const result = Object.entries(categoryTotals)
      .map(([catId, value]) => {
        const cat = categories.find(c => c.id === catId);
        // Robust color fallback
        let color = '#94a3b8';
        if (cat) {
            // Mapping tailwind bg classes to hex codes roughly
            if (cat.color.includes('orange')) color = '#f97316';
            else if (cat.color.includes('blue')) color = '#3b82f6';
            else if (cat.color.includes('purple')) color = '#a855f7';
            else if (cat.color.includes('pink')) color = '#ec4899';
            else if (cat.color.includes('red')) color = '#ef4444';
            else if (cat.color.includes('emerald')) color = '#10b981';
            else if (cat.color.includes('indigo')) color = '#6366f1';
            else if (cat.color.includes('teal')) color = '#14b8a6';
            else if (cat.color.includes('amber')) color = '#f59e0b';
            else if (cat.color.includes('lime')) color = '#84cc16';
            else if (cat.color.includes('slate')) color = '#64748b';
            else if (cat.color.includes('yellow')) color = '#eab308';
            else if (cat.color.includes('cyan')) color = '#06b6d4';
            else if (cat.color.includes('rose')) color = '#f43f5e';
            else if (cat.color.includes('sky')) color = '#0ea5e9';
            else if (cat.color.includes('green')) color = '#22c55e';
        }

        return {
          name: cat?.name || 'Other',
          value,
          color,
          icon: cat?.icon
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 categories

    return { result, total };
  }, [transactions, categories, currentBSDate]);

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 h-[340px] flex flex-col w-full">
      <div className="flex items-center gap-3 mb-2 shrink-0">
        <div className="h-10 w-10 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center text-lg">
          <i className="fa-solid fa-chart-pie"></i>
        </div>
        <div>
          <h3 className="text-slate-800 dark:text-white text-sm font-black tracking-tight leading-none">Spending Breakdown</h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            {currentBSDate ? BS_MONTHS[parseInt(currentBSDate.split(currentBSDate.includes('/') ? '/' : '-')[1] || '1') - 1] : ''} Distribution
          </p>
        </div>
      </div>
      
      {data.total > 0 ? (
        <div className="flex-1 w-full min-h-0 flex items-center relative">
          <div className="w-1/2 h-full relative">
            <ResponsiveContainer width="99%" height="100%">
              <PieChart>
                <Pie
                  data={data.result}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.result.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `Rs. ${value.toLocaleString()}`}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
                    fontSize: '12px', 
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Total */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <p className="text-[8px] font-black text-slate-400 uppercase">Total</p>
              <p className="text-xs font-black text-slate-800 dark:text-white">{(data.total/1000).toFixed(1)}k</p>
            </div>
          </div>
          
          <div className="w-1/2 pl-2 space-y-2 overflow-y-auto max-h-[220px] no-scrollbar">
            {data.result.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                 <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate">{item.name}</p>
                    <p className="text-[9px] text-slate-400">Rs. {item.value.toLocaleString()}</p>
                 </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
          <i className="fa-solid fa-chart-pie text-4xl mb-2 opacity-20"></i>
          <p className="text-xs font-bold uppercase tracking-widest opacity-50">No expenses found</p>
        </div>
      )}
    </div>
  );
};
