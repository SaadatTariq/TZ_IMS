import React, { useState } from 'react';
import { useStore } from '../store';
import { ReturnEntry, ReturnItem } from '../types';
import { Plus, Search } from 'lucide-react';
import { PasswordConfirmModal } from '../components/PasswordConfirmModal';

export const Returns: React.FC = () => {
  const { returns, setReturns, clients, products, setProducts, currentUser, invoices } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [items, setItems] = useState<ReturnItem[]>([]);
  
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState<'Damaged' | 'Expired' | 'Wrong Item' | 'Other'>('Damaged');
  const [action, setAction] = useState<'Return to Stock' | 'Write Off'>('Write Off');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  
  const isAdmin = currentUser?.role === 'Admin';
  if (!isAdmin) {
    return <div className="p-8 text-center text-red-500 font-bold">Access Denied: Admin level lock active.</div>;
  }

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const addItem = () => {
    if (!selectedProductId || quantity <= 0 || !selectedClient) return;
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;
    
    // Auto-fetch the price we sold it for using the client's priceField
    const price = product[selectedClient.priceField as keyof typeof product] as number || 0;
    
    setItems([...items, {
      productId: selectedProductId,
      quantity,
      price,
      reason,
      action
    }]);
    
    setSelectedProductId('');
    setQuantity(1);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => items.reduce((acc, item) => acc + (item.quantity * item.price), 0);

  const handleSave = () => {
    if (!selectedClientId || items.length === 0) return alert('Please select a client and add items.');
    setPendingAction(() => () => {
    
    const newReturn: ReturnEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      clientId: selectedClientId,
      items,
      totalValue: calculateTotal(),
      status: 'Processed'
    };
    
    setReturns([...(returns || []), newReturn]);
    
    // Update Inventory for "Return to Stock"
    const productsToUpdate = [...products];
    let inventoryChanged = false;
    items.forEach(item => {
      if (item.action === 'Return to Stock') {
        const prodIndex = productsToUpdate.findIndex(p => p.id === item.productId);
        if (prodIndex !== -1) {
          productsToUpdate[prodIndex] = {
            ...productsToUpdate[prodIndex],
            stock: productsToUpdate[prodIndex].stock + item.quantity
          };
          inventoryChanged = true;
        }
      }
    });
    
    if (inventoryChanged) {
      setProducts(productsToUpdate);
    }
    
    setIsAdding(false);
    setSelectedClientId('');
    setItems([]);
    });
  };

  return (
    <div className="space-y-6">
      <PasswordConfirmModal isOpen={!!pendingAction} onConfirm={() => { pendingAction?.(); setPendingAction(null); }} onCancel={() => setPendingAction(null)} />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Returns & Credit Notes</h1>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center px-4 py-2 bg-[#36609b] text-white shadow-md shadow-[#36609b]/20 hover:-translate-y-0.5 transition-all rounded-xl hover:bg-[#36609b] transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Process New Return
        </button>
      </div>

      {isAdding && (

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200/60 space-y-6">
          <div className="mb-4 relative z-50">
            <label className="block text-sm font-medium text-slate-700 mb-2">Search Invoice (Optional)</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search by Invoice ID or Client Name..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSearch(true); }}
                onFocus={() => setShowSearch(true)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none"
              />
              <Search className="absolute right-3 top-2.5 text-slate-400" size={18} />
            </div>
            
            {showSearch && searchQuery.length > 1 && (
              <div className="absolute z-50 mt-1 w-full bg-white border rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {invoices.filter(inv => {
                  const cName = clients.find(c => c.id === inv.clientId)?.name.toLowerCase() || '';
                  const q = searchQuery.toLowerCase();
                  return inv.id.toLowerCase().includes(q) || cName.includes(q);
                }).map(inv => (
                  <div 
                    key={inv.id} 
                    className="p-3 hover:bg-slate-50 cursor-pointer border-b last:border-b-0"
                    onClick={() => {
                      setSelectedClientId(inv.clientId);
                      setSearchQuery(inv.id + ' (' + (clients.find(c => c.id === inv.clientId)?.name || '') + ')');
                      setShowSearch(false);
                      setItems([]);
                    }}
                  >
                    <div className="font-bold text-sm">Invoice #{inv.id}</div>
                    <div className="text-xs text-slate-500">
                      {clients.find(c => c.id === inv.clientId)?.name} • {new Date(inv.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Click away listener overlay hack */}
            {showSearch && (
              <div className="fixed inset-0 z-40" onClick={() => setShowSearch(false)}></div>
            )}
          </div>
          
          <div className="relative z-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Client</label>

            <select 
              value={selectedClientId} 
              onChange={(e) => { setSelectedClientId(e.target.value); setItems([]); }}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none"
            >
              <option value="">Select a client...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {selectedClientId && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="font-semibold mb-4">Add Return Item</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Product</label>
                  <select 
                    value={selectedProductId} 
                    onChange={e => setSelectedProductId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none"
                  >
                    <option value="">Select product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.code} - {p.description}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Qty</label>
                  <input type="number" min="1" value={quantity} onChange={e => setQuantity(parseInt(e.target.value))} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Reason</label>
                  <select value={reason} onChange={e => setReason(e.target.value as any)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none">
                    <option value="Damaged">Damaged</option>
                    <option value="Expired">Expired</option>
                    <option value="Wrong Item">Wrong Item</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Action</label>
                  <select value={action} onChange={e => setAction(e.target.value as any)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none">
                    <option value="Write Off">Write Off</option>
                    <option value="Return to Stock">Return to Stock</option>
                  </select>
                </div>
              </div>
              <button type="button" onClick={addItem} className="mt-4 px-4 py-2 bg-gray-200 text-slate-800 rounded-xl text-sm font-medium hover:bg-gray-300">
                Add to Return Note
              </button>
            </div>
          )}

          {items.length > 0 && (
            <div>
              <table className="w-full text-left text-sm mb-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2">Product</th>
                    <th className="p-2 text-right">Qty</th>
                    <th className="p-2 text-right">Price</th>
                    <th className="p-2 text-right">Total</th>
                    <th className="p-2 text-center">Reason / Action</th>
                    <th className="p-2 text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const p = products.find(prod => prod.id === item.productId);
                    return (
                      <tr key={index} className="border-b">
                        <td className="p-2">{p?.code} - {p?.description}</td>
                        <td className="p-2 text-right">{item.quantity}</td>
                        <td className="p-2 text-right">৳{item.price}</td>
                        <td className="p-2 text-right font-medium">৳{item.quantity * item.price}</td>
                        <td className="p-2 text-center text-xs">
                          <span className="bg-gray-100 px-2 py-1 rounded">{item.reason}</span>
                          <span className={`ml-1 px-2 py-1 rounded ${item.action === 'Return to Stock' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{item.action}</span>
                        </td>
                        <td className="p-2 text-center">
                          <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700">Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl">
                <span className="font-bold text-slate-700">Total Credit Value:</span>
                <span className="text-xl font-bold text-[#36609b]">৳{calculateTotal().toLocaleString()}</span>
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button onClick={() => setIsAdding(false)} className="px-4 py-2 bg-gray-100 text-slate-700 rounded-xl font-medium">Cancel</button>
                <button onClick={handleSave} className="px-6 py-2 bg-[#a5bd55] hover:bg-[#8da742] text-white rounded-xl font-bold">Process Return</button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                <th className="p-4 align-middle border-b">Date</th>
                <th className="p-4 align-middle border-b">Client</th>
                <th className="p-4 align-middle border-b">Items</th>
                <th className="p-4 align-middle border-b text-right">Credit Value</th>
                <th className="p-4 align-middle border-b text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {(returns || []).slice().reverse().map(ret => {
                const client = clients.find(c => c.id === ret.clientId);
                return (
                  <tr key={ret.id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="p-4 align-middle whitespace-nowrap">{new Date(ret.date).toLocaleDateString()}</td>
                    <td className="p-4 align-middle font-medium">{client?.name || 'Unknown'}</td>
                    <td className="p-4 align-middle text-sm text-slate-600">
                      {ret.items.length} product(s) returned
                    </td>
                    <td className="p-4 align-middle text-right font-bold text-red-500">- ৳{ret.totalValue.toLocaleString()}</td>
                    <td className="p-4 align-middle text-center">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">{ret.status}</span>
                    </td>
                  </tr>
                );
              })}
              {(!returns || returns.length === 0) && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No returns processed yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
