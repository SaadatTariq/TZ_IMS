import React, { useState } from 'react';
import { useStore } from '../store';
import { FileText, XCircle, Search, Eye } from 'lucide-react';
import { Invoice } from '../types';

export const InvoiceHistory: React.FC = () => {
  const { invoices, setInvoices, products, setProducts, currentUser } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const isAdmin = currentUser?.role === 'Admin';

  const handleCancel = (invoice: Invoice) => {
    if (!isAdmin) return;
    const password = prompt('Please enter your admin password to cancel this invoice:');
    if (!password) return;
    
    if (password !== currentUser?.password) {
      alert('Incorrect password. Cancellation aborted.');
      return;
    }

    // Verify it's not already cancelled
    if (invoice.status === 'Cancelled') {
      alert('Invoice is already cancelled.');
      return;
    }

    // Update stock only if the invoice was previously Approved or Paid (meaning stock was deducted).
    // If it was 'Pending Approval', stock wasn't deducted yet, so no need to restock.
    if (invoice.status === 'Approved' || invoice.status === 'Paid') {
      const updatedProducts = products.map(p => {
        const invoicedItem = invoice.items.find(i => i.productId === p.id);
        if (invoicedItem) {
          return { ...p, stock: p.stock + invoicedItem.quantity }; // Restock
        }
        return p;
      });
      setProducts(updatedProducts);
    }

    // Update invoice status
    setInvoices(invoices.map(inv => inv.id === invoice.id ? { ...inv, status: 'Cancelled' } : inv));
    alert('Invoice cancelled successfully. Stock has been restored if applicable.');
  };

  const filteredInvoices = invoices
    .filter(inv => inv.title?.toLowerCase().includes(searchTerm.toLowerCase()) || inv.id.includes(searchTerm))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Invoice History</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by ID or Title..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4097d0]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs tracking-wider uppercase">
                <th className="p-4 border-b">Date</th>
                <th className="p-4 border-b">Invoice ID</th>
                <th className="p-4 border-b">Title</th>
                <th className="p-4 border-b">Client</th>
                <th className="p-4 border-b text-right">Total</th>
                <th className="p-4 border-b">Status</th>
                <th className="p-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredInvoices.map(inv => (
                <tr key={inv.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4">{new Date(inv.date).toLocaleDateString()}</td>
                  <td className="p-4 font-medium">{inv.id}</td>
                  <td className="p-4">{inv.title || '-'}</td>
                  <td className="p-4">{inv.clientId}</td>
                  <td className="p-4 text-right">৳{inv.total.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${inv.status === 'Approved' || inv.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                        inv.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => setSelectedInvoice(inv)} 
                        className="text-[#4097d0] hover:bg-blue-50 p-1 rounded"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      {isAdmin && inv.status !== 'Cancelled' && (
                        <button 
                          onClick={() => handleCancel(inv)} 
                          className="text-red-500 hover:bg-red-50 p-1 rounded"
                          title="Cancel Invoice"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredInvoices.length === 0 && <div className="p-8 text-center text-gray-500">No invoices found.</div>}
        </div>
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Invoice Details - {selectedInvoice.id}</h2>
              <button onClick={() => setSelectedInvoice(null)} className="text-gray-500 hover:text-gray-700">
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="mb-4">
                <p><strong>Title:</strong> {selectedInvoice.title}</p>
                <p><strong>Client:</strong> {selectedInvoice.clientId}</p>
                <p><strong>Date:</strong> {new Date(selectedInvoice.date).toLocaleString()}</p>
                <p><strong>Status:</strong> {selectedInvoice.status}</p>
                <p><strong>Created By:</strong> {selectedInvoice.createdBy}</p>
              </div>
              <table className="w-full text-left border-collapse mt-4">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs tracking-wider uppercase border-y">
                    <th className="py-2 px-4">Item Code / Description</th>
                    <th className="py-2 px-4 text-right">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item, idx) => {
                    const prod = products.find(p => p.id === item.productId);
                    return (
                      <tr key={idx} className="border-b">
                        <td className="py-2 px-4">{prod ? `${prod.code} - ${prod.description}` : 'Unknown Item'}</td>
                        <td className="py-2 px-4 text-right">{item.quantity}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-4 text-right">
                <p><strong>Discount:</strong> ৳{(selectedInvoice.discount || 0).toFixed(2)}</p>
                <p className="text-lg font-bold text-[#36609b]"><strong>Total:</strong> ৳{selectedInvoice.total.toFixed(2)}</p>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50">
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
