import React from 'react';
import { useStore } from '../store';
import { Invoice } from '../types';
import { Truck, CheckCircle, Clock } from 'lucide-react';

export const DeliveryTracker: React.FC = () => {
  const { invoices, setInvoices, clients, currentUser } = useStore();
  
  const isAdmin = currentUser?.role === 'Admin';

  // Only track Approved, Unpaid, or Paid invoices. Exclude Draft/Cancelled.
  const trackableInvoices = invoices.filter(inv => ['Approved', 'Unpaid', 'Paid'].includes(inv.status));
  
  const updateDeliveryStatus = (id: string, status: 'Pending' | 'Dispatched' | 'Delivered') => {
    setInvoices(invoices.map(inv => {
      if (inv.id === id) {
        return { 
          ...inv, 
          deliveryStatus: status,
          deliveryDate: status === 'Delivered' ? new Date().toISOString() : inv.deliveryDate 
        };
      }
      return inv;
    }));
  };

  const pending = trackableInvoices.filter(i => !i.deliveryStatus || i.deliveryStatus === 'Pending');
  const dispatched = trackableInvoices.filter(i => i.deliveryStatus === 'Dispatched');
  const delivered = trackableInvoices.filter(i => i.deliveryStatus === 'Delivered');

  const renderInvoiceCard = (inv: Invoice) => {
    const client = clients.find(c => c.id === inv.clientId);
    return (
      <div key={inv.id} className="bg-white p-4 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200/60 mb-3">
        <div className="flex justify-between items-start mb-2">
          <span className="font-bold text-slate-800">{inv.id}</span>
          <span className="text-xs text-slate-500">{new Date(inv.date).toLocaleDateString()}</span>
        </div>
        <div className="font-medium text-[#36609b] text-sm mb-1">{client?.name || 'Unknown Client'}</div>
        <div className="text-xs text-slate-600 mb-3">{inv.items.length} items • ৳{inv.total.toLocaleString()}</div>
        
        <div className="flex gap-2">
          {(!inv.deliveryStatus || inv.deliveryStatus === 'Pending') && (
            <button 
              onClick={() => updateDeliveryStatus(inv.id, 'Dispatched')}
              className="flex-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-xs font-bold py-1.5 rounded transition-colors"
            >
              Mark Dispatched
            </button>
          )}
          {inv.deliveryStatus === 'Dispatched' && (
            <button 
              onClick={() => updateDeliveryStatus(inv.id, 'Delivered')}
              className="flex-1 bg-green-100 hover:bg-green-200 text-green-800 text-xs font-bold py-1.5 rounded transition-colors"
            >
              Mark Delivered
            </button>
          )}
          {inv.deliveryStatus === 'Delivered' && (
            <div className="flex-1 text-center bg-slate-50 text-green-600 text-xs font-bold py-1.5 rounded border border-green-100">
              Delivered on {inv.deliveryDate ? new Date(inv.deliveryDate).toLocaleDateString() : 'N/A'}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Delivery Tracker</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Column */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-4 text-slate-700">
            <Clock size={20} />
            <h2 className="font-bold text-lg">Pending Packing</h2>
            <span className="ml-auto bg-gray-200 text-slate-700 text-xs py-1 px-2 rounded-full">{pending.length}</span>
          </div>
          <div className="space-y-3">
            {pending.map(renderInvoiceCard)}
            {pending.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No pending orders.</p>}
          </div>
        </div>

        {/* Dispatched Column */}
        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-4 text-[#36609b]">
            <Truck size={20} />
            <h2 className="font-bold text-lg">Dispatched / In Transit</h2>
            <span className="ml-auto bg-blue-100 text-blue-800 text-xs py-1 px-2 rounded-full">{dispatched.length}</span>
          </div>
          <div className="space-y-3">
            {dispatched.map(renderInvoiceCard)}
            {dispatched.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No dispatched orders.</p>}
          </div>
        </div>

        {/* Delivered Column */}
        <div className="bg-green-50/50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center gap-2 mb-4 text-green-600">
            <CheckCircle size={20} />
            <h2 className="font-bold text-lg">Delivered</h2>
            <span className="ml-auto bg-green-100 text-green-800 text-xs py-1 px-2 rounded-full">{delivered.length}</span>
          </div>
          <div className="space-y-3 h-[600px] overflow-y-auto pr-2">
            {delivered.slice().reverse().map(renderInvoiceCard)}
            {delivered.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No delivered orders.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
