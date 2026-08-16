import React, { useState } from 'react';
import { useStore } from '../store';
import { PasswordConfirmModal } from '../components/PasswordConfirmModal';
import { Client } from '../types';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export const Clients: React.FC = () => {
  const { clients, setClients, currentUser } = useStore();
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const isAdmin = currentUser?.role === 'Admin';
  
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    displayName: '',
    address: '',
    headers: ['S.L No', 'Item Code', 'Description', 'Quantity', 'TP', 'Total', 'Remark'],
    priceField: 'cpu',
    discountPercent: 0
  });

  const [headerInput, setHeaderInput] = useState(formData.headers?.join(', ') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      headers: headerInput.split(',').map(s => s.trim()).filter(s => s.length > 0)
    };

    if (formData.id) {
      setClients(clients.map(c => c.id === formData.id ? { ...c, ...finalData } as Client : c));
    } else {
      setClients([...clients, { ...finalData, id: Date.now().toString() } as Client]);
    }
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '', displayName: '', address: '',
      headers: ['S.L No', 'Item Code', 'Description', 'Quantity', 'TP', 'Total', 'Remark'],
      priceField: 'cpu', discountPercent: 0
    });
    setHeaderInput('S.L No, Item Code, Description, Quantity, TP, Total, Remark');
  };

  const editClient = (client: Client) => {
    setFormData(client);
    setHeaderInput(client.headers.join(', '));
    setIsAdding(true);
  };

  const deleteClient = (id: string) => {
    setPendingAction(() => () => {
      setClients(clients.filter(c => c.id !== id));
    });
  };

  if (!isAdmin) {
    return <div className="p-8 text-center text-slate-500">Only administrators can manage clients.</div>;
  }

  return (
    <div className="space-y-6">
      <PasswordConfirmModal isOpen={!!pendingAction} onConfirm={() => { pendingAction?.(); setPendingAction(null); }} onCancel={() => setPendingAction(null)} />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Client Management</h1>
        <button 
          onClick={() => { resetForm(); setIsAdding(true); }}
          className="flex items-center px-4 py-2 bg-[#36609b] text-white shadow-md shadow-[#36609b]/20 hover:-translate-y-0.5 transition-all rounded-xl hover:bg-[#36609b] transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add Client
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200/60">
          <h2 className="text-lg font-bold mb-4">{formData.id ? 'Edit Client' : 'New Client'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">System Name (Internal)</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" placeholder="e.g. CSD" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Display Company Name (Invoice)</label>
              <input type="text" value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" placeholder="Leave blank if dynamic" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Address (Invoice)</label>
              <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" placeholder="Leave blank if dynamic" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Default Price Field</label>
              <select value={formData.priceField} onChange={e => setFormData({...formData, priceField: e.target.value as any})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none">
                <option value="cpu">CPU</option>
                <option value="mrp">MRP</option>
                <option value="tpCsd">TP (CSD)</option>
                <option value="tpCaptainsWorld">TP (Captains World)</option>
                <option value="tpCoopers">TP (Coopers)</option>
                <option value="tpShumis">TP (Shumis)</option>
                <option value="tpIferi">TP (Iferi)</option>
                <option value="tpOverseas">TP (Overseas)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Discount %</label>
              <input type="number" min="0" max="100" step="1" value={formData.discountPercent} onChange={e => setFormData({...formData, discountPercent: Number(e.target.value)})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Invoice Table Headers (Comma separated)</label>
              <input required type="text" value={headerInput} onChange={e => setHeaderInput(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" placeholder="S.L No, Item Code, Description, Quantity, CPU, Total, Remark" />
            </div>
            
            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-600 bg-gray-100 rounded-xl hover:bg-gray-200">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-[#a5bd55] text-white shadow-md shadow-[#a5bd55]/20 hover:-translate-y-0.5 transition-all rounded-xl hover:bg-[#8da742]">Save Client</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                <th className="p-4 align-middle border-b">Internal Name</th>
                <th className="p-4 align-middle border-b">Display Name</th>
                <th className="p-4 align-middle border-b">Price Field</th>
                <th className="p-4 align-middle border-b">Headers (Columns)</th>
                <th className="p-4 align-middle border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(c => (
                <tr key={c.id} className="border-b hover:bg-slate-50">
                  <td className="p-4 align-middle font-medium">{c.name}</td>
                  <td className="p-4 align-middle text-slate-500">{c.displayName || '-'}</td>
                  <td className="p-4 align-middle text-sm"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full">{c.priceField}</span></td>
                  <td className="p-4 align-middle text-xs text-slate-500 max-w-xs truncate" title={c.headers.join(', ')}>
                    {c.headers.join(', ')}
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex justify-center space-x-2">
                      <button onClick={() => editClient(c)} className="text-[#36609b] hover:bg-blue-50 p-1 rounded"><Edit2 size={18} /></button>
                      <button onClick={() => deleteClient(c.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
