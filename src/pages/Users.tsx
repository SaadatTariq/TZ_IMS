import React, { useState } from 'react';
import { useStore } from '../store';
import { User, Role } from '../types';
import { Plus, Trash2, Shield, Key } from 'lucide-react';

export const Users: React.FC = () => {
  const { users, setUsers, currentUser } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  
  const defaultFeatures = ['dashboard', 'inventory', 'billing'];
  
  const [formData, setFormData] = useState<Partial<User>>({
    name: '', email: '', role: 'Employee', password: '', accessibleFeatures: defaultFeatures
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
  ];

  const handleFeatureToggle = (featureId: string) => {
    const current = formData.accessibleFeatures || [];
    if (current.includes(featureId)) {
      setFormData({ ...formData, accessibleFeatures: current.filter(f => f !== featureId) });
    } else {
      setFormData({ ...formData, accessibleFeatures: [...current, featureId] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = { 
      ...formData, 
      id: Date.now().toString() 
    } as User;
    setUsers([...users, newUser]);
    setIsAdding(false);
    setFormData({ name: '', email: '', role: 'Employee', password: '', accessibleFeatures: defaultFeatures });
  };

  const confirmDelete = () => {
    if (userToDelete) {
      setUsers(users.filter(u => u.id !== userToDelete));
      setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">User Management & Locks</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center px-4 py-2 bg-[#4097d0] text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add User
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">New User</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input required type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role (Access Level)</label>
                <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as Role})} className="w-full px-3 py-2 border rounded-md">
                  <option value="Employee">Employee (Limited Access)</option>
                  <option value="Admin">Admin (Full Access)</option>
                </select>
              </div>
            </div>

            {formData.role === 'Employee' && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">Feature Permissions</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {allFeatures.map(feature => (
                    <label key={feature.id} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded border">
                      <input 
                        type="checkbox" 
                        checked={formData.accessibleFeatures?.includes(feature.id)}
                        onChange={() => handleFeatureToggle(feature.id)}
                        className="rounded text-[#4097d0] focus:ring-[#4097d0]"
                      />
                      <span className="text-gray-700">{feature.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-[#a5bd55] text-white rounded-lg hover:bg-[#8da742]">Save User</button>
            </div>
          </form>
        </div>
      )}

      {userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete User?</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setUserToDelete(null)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm">
                <th className="p-4 border-b">Name</th>
                <th className="p-4 border-b">Email</th>
                <th className="p-4 border-b">Role / Access</th>
                <th className="p-4 border-b">Permissions</th>
                <th className="p-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium">{u.name}</td>
                  <td className="p-4 text-gray-600">{u.email}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${u.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                      {u.role === 'Admin' && <Shield size={12} className="mr-1" />}
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {u.role === 'Admin' ? (
                      <span className="text-gray-400 italic">Full Access</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {u.accessibleFeatures?.map(f => (
                          <span key={f} className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs">{f}</span>
                        )) || <span className="text-gray-400 italic">No specific permissions</span>}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => u.id !== currentUser.id ? setUserToDelete(u.id) : null} 
                      disabled={u.id === currentUser.id} 
                      className={`p-1 rounded ${u.id === currentUser.id ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                    >
                      <Trash2 size={18} />
                    </button>
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
