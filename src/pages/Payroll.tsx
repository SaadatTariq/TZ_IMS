import React, { useState } from 'react';
import { useStore } from '../store';
import { PasswordConfirmModal } from '../components/PasswordConfirmModal';
import { PayrollEntry } from '../types';
import { Plus, Trash2, CheckCircle } from 'lucide-react';

export const Payroll: React.FC = () => {
  const { users, payroll, setPayroll } = useStore();
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<PayrollEntry>>({
    employeeId: users[0]?.id || '',
    month: new Date().toISOString().slice(0, 7),
    salary: 0,
    status: 'Pending'
  });

  const employees = users.filter(u => u.role === 'Employee');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: PayrollEntry = { 
      ...formData, 
      id: Date.now().toString() 
    } as PayrollEntry;
    setPayroll([...payroll, newEntry]);
    setIsAdding(false);
  };

  const markPaid = (id: string) => {
    setPayroll(payroll.map(p => p.id === id ? { ...p, status: 'Paid' } : p));
  };

  const deleteEntry = (id: string) => {
    if (confirm('Delete this payroll entry?')) {
      setPayroll(payroll.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <PasswordConfirmModal isOpen={!!pendingAction} onConfirm={() => { pendingAction?.(); setPendingAction(null); }} onCancel={() => setPendingAction(null)} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Payroll Management</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center px-4 py-2 bg-[#36609b] text-white shadow-md shadow-[#36609b]/20 hover:-translate-y-0.5 transition-all rounded-xl hover:bg-[#36609b] transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add Salary Record
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200/60">
          <h2 className="text-lg font-bold mb-4">New Salary Entry</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Employee</label>
              <select required value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none">
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Month</label>
              <input required type="month" value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount (৳)</label>
              <input required type="number" step="0.01" value={formData.salary} onChange={e => setFormData({...formData, salary: parseFloat(e.target.value)})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none">
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
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
                <th className="p-4 align-middle border-b">Employee Name</th>
                <th className="p-4 align-middle border-b">Month</th>
                <th className="p-4 align-middle border-b text-right">Amount (৳)</th>
                <th className="p-4 align-middle border-b text-center">Status</th>
                <th className="p-4 align-middle border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payroll.map(p => {
                const emp = users.find(u => u.id === p.employeeId);
                return (
                  <tr key={p.id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="p-4 align-middle font-medium">{emp?.name || 'Unknown'}</td>
                    <td className="p-4 align-middle">{p.month}</td>
                    <td className="p-4 align-middle text-right font-semibold">৳{p.salary.toLocaleString()}</td>
                    <td className="p-4 align-middle text-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex justify-center space-x-2">
                        {p.status === 'Pending' && (
                          <button onClick={() => markPaid(p.id)} className="text-green-500 hover:bg-green-50 p-1 rounded" title="Mark Paid">
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button onClick={() => deleteEntry(p.id)} className="text-red-500 hover:bg-red-50 p-1 rounded" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {payroll.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No payroll entries found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
