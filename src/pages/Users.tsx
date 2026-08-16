import React, { useState } from 'react';
import { useStore } from '../store';
import { PasswordConfirmModal } from '../components/PasswordConfirmModal';
import { User, Role } from '../types';
import { Plus, Trash2, Shield, Edit2 } from 'lucide-react';

export const Users: React.FC = () => {
  const { users, setUsers, currentUser } = useStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const defaultFeatures = ['dashboard', 'billing', 'inventory'];
  
  const [formData, setFormData] = useState<Partial<User>>({
    name: '', username: '', email: '', role: 'Employee', password: '', accessibleFeatures: defaultFeatures, photoUrl: '', idNumber: '', phoneNumber: ''
  });

  if (currentUser?.role !== 'Admin') {
    return <div className="p-8 text-center text-red-500 font-bold">Access Denied: Admin level lock active.</div>;
  }

  const allFeatures = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'billing', label: 'Billing' },
    { id: 'invoice-history', label: 'Invoice History' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'ledger', label: 'Ledger' },
    { id: 'shipments', label: 'Shipments' },
    { id: 'payroll', label: 'Payroll' },
    { id: 'clients', label: 'Clients' },
    { id: 'delivery-tracker', label: 'Delivery Tracker' },
    { id: 'returns', label: 'Returns & Credits' },
  ];

  const handleFeatureToggle = (featureId: string) => {
    const current = formData.accessibleFeatures || [];
    if (current.includes(featureId)) {
      setFormData({ ...formData, accessibleFeatures: current.filter(f => f !== featureId) });
    } else {
      setFormData({ ...formData, accessibleFeatures: [...current, featureId] });
    }
  };

  const openAddForm = () => {
    setFormData({ name: '', username: '', email: '', role: 'Employee', password: '', accessibleFeatures: defaultFeatures, photoUrl: '', idNumber: '', phoneNumber: '' });
    setEditingUserId(null);
    setIsFormOpen(true);
  };

  const openEditForm = (user: User) => {
    setFormData(user);
    setEditingUserId(user.id);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPendingAction(() => () => {
    if (editingUserId) {
      setUsers(users.map(u => u.id === editingUserId ? { ...u, ...formData } as User : u));
    } else {
      const newUser: User = { 
        ...formData, 
        id: Date.now().toString() 
      } as User;
      setUsers([...users, newUser]);
    }
    setIsFormOpen(false);
    setFormData({ name: '', username: '', email: '', role: 'Employee', password: '', accessibleFeatures: defaultFeatures, photoUrl: '', idNumber: '', phoneNumber: '' });
    });
  };

  const confirmDelete = () => {
    if (userToDelete) {
      setPendingAction(() => () => {
        setUsers(users.filter(u => u.id !== userToDelete));
        setUserToDelete(null);
      });
    }
  };

  return (
    <div className="space-y-6">
      <PasswordConfirmModal isOpen={!!pendingAction} onConfirm={() => { pendingAction?.(); setPendingAction(null); }} onCancel={() => setPendingAction(null)} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">User Management & Locks</h1>
        <button 
          onClick={openAddForm}
          className="flex items-center px-4 py-2 bg-[#36609b] text-white shadow-md shadow-[#36609b]/20 hover:-translate-y-0.5 transition-all rounded-xl hover:bg-[#36609b] transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add User
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200/60">
          <h2 className="text-lg font-bold mb-4">{editingUserId ? 'Edit User' : 'New User'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input required type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input required type="text" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role (Access Level)</label>
                <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as Role})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none">
                  <option value="Employee">Employee (Limited Access)</option>
                  <option value="Admin">Admin (Full Access)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input type="text" value={formData.phoneNumber || ''} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ID Number</label>
                <input type="text" value={formData.idNumber || ''} onChange={e => setFormData({...formData, idNumber: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" />
              </div>
              <div className="sm:col-span-2 lg:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Photo URL</label>
                <input type="url" placeholder="https://..." value={formData.photoUrl || ''} onChange={e => setFormData({...formData, photoUrl: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" />
              </div>
            </div>

            {formData.role === 'Employee' && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <label className="block text-sm font-medium text-slate-700 mb-2">Feature Permissions</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {allFeatures.map(feature => (
                    <label key={feature.id} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-slate-50 p-2 rounded border">
                      <input 
                        type="checkbox" 
                        checked={formData.accessibleFeatures?.includes(feature.id)}
                        onChange={() => handleFeatureToggle(feature.id)}
                        className="rounded text-[#36609b] focus:ring-[#36609b]"
                      />
                      <span className="text-slate-700">{feature.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-600 bg-gray-100 rounded-xl hover:bg-gray-200">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-[#a5bd55] text-white shadow-md shadow-[#a5bd55]/20 hover:-translate-y-0.5 transition-all rounded-xl hover:bg-[#8da742]">Save User</button>
            </div>
          </form>
        </div>
      )}

      {userToDelete && (
        <div className="fixed inset-0 bg-[#a5bd55] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete User?</h3>
            <p className="text-slate-600 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setUserToDelete(null)} className="px-4 py-2 text-slate-600 bg-gray-100 hover:bg-gray-200 rounded-xl">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                <th className="p-4 align-middle border-b">User</th>
                <th className="p-4 align-middle border-b">Username</th>
                <th className="p-4 align-middle border-b">Contact Info</th>
                <th className="p-4 align-middle border-b">Role / Access</th>
                <th className="p-4 align-middle border-b">Permissions</th>
                <th className="p-4 align-middle border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b hover:bg-slate-50 transition-colors">
                  <td className="p-4 align-middle">
                    <div className="flex items-center">
                      {u.photoUrl ? (
                        <img src={u.photoUrl} alt={u.name} className="w-10 h-10 rounded-full object-cover mr-3 border" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3 text-slate-500 font-bold">
                          {u.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-slate-900">{u.name}</div>
                        {u.idNumber && <div className="text-xs text-slate-500">ID: {u.idNumber}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 align-middle text-slate-600 text-sm">
                    <div>{u.email}</div>
                    {u.phoneNumber && <div>{u.phoneNumber}</div>}
                  </td>
                  <td className="p-4 align-middle">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${u.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-slate-700'}`}>
                      {u.role === 'Admin' && <Shield size={12} className="mr-1" />}
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 align-middle text-sm text-slate-500">
                    {u.role === 'Admin' ? (
                      <span className="text-slate-400 italic">Full Access</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {u.accessibleFeatures?.map(f => (
                          <span key={f} className="bg-blue-50 text-[#36609b] px-2 py-0.5 rounded text-xs">{f}</span>
                        )) || <span className="text-slate-400 italic">No specific permissions</span>}
                      </div>
                    )}
                  </td>
                  <td className="p-4 align-middle text-center">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => openEditForm(u)}
                        className="p-1 text-[#36609b] hover:bg-blue-50 rounded"
                        title="Edit user"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => u.id !== currentUser.id ? setUserToDelete(u.id) : null} 
                        disabled={u.id === currentUser.id} 
                        className={`p-1 rounded ${u.id === currentUser.id ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                        title={u.id === currentUser.id ? "Cannot delete yourself" : "Delete user"}
                      >
                        <Trash2 size={18} />
                      </button>
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
