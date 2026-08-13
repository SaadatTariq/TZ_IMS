import React, { useState } from 'react';
import { useStore } from '../store';
import { LedgerEntry } from '../types';
import { Plus } from 'lucide-react';

export const Ledger: React.FC = () => {
  const { ledger, setLedger, invoices, setInvoices, payroll } = useStore();
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
        <h1 className="text-2xl font-bold text-gray-900">General Ledger</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center px-4 py-2 bg-[#4097d0] text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Manual Entry
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">New Ledger Entry</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input required type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select 
                className="w-full px-3 py-2 border rounded-md"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input required type="number" step="0.01" value={formData.debit || formData.credit} onChange={e => {
                const val = parseFloat(e.target.value);
                if (formData.debit > 0) setFormData({...formData, debit: val, credit: 0});
                else setFormData({...formData, credit: val, debit: 0});
              }} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-[#a5bd55] text-white rounded-lg hover:bg-[#8da742]">Save Entry</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              
              <tr className="bg-gray-50 text-gray-600 text-sm">
                <th className="p-4 border-b">Date</th>
                <th className="p-4 border-b">Description</th>
                <th className="p-4 border-b text-right text-red-600">Debit (Out)</th>
                <th className="p-4 border-b text-right text-green-600">Credit (In)</th>
                <th className="p-4 border-b text-right">Balance</th>
                <th className="p-4 border-b text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {ledgerWithBalance.slice().reverse().map(entry => (
                
                <tr key={entry.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4 whitespace-nowrap">{new Date(entry.date).toLocaleDateString()}</td>
                  <td className="p-4">{entry.description} {entry.originalInvoice?.paymentMethod ? `(${entry.originalInvoice.paymentMethod})` : ''}</td>
                  <td className="p-4 text-right text-red-600">{entry.debit > 0 ? `৳${entry.debit.toLocaleString()}` : '-'}</td>
                  <td className="p-4 text-right text-green-600">{entry.credit > 0 ? `৳${entry.credit.toLocaleString()}` : '-'}</td>
                  <td className="p-4 text-right font-bold">{!entry.originalInvoice || entry.originalInvoice.status === 'Paid' ? `৳${entry.balance?.toLocaleString()}` : '-'}</td>
                  <td className="p-4 text-center">
                    {entry.originalInvoice ? (
                      <button 
                        onClick={() => toggleInvoiceStatus(entry.originalInvoice)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${entry.originalInvoice.status === 'Paid' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}
                      >
                        {entry.originalInvoice.status === 'Paid' ? 'Paid' : 'Mark Paid'}
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {ledgerWithBalance.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No ledger entries found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
