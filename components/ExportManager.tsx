
import React, { useState } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import { bsToAd } from '../utils/bsCalendar';
import BSDatePicker from './BSDatePicker';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportManagerProps {
  transactions: Transaction[];
  categories: Category[];
  onClose: () => void;
  currentBSDate: string;
}

const ExportManager: React.FC<ExportManagerProps> = ({ transactions, categories, onClose, currentBSDate }) => {
  const separator = currentBSDate.includes('-') ? '-' : '/';
  const parts = currentBSDate.split(separator);
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  
  const [fromDate, setFromDate] = useState(`${year}-${month.toString().padStart(2, '0')}-01`);
  const [toDate, setToDate] = useState(currentBSDate);
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const getFilteredTransactions = () => {
    try {
        const fromAD = bsToAd(fromDate);
        const toAD = bsToAd(toDate);
        
        const start = new Date(fromAD);
        start.setHours(0, 0, 0, 0);
        const end = new Date(toAD);
        end.setHours(23, 59, 59, 999);

        return transactions.filter(t => {
            const time = t.adDate.getTime();
            return time >= start.getTime() && time <= end.getTime();
        }).sort((a, b) => a.adDate.getTime() - b.adDate.getTime());
    } catch (e) {
        console.error("Filter failed", e);
        return [];
    }
  };

  const handleExportCSV = async () => {
    setIsExportingCSV(true);
    // Add small delay for UI feedback
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const filtered = getFilteredTransactions();

    if (filtered.length === 0) {
      alert("No transactions found in this date range.");
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
      
      const filename = `Artha_Export_${fromDate.replace(/-/g, '_')}_to_${toDate.replace(/-/g, '_')}.csv`;
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
    // Small delay to allow loader to show
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const filtered = getFilteredTransactions();

    if (filtered.length === 0) {
      alert("No transactions found in this date range.");
      setIsExportingPDF(false);
      return;
    }

    try {
      // Create jsPDF instance
      // Note: with ESM and esm.sh, sometimes jsPDF is a named export or default.
      // We check both for maximum compatibility.
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
      doc.text(`Period: ${fromDate} to ${toDate} BS`, 14, 38);

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

      // Handle autoTable export variations
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

      // Access finalY safely
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

      doc.save(`Artha_Report_${fromDate.replace(/-/g, '_')}_to_${toDate.replace(/-/g, '_')}.pdf`);
      onClose();
    } catch (err) {
      console.error("PDF Export error details:", err);
      alert("Could not generate PDF. Error: " + (err instanceof Error ? err.message : "Internal PDF Generator Error"));
    } finally {
      setIsExportingPDF(false);
    }
  };

  const isProcessing = isExportingCSV || isExportingPDF;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Export Statement</h2>
            <p className="text-sm text-slate-500 font-medium tracking-tight">Select range and download</p>
          </div>
          <button 
            onClick={onClose} 
            disabled={isProcessing}
            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-400 disabled:opacity-30"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="p-6 space-y-6">
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

          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
            <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-2 flex items-center gap-2">
              <i className="fa-solid fa-shield-check"></i> Export Verification
            </h4>
            <ul className="text-[11px] text-indigo-600/70 space-y-1 font-bold list-disc pl-4 uppercase tracking-tighter">
              <li>Verified transaction data only</li>
              <li>Official statement format</li>
              <li>Universal CSV/PDF compatibility</li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleExportCSV}
              disabled={isProcessing}
              className={`py-5 text-white rounded-[1.5rem] font-black shadow-lg shadow-emerald-50 transition-all active:scale-95 flex flex-col items-center justify-center gap-2 ${isExportingCSV ? 'bg-emerald-400' : 'bg-emerald-600 hover:bg-emerald-700'} disabled:opacity-50`}
            >
              {isExportingCSV ? (
                <i className="fa-solid fa-circle-notch fa-spin text-2xl"></i>
              ) : (
                <i className="fa-solid fa-file-csv text-2xl"></i>
              )}
              <span className="text-[10px] uppercase tracking-widest">
                {isExportingCSV ? 'Processing...' : 'CSV Data'}
              </span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isProcessing}
              className={`py-5 text-white rounded-[1.5rem] font-black shadow-lg shadow-indigo-50 transition-all active:scale-95 flex flex-col items-center justify-center gap-2 ${isExportingPDF ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} disabled:opacity-50`}
            >
              {isExportingPDF ? (
                <i className="fa-solid fa-circle-notch fa-spin text-2xl"></i>
              ) : (
                <i className="fa-solid fa-file-pdf text-2xl"></i>
              )}
              <span className="text-[10px] uppercase tracking-widest">
                {isExportingPDF ? 'Processing...' : 'PDF Report'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportManager;
