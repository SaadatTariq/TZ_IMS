import React, { useState } from 'react';
import { useStore } from '../store';
import { PayrollEntry } from '../types';
import { Plus, Trash2, CheckCircle } from 'lucide-react';

export const Payroll: React.FC = () => {
  const { users, payroll, setPayroll } = useStore();
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center px-4 py-2 bg-[#4097d0] text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add Salary Record
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">New Salary Entry</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <select required value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} className="w-full px-3 py-2 border rounded-md">
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <input required type="month" value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (৳)</label>
              <input required type="number" step="0.01" value={formData.salary} onChange={e => setFormData({...formData, salary: parseFloat(e.target.value)})} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full px-3 py-2 border rounded-md">
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
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
                <th className="p-4 border-b">Employee Name</th>
                <th className="p-4 border-b">Month</th>
                <th className="p-4 border-b text-right">Amount (৳)</th>
                <th className="p-4 border-b text-center">Status</th>
                <th className="p-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payroll.map(p => {
                const emp = users.find(u => u.id === p.employeeId);
                return (
                  <tr key={p.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium">{emp?.name || 'Unknown'}</td>
                    <td className="p-4">{p.month}</td>
                    <td className="p-4 text-right font-semibold">৳{p.salary.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4">
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
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No payroll entries found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
