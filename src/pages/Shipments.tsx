import React, { useState } from 'react';
import { useStore } from '../store';
import { PasswordConfirmModal } from '../components/PasswordConfirmModal';
import { Shipment, ShipmentStatus } from '../types';
import { Plus, Search, Truck, Edit2, Trash2 } from 'lucide-react';

export const Shipments: React.FC = () => {
  const { shipments, setShipments, currentUser } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const isAdmin = currentUser?.role === 'Admin';
  
  const [formData, setFormData] = useState<Partial<Shipment>>({
    lcNumber: '',
    vendor: '',
    origin: '',
    destination: 'Warehouse',
    departureDate: new Date().toISOString().split('T')[0],
    expectedArrival: '',
    status: 'In Transit',
    items: [],
    notes: ''
  });

  const filteredShipments = shipments.filter(s => 
    s.lcNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.vendor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      setShipments(shipments.map(s => s.id === formData.id ? { ...s, ...formData } as Shipment : s));
    } else {
      const newShipment: Shipment = { ...formData, id: Date.now().toString() } as Shipment;
      setShipments([...shipments, newShipment]);
    }
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      lcNumber: '', vendor: '', origin: '', destination: 'Warehouse',
      departureDate: new Date().toISOString().split('T')[0], expectedArrival: '',
      status: 'In Transit', items: [], notes: ''
    });
  };

  const deleteShipment = (id: string) => {
    if (confirm('Are you sure you want to delete this shipment?')) {
      setShipments(shipments.filter(s => s.id !== id));
    }
  };

  const getStatusColor = (status: ShipmentStatus) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'In Transit': return 'bg-blue-100 text-blue-800';
      case 'Customs Clearance': return 'bg-orange-100 text-orange-800';
      case 'Delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <PasswordConfirmModal isOpen={!!pendingAction} onConfirm={() => { pendingAction?.(); setPendingAction(null); }} onCancel={() => setPendingAction(null)} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Shipments & LC Tracker</h1>
        {isAdmin && (
          <button 
            onClick={() => { resetForm(); setIsAdding(true); }}
            className="flex items-center px-4 py-2 bg-[#36609b] text-white shadow-md shadow-[#36609b]/20 hover:-translate-y-0.5 transition-all rounded-xl hover:bg-[#36609b] transition-colors"
          >
            <Plus size={20} className="mr-2" />
            New Shipment
          </button>
        )}
      </div>

      {isAdding && isAdmin && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200/60">
          <h2 className="text-lg font-bold mb-4">{formData.id ? 'Edit Shipment' : 'New Shipment'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">LC Number</label>
              <input required type="text" value={formData.lcNumber} onChange={e => setFormData({...formData, lcNumber: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vendor/Supplier</label>
              <input required type="text" value={formData.vendor} onChange={e => setFormData({...formData, vendor: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as ShipmentStatus})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none">
                <option value="In Transit">In Transit</option>
                <option value="Customs Clearance">Customs Clearance</option>
                <option value="Delivered">Delivered</option>
                <option value="Delayed">Delayed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Origin</label>
              <input type="text" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Departure Date</label>
              <input type="date" value={formData.departureDate} onChange={e => setFormData({...formData, departureDate: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Expected Arrival</label>
              <input type="date" value={formData.expectedArrival} onChange={e => setFormData({...formData, expectedArrival: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-600 bg-gray-100 rounded-xl hover:bg-gray-200">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-[#a5bd55] text-white shadow-md shadow-[#a5bd55]/20 hover:-translate-y-0.5 transition-all rounded-xl hover:bg-[#8da742]">Save Shipment</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200/60 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center bg-slate-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by LC Number or Vendor..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#36609b]"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                <th className="p-4 align-middle border-b">LC Number</th>
                <th className="p-4 align-middle border-b">Vendor</th>
                <th className="p-4 align-middle border-b">Origin</th>
                <th className="p-4 align-middle border-b">Dates</th>
                <th className="p-4 align-middle border-b">Status</th>
                <th className="p-4 align-middle border-b">Notes</th>
                {isAdmin && <th className="p-4 align-middle border-b text-center">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredShipments.map(s => (
                <tr key={s.id} className="border-b hover:bg-slate-50 transition-colors">
                  <td className="p-4 align-middle font-medium">{s.lcNumber}</td>
                  <td className="p-4 align-middle">{s.vendor}</td>
                  <td className="p-4 align-middle text-slate-500">{s.origin}</td>
                  <td className="p-4 align-middle">
                    <div className="text-sm">
                      <span className="text-slate-500">Dep:</span> {new Date(s.departureDate).toLocaleDateString()}<br/>
                      <span className="text-slate-500">Arr:</span> {s.expectedArrival ? new Date(s.expectedArrival).toLocaleDateString() : 'TBD'}
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(s.status)}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-4 align-middle text-sm text-slate-600 max-w-xs truncate">{s.notes}</td>
                  {isAdmin && (
                    <td className="p-4 align-middle">
                      <div className="flex justify-center space-x-2">
                        <button onClick={() => {setFormData(s); setIsAdding(true);}} className="text-[#36609b] hover:bg-blue-50 p-1 rounded"><Edit2 size={18} /></button>
                        <button onClick={() => deleteShipment(s.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {filteredShipments.length === 0 && (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center">
              <Truck size={48} className="text-gray-300 mb-4" />
              <p>No shipments found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
