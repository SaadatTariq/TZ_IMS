import React, { useState } from 'react';
import { useStore } from '../store';
import { User, Role } from '../types';
import { Plus, Trash2, Shield } from 'lucide-react';

export const Users: React.FC = () => {
  const { users, setUsers, currentUser } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    name: '', email: '', role: 'Employee'
  });

  if (currentUser?.role !== 'Admin') {
    return <div className="p-8 text-center text-red-500 font-bold">Access Denied: Admin level lock active.</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = { 
      ...formData, 
      id: Date.now().toString() 
    } as User;
    setUsers([...users, newUser]);
    setIsAdding(false);
    setFormData({ name: '', email: '', role: 'Employee' });
  };

  const deleteUser = (id: string) => {
    if (id === currentUser.id) return alert('Cannot delete yourself.');
    if (confirm('Delete this user?')) {
      setUsers(users.filter(u => u.id !== id));
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
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role (Access Level)</label>
              <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as Role})} className="w-full px-3 py-2 border rounded-md">
                <option value="Employee">Employee (Limited Access)</option>
                <option value="Admin">Admin (Full Access)</option>
              </select>
            </div>
            <div className="sm:col-span-3 flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-[#a5bd55] text-white rounded-lg hover:bg-[#8da742]">Save User</button>
            </div>
          </form>
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
                  <td className="p-4 text-center">
                    <button onClick={() => deleteUser(u.id)} disabled={u.id === currentUser.id} className={`p-1 rounded ${u.id === currentUser.id ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}>
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
