
import React, { useState, useMemo } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import { bsToAd, getDaysInBSMonth } from '../utils/bsCalendar';
import { BS_MONTHS } from '../constants';
import BSDatePicker from './BSDatePicker';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportManagerProps {
  transactions: Transaction[];
  categories: Category[];
  onClose: () => void;
  currentBSDate: string;
}

type ExportMode = 'MONTH' | 'RANGE';

const ExportManager: React.FC<ExportManagerProps> = ({ transactions, categories, onClose, currentBSDate }) => {
  const separator = currentBSDate.includes('-') ? '-' : '/';
  const parts = currentBSDate.split(separator);
  const curYear = parseInt(parts[0]);
  const curMonth = parseInt(parts[1]);
  
  const [mode, setMode] = useState<ExportMode>('MONTH');
  const [selectedYear, setSelectedYear] = useState(curYear);
  const [selectedMonth, setSelectedMonth] = useState(curMonth);
  
  const [fromDate, setFromDate] = useState(`${curYear}-${curMonth.toString().padStart(2, '0')}-01`);
  const [toDate, setToDate] = useState(currentBSDate);
  
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const getFilteredTransactions = () => {
    try {
        let startStr = fromDate;
        let endStr = toDate;

        if (mode === 'MONTH') {
          startStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`;
          const lastDay = getDaysInBSMonth(selectedYear, selectedMonth);
          endStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
        }

        const fromAD = bsToAd(startStr);
        const toAD = bsToAd(endStr);
        
        const start = new Date(fromAD);
        start.setHours(0, 0, 0, 0);
        const end = new Date(toAD);
        end.setHours(23, 59, 59, 999);

        return {
          list: transactions.filter(t => {
            const time = t.adDate.getTime();
            return time >= start.getTime() && time <= end.getTime();
          }).sort((a, b) => a.adDate.getTime() - b.adDate.getTime()),
          startLabel: startStr,
          endLabel: endStr
        };
    } catch (e) {
        console.error("Filter failed", e);
        return { list: [], startLabel: fromDate, endLabel: toDate };
    }
  };

  const handleExportCSV = async () => {
    setIsExportingCSV(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { list: filtered, startLabel, endLabel } = getFilteredTransactions();

    if (filtered.length === 0) {
      alert("No transactions found in this period.");
      setIsExportingCSV(false);
      return;
    }

    try {
      const csvRows = [
        ['Date (BS)', 'Date (AD)', 'Type', 'Category', 'Account', 'Description', 'Amount'].join(',')
      ];

      filtered.forEach(t => {
        const cat = categories.find(c => c.id === t.category)?.name || 'Other';
        const adDateStr = t.adDate.toISOString().split('T')[0];
        const desc = `"${(t.description || '').replace(/"/g, '""')}"`;
        const row = [
          t.bsDate,
          adDateStr,
          t.type,
          cat,
          t.account,
          desc,
          t.amount
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const filename = `Artha_Export_${startLabel.replace(/-/g, '_')}_to_${endLabel.replace(/-/g, '_')}.csv`;
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      onClose();
    } catch (err) {
      console.error("CSV Export error:", err);
      alert("Failed to export CSV.");
    } finally {
      setIsExportingCSV(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { list: filtered, startLabel, endLabel } = getFilteredTransactions();

    if (filtered.length === 0) {
      alert("No transactions found in this period.");
      setIsExportingPDF(false);
      return;
    }

    try {
      const PDFClass = (jsPDF as any).jsPDF || jsPDF;
      const doc = new PDFClass({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });
      
      doc.setFontSize(22);
      doc.setTextColor(79, 70, 229); // Indigo 600
      doc.text('Artha Tracker Statement', 14, 25);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.text(`Generated on: ${currentBSDate} BS`, 14, 33);
      doc.text(`Period: ${startLabel} to ${endLabel} BS`, 14, 38);

      const tableData = filtered.map((t, index) => {
        const cat = categories.find(c => c.id === t.category)?.name || 'Other';
        return [
          (index + 1).toString(),
          t.bsDate,
          t.type === TransactionType.INCOME ? 'Income' : 'Expense',
          cat,
          t.account,
          t.description || '-',
          `Rs. ${t.amount.toLocaleString()}`
        ];
      });

      const autoTableFunc = (autoTable as any).default || autoTable;
      
      if (typeof autoTableFunc !== 'function') {
        throw new Error("PDF Table generator library failed to initialize correctly.");
      }

      autoTableFunc(doc, {
        startY: 45,
        head: [['SN', 'Date (BS)', 'Type', 'Category', 'Account', 'Description', 'Amount']],
        body: tableData,
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { fontSize: 8, cellPadding: 3, font: 'helvetica' },
        columnStyles: {
          5: { cellWidth: 'auto', overflow: 'ellipsize' }, 
          6: { halign: 'right', fontStyle: 'bold' }
        },
        margin: { top: 45 }
      });

      const totalIncome = filtered.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = filtered.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
      const net = totalIncome - totalExpense;

      const finalY = (doc as any).lastAutoTable?.finalY || 150;
      const summaryY = finalY + 15;
      
      if (summaryY > 270) {
        doc.addPage();
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
        doc.text(`Total Income: Rs. ${totalIncome.toLocaleString()}`, 14, 20);
        doc.text(`Total Expense: Rs. ${totalExpense.toLocaleString()}`, 14, 26);
        doc.setFontSize(12);
        doc.setTextColor(net >= 0 ? [22, 163, 74] : [220, 38, 38]); 
        doc.text(`Net Balance: Rs. ${net.toLocaleString()}`, 14, 35);
      } else {
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85); 
        doc.text(`Total Income: Rs. ${totalIncome.toLocaleString()}`, 14, summaryY);
        doc.text(`Total Expense: Rs. ${totalExpense.toLocaleString()}`, 14, summaryY + 6);
        doc.setFontSize(12);
        doc.setTextColor(net >= 0 ? [22, 163, 74] : [220, 38, 38]); 
        doc.text(`Net Balance: Rs. ${net.toLocaleString()}`, 14, summaryY + 15);
      }

      doc.save(`Artha_Report_${startLabel.replace(/-/g, '_')}_to_${endLabel.replace(/-/g, '_')}.pdf`);
      onClose();
    } catch (err) {
      console.error("PDF Export error:", err);
      alert("Could not generate PDF.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  const isProcessing = isExportingCSV || isExportingPDF;
  const yearOptions = Array.from({ length: 2101 - 2000 }, (_, i) => 2000 + i);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-slate-100 dark:border-slate-800">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Export Data</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Select period and download</p>
          </div>
          <button 
            onClick={onClose} 
            disabled={isProcessing}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Mode Switcher */}
          <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700 shadow-inner">
            <button
              onClick={() => setMode('MONTH')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'MONTH' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Single Month
            </button>
            <button
              onClick={() => setMode('RANGE')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'RANGE' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Date Range
            </button>
          </div>

          <div className="space-y-6">
            {mode === 'MONTH' ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Year</label>
                  <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Month</label>
                  <select 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    {BS_MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <BSDatePicker 
                  label="From Date (BS)" 
                  value={fromDate} 
                  onChange={setFromDate} 
                />
                <BSDatePicker 
                  label="To Date (BS)" 
                  value={toDate} 
                  onChange={setToDate} 
                />
              </div>
            )}
          </div>

          <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
            <h4 className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <i className="fa-solid fa-shield-check"></i> Export Verification
            </h4>
            <ul className="text-[11px] text-indigo-600/70 dark:text-indigo-400/50 space-y-1 font-bold list-disc pl-4 uppercase tracking-tighter">
              <li>Verified transaction data</li>
              <li>Official Artha statement format</li>
              <li>CSV & PDF compatibility</li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleExportCSV}
              disabled={isProcessing}
              className={`group py-5 text-white rounded-[1.8rem] font-black shadow-xl transition-all active:scale-95 flex flex-col items-center justify-center gap-2 ${isExportingCSV ? 'bg-emerald-400' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100 dark:shadow-none'} disabled:opacity-50`}
            >
              {isExportingCSV ? (
                <i className="fa-solid fa-circle-notch fa-spin text-2xl"></i>
              ) : (
                <i className="fa-solid fa-file-csv text-2xl transition-transform group-hover:scale-110"></i>
              )}
              <span className="text-[9px] uppercase tracking-widest">
                {isExportingCSV ? 'Processing...' : 'CSV Report'}
              </span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isProcessing}
              className={`group py-5 text-white rounded-[1.8rem] font-black shadow-xl transition-all active:scale-95 flex flex-col items-center justify-center gap-2 ${isExportingPDF ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100 dark:shadow-none'} disabled:opacity-50`}
            >
              {isExportingPDF ? (
                <i className="fa-solid fa-circle-notch fa-spin text-2xl"></i>
              ) : (
                <i className="fa-solid fa-file-pdf text-2xl transition-transform group-hover:scale-110"></i>
              )}
              <span className="text-[9px] uppercase tracking-widest">
                {isExportingPDF ? 'Processing...' : 'PDF Statement'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportManager;
