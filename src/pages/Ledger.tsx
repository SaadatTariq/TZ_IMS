import React, { useState } from 'react';
import { useStore } from '../store';
import { LedgerEntry } from '../types';
import { Plus } from 'lucide-react';

export const Ledger: React.FC = () => {
  const { ledger, setLedger, invoices, setInvoices, payroll, returns, clients } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<LedgerEntry>>({
    date: new Date().toISOString().slice(0, 10),
    description: '',
    debit: 0,
    credit: 0
  });

  // Calculate composite ledger (manual entries + auto-generated from invoices and payroll)
  const compositeLedger: (LedgerEntry & { originalInvoice?: any, balance?: number })[] = [...ledger];
  
  invoices.filter(i => ['Approved', 'Paid', 'Unpaid'].includes(i.status)).forEach(i => {
    compositeLedger.push({
      id: `inv-${i.id}`,
      originalInvoice: i,
      date: i.date,
      description: `Invoice Payment - ${i.title || i.clientId}`,
      credit: i.total,
      debit: 0
    });
  });

  payroll.filter(p => p.status === 'Paid').forEach(p => {
    compositeLedger.push({
      id: `pay-${p.id}`,
      date: p.month + '-01', // Approx date for month
      description: `Salary Payment - ${p.month}`,
      credit: 0,
      debit: p.salary
    });
  });

  
  (returns || []).forEach(ret => {
    const client = clients.find(c => c.id === ret.clientId);
    compositeLedger.push({
      id: `ret-${ret.id}`,
      date: ret.date,
      description: `Client Return Note - ${client?.name || 'Unknown'}`,
      credit: 0,
      debit: ret.totalValue
    });
  });
  
  // Sort by date
  compositeLedger.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate running balance
  let runningBalance = 0;
  const ledgerWithBalance = compositeLedger.map(entry => {
    if (!entry.originalInvoice || entry.originalInvoice.status === 'Paid') {
      runningBalance += (entry.credit - entry.debit);
    }
    return { ...entry, balance: runningBalance };
  });

  
  const toggleInvoiceStatus = (invoice: any) => {
    const newStatus = invoice.status === 'Paid' ? 'Unpaid' : 'Paid';
    setInvoices(invoices.map(inv => inv.id === invoice.id ? { ...inv, status: newStatus } : inv));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: LedgerEntry = { 
      ...formData, 
      id: Date.now().toString() 
    } as LedgerEntry;
    setLedger([...ledger, newEntry]);
    setIsAdding(false);
    setFormData({ date: new Date().toISOString().slice(0, 10), description: '', debit: 0, credit: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">General Ledger</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center px-4 py-2 bg-[#36609b] text-white shadow-md shadow-[#36609b]/20 hover:-translate-y-0.5 transition-all rounded-xl hover:bg-[#36609b] transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Manual Entry
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200/60">
          <h2 className="text-lg font-bold mb-4">New Ledger Entry</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" />
            </div>
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input required type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select 
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none"
                onChange={e => {
                  if(e.target.value === 'debit') {
                    setFormData({...formData, debit: formData.credit || 0, credit: 0})
                  } else {
                    setFormData({...formData, credit: formData.debit || 0, debit: 0})
                  }
                }}
              >
                <option value="debit">Debit (Expense)</option>
                <option value="credit">Credit (Income)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
              <input required type="number" step="0.01" value={formData.debit || formData.credit} onChange={e => {
                const val = parseFloat(e.target.value);
                if (formData.debit > 0) setFormData({...formData, debit: val, credit: 0});
                else setFormData({...formData, credit: val, debit: 0});
              }} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" />
            </div>
            <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-600 bg-gray-100 rounded-xl hover:bg-gray-200">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-[#a5bd55] text-white shadow-md shadow-[#a5bd55]/20 hover:-translate-y-0.5 transition-all rounded-xl hover:bg-[#8da742]">Save Entry</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              
              <tr className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                <th className="p-4 align-middle border-b">Date</th>
                <th className="p-4 align-middle border-b">Description</th>
                <th className="p-4 align-middle border-b text-right text-red-600">Debit (Out)</th>
                <th className="p-4 align-middle border-b text-right text-green-600">Credit (In)</th>
                <th className="p-4 align-middle border-b text-right">Balance</th>
                <th className="p-4 align-middle border-b text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {ledgerWithBalance.slice().reverse().map(entry => (
                
                <tr key={entry.id} className="border-b hover:bg-slate-50 transition-colors">
                  <td className="p-4 align-middle whitespace-nowrap">{new Date(entry.date).toLocaleDateString()}</td>
                  <td className="p-4 align-middle">{entry.description} {entry.originalInvoice?.paymentMethod ? `(${entry.originalInvoice.paymentMethod})` : ''}</td>
                  <td className="p-4 align-middle text-right text-red-600">{entry.debit > 0 ? `৳${entry.debit.toLocaleString()}` : '-'}</td>
                  <td className="p-4 align-middle text-right text-green-600">{entry.credit > 0 ? `৳${entry.credit.toLocaleString()}` : '-'}</td>
                  <td className="p-4 align-middle text-right font-bold">{!entry.originalInvoice || entry.originalInvoice.status === 'Paid' ? `৳${entry.balance?.toLocaleString()}` : '-'}</td>
                  <td className="p-4 align-middle text-center">
                    {entry.originalInvoice ? (
                      <button 
                        onClick={() => toggleInvoiceStatus(entry.originalInvoice)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${entry.originalInvoice.status === 'Paid' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}
                      >
                        {entry.originalInvoice.status === 'Paid' ? 'Paid' : 'Mark Paid'}
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {ledgerWithBalance.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">No ledger entries found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
