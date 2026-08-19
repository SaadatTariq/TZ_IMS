import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { PasswordConfirmModal } from '../components/PasswordConfirmModal';
import { Product } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { Plus, Search, Edit2, Trash2, Upload, Download } from 'lucide-react';
import Papa from 'papaparse';

export const Inventory: React.FC<{ type: 'Local' | 'Imported' }> = ({ type }) => {
  const { products, setProducts, currentUser, invoices, addAuditLog } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
    const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = currentUser?.role === 'Admin';
  
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkDeletePassword, setBulkDeletePassword] = useState('');
  const [bulkDeleteError, setBulkDeleteError] = useState('');

  const [formData, setFormData] = useState<Partial<Product>>({
    code: '', barcode: '', description: '',
    descriptionCsd: '', unit: 'Box', cpu: 0, 
    tpCsd: 0, tpCaptainsWorld: 0, tpCoopers: 0, tpShumis: 0, tpGenius: 0, tpOverseas: 0, tpIferi: 0,
    mrp: 0, stock: 0, productType: type, cp: 0
  });


  const turnoverData = React.useMemo(() => {
    // Calculate total sold per product
    const soldMap: Record<string, number> = {};
    const monthlyStockMap: Record<string, number> = {}; // track movement across months roughly
    
    invoices
      .filter(i => i.status === 'Paid' || i.status === 'Approved')
      .forEach(inv => {
        const dateStr = new Date(inv.date).toLocaleString('default', { month: 'short', year: '2-digit' });
        inv.items.forEach(item => {
           const p = products.find(prod => prod.id === item.productId);
           if (p) {
              soldMap[p.description] = (soldMap[p.description] || 0) + item.quantity;
              
              const key = `${dateStr}`;
              monthlyStockMap[key] = (monthlyStockMap[key] || 0) + item.quantity;
           }
        });
      });

    // Top 10 products by turnover
    const topProducts = Object.entries(soldMap)
      .map(([name, sold]) => ({ name, Velocity: sold }))
      .sort((a, b) => b.Velocity - a.Velocity)
      .slice(0, 10);
      
    // Stock Movement (Units Sold by Month)
    const movement = Object.entries(monthlyStockMap)
      .map(([name, value], i) => ({ name, Moved: value, timestamp: new Date(name).getTime() || i }))
      .sort((a, b) => a.timestamp - b.timestamp);

    return { topProducts, movement };
  }, [invoices, products]);

  const filteredProducts = products.filter(p => {
    const isCorrectType = p.productType === type || (!p.productType && type === 'Local');
    if (!isCorrectType) return false;
    
    const s = searchTerm.toLowerCase().replace(/[\s-]/g, '');
    const code = p.code.toLowerCase().replace(/[\s-]/g, '');
    const desc = p.description.toLowerCase().replace(/[\s-]/g, '');
    
    return code.includes(s) || desc.includes(s) || p.description.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  const currentTabInventoryValue = products
    .filter(p => p.productType === type || (!p.productType && type === 'Local'))
    .reduce((sum, p) => sum + (p.stock * (p.cp || 0)), 0);
  
  const handleSelectProduct = (id: string) => {
    const newSelected = new Set(selectedProductIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProductIds(newSelected);
  };
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProductIds(new Set(filteredProducts.map(p => p.id)));
    } else {
      setSelectedProductIds(new Set());
    }
  };
  
  const confirmDeleteSelected = () => {
    if (selectedProductIds.size === 0) return;
    const action = () => {
      setProducts(products.filter(p => !selectedProductIds.has(p.id)));
      setSelectedProductIds(new Set());
    };
    if (isAdmin) {
      action();
    } else {
      setPendingAction(() => action);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const action = () => {
      let finalFormData = { ...formData };
      finalFormData.tpCsd = finalFormData.cpu;
      if (type === 'Local' && !finalFormData.productType) finalFormData.productType = 'Local';
      
      if (formData.id) {
        setProducts(products.map(p => p.id === formData.id ? { ...p, ...finalFormData } as Product : p));
        addAuditLog({
          userName: currentUser?.name || 'Unknown',
          userRole: currentUser?.role || 'Unknown',
          action: 'UPDATE',
          module: 'Inventory',
          description: `Updated product ${finalFormData.code} (${finalFormData.description}).`
        });
      } else {
        const existingProduct = products.find(p => p.code.toLowerCase() === formData.code?.toLowerCase());
        if (existingProduct) {
          setProducts(products.map(p => p.id === existingProduct.id ? { ...p, ...finalFormData, id: p.id } as Product : p));
        } else {
          const newProduct: Product = { ...finalFormData, id: Date.now().toString() } as Product;
          setProducts([...products, newProduct]);
          addAuditLog({
            userName: currentUser?.name || 'Unknown',
            userRole: currentUser?.role || 'Unknown',
            action: 'CREATE',
            module: 'Inventory',
            description: `Added new product ${newProduct.code} (${newProduct.description}).`
          });
        }
      }
      setIsAdding(false);
      resetForm();
    };
    
    if (isAdmin) {
      action();
    } else {
      setPendingAction(() => action);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '', barcode: '', description: '', unit: 'Box', cpu: 0, 
      tpCsd: 0, tpCaptainsWorld: 0, tpCoopers: 0, tpShumis: 0, tpGenius: 0, tpOverseas: 0, tpIferi: 0,
      mrp: 0, stock: 0, productType: type, cp: 0
    });
  };

  const confirmDeleteProduct = () => {
    if (productToDelete) {
      const action = () => {
        const p = products.find(p => p.id === productToDelete);
        setProducts(products.filter(p => p.id !== productToDelete));
        if (p) {
          addAuditLog({
            userName: currentUser?.name || 'Unknown',
            userRole: currentUser?.role || 'Unknown',
            action: 'DELETE',
            module: 'Inventory',
            description: `Deleted product ${p.code} (${p.description}).`
          });
        }
        setProductToDelete(null);
      };
      if (isAdmin) {
        action();
      } else {
        setPendingAction(() => action);
      }
    }
  };

  const confirmBulkDelete = () => {
    if (bulkDeletePassword !== currentUser?.password) {
      setBulkDeleteError("Incorrect password!");
      return;
    }
    setProducts([]);
    setIsBulkDeleting(false);
    setBulkDeletePassword('');
    setBulkDeleteError('');
  };

  const downloadSample = () => {
    const csv = Papa.unparse([
      { Code: 'TZ-1001', Barcode: '1234567', Description: 'Sample Item', Description_CSD: 'Sample Item CSD', Unit: 'Pcs', CP: 95, CPU: 110, TP_Captains: 115, TP_Coopers: 120, TP_Shumis: 125, TP_Genius: 130, TP_Overseas: 135, TP_Iferi: 140, MRP: 200, Stock: 50 }
    ]);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_sample.csv';
    a.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        let updatedProducts = [...products];

        results.data.forEach((row: any, index: number) => {
          const rowCode = row.Code || `CSV-${index}`;
          const existingIndex = updatedProducts.findIndex(p => p.code.toLowerCase() === rowCode.toLowerCase());

          const productData = {
            code: rowCode,
            barcode: row.Barcode || '',
            description: row.Description || 'Unknown',
            descriptionCsd: row.Description_CSD || '',
            unit: row.Unit || 'Box',
            cp: parseFloat(row.CP) || parseFloat(row.CPU) || 0,
            cpu: parseFloat(row.CPU) || 0,
            tpCsd: parseFloat(row.CPU) || 0,
            tpCaptainsWorld: parseFloat(row.TP_Captains) || 0,
            tpCoopers: parseFloat(row.TP_Coopers) || 0,
            tpShumis: parseFloat(row.TP_Shumis) || 0,
            tpGenius: parseFloat(row.TP_Genius) || 0,
            tpOverseas: parseFloat(row.TP_Overseas) || 0,
            tpIferi: parseFloat(row.TP_Iferi) || 0,
            mrp: parseFloat(row.MRP) || 0,
            stock: parseInt(row.Stock) || 0,
            productType: type,
          };

          if (existingIndex >= 0) {
            updatedProducts[existingIndex] = { ...updatedProducts[existingIndex], ...productData };
          } else {
            updatedProducts.push({
              ...productData,
              id: `csv-${Date.now()}-${index}`,
            } as Product);
          }
        });
        
        setProducts(updatedProducts);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    });
  };

  return (
    <div className="space-y-6">
      <PasswordConfirmModal isOpen={!!pendingAction} onConfirm={() => { pendingAction?.(); setPendingAction(null); }} onCancel={() => setPendingAction(null)} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">{type} Inventory Management</h1>
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <>
              <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 shadow-sm">
                <Upload size={20} className="mr-2" />
                Import CSV
              </button>
              <button onClick={downloadSample} className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 shadow-sm">
                <Download size={20} className="mr-2" />
                Sample
              </button>
              <button onClick={() => setIsBulkDeleting(true)} className="flex items-center px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200">
                <Trash2 size={20} className="mr-2" />
                Delete All
              </button>
            </>
          )}
          <button onClick={() => {resetForm(); setIsAdding(true);}} className="flex items-center px-4 py-2 bg-[#36609b] text-white shadow-md shadow-[#36609b]/20 hover:-translate-y-0.5 transition-all rounded-xl hover:bg-[#36609b]">
            <Plus size={20} className="mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Modals for Custom Confirmation (No window.confirm/prompt) */}
      {productToDelete && (
        <div className="fixed inset-0 bg-[#a5bd55] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Product</h3>
            <p className="text-slate-600 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setProductToDelete(null)} className="px-4 py-2 text-slate-600 bg-gray-100 hover:bg-gray-200 rounded-xl">Cancel</button>
              <button onClick={confirmDeleteProduct} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}

      {isBulkDeleting && (
        <div className="fixed inset-0 bg-[#a5bd55] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg">
            <h3 className="text-lg font-bold text-red-600 mb-2">Delete ALL Products</h3>
            <p className="text-slate-600 mb-4">Are you absolutely sure? This will delete all products permanently. Enter your password to confirm.</p>
            <input 
              type="password" 
              placeholder="Admin Password"
              value={bulkDeletePassword}
              onChange={e => setBulkDeletePassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none"
            />
            {bulkDeleteError && <p className="text-red-500 text-sm mb-4">{bulkDeleteError}</p>}
            <div className="flex justify-end space-x-3 mt-4">
              <button onClick={() => {setIsBulkDeleting(false); setBulkDeleteError('');}} className="px-4 py-2 text-slate-600 bg-gray-100 hover:bg-gray-200 rounded-xl">Cancel</button>
              <button onClick={confirmBulkDelete} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl">Delete All</button>
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200/60">
          <h2 className="text-lg font-bold mb-4">{formData.id ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
              <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Barcode (Optional)</label>
              <input type="text" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input required type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
              <input required type="text" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CP (Cost Price)</label>
              <input required type="number" step="0.01" value={formData.cp || 0} onChange={e => setFormData({...formData, cp: parseFloat(e.target.value)})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CPU / TP(CSD)</label>
              <input required type="number" step="0.01" value={formData.cpu} onChange={e => setFormData({...formData, cpu: parseFloat(e.target.value)})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">MRP</label>
              <input required type="number" step="0.01" value={formData.mrp} onChange={e => setFormData({...formData, mrp: parseFloat(e.target.value)})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
              <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" />
            </div>
            
                        <div><label className="block text-xs font-medium text-slate-700 mb-1">TP (Captains World)</label><input required type="number" step="0.01" value={formData.tpCaptainsWorld} onChange={e => setFormData({...formData, tpCaptainsWorld: parseFloat(e.target.value)})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" /></div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1">TP (Coopers)</label><input required type="number" step="0.01" value={formData.tpCoopers} onChange={e => setFormData({...formData, tpCoopers: parseFloat(e.target.value)})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" /></div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1">TP (Shumis)</label><input required type="number" step="0.01" value={formData.tpShumis} onChange={e => setFormData({...formData, tpShumis: parseFloat(e.target.value)})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" /></div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1">TP (Genius)</label><input required type="number" step="0.01" value={formData.tpGenius} onChange={e => setFormData({...formData, tpGenius: parseFloat(e.target.value)})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" /></div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1">TP (Overseas)</label><input required type="number" step="0.01" value={formData.tpOverseas} onChange={e => setFormData({...formData, tpOverseas: parseFloat(e.target.value)})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" /></div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1">TP (Iferi)</label><input required type="number" step="0.01" value={formData.tpIferi} onChange={e => setFormData({...formData, tpIferi: parseFloat(e.target.value)})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" /></div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-600 bg-gray-100 rounded-xl hover:bg-gray-200">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-[#a5bd55] text-white shadow-md shadow-[#a5bd55]/20 hover:-translate-y-0.5 transition-all rounded-xl hover:bg-[#8da742]">Save Product</button>
            </div>
          </form>
        </div>
      )}


      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200/60 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">Inventory Turnover Velocity</h2>
            <p className="text-sm text-slate-500">Top 10 most moving products across all time</p>
          </div>
          <div className="h-64">
            {turnoverData.topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={turnoverData.topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 11}} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="Velocity" fill="#4097d0" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">Not enough data</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200/60 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">Total Units Moved Over Time</h2>
            <p className="text-sm text-slate-500">Historical stock outflow</p>
          </div>
          <div className="h-64">
             {turnoverData.movement.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={turnoverData.movement}>
                  <defs>
                    <linearGradient id="colorMoved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a5bd55" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#a5bd55" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="Moved" stroke="#a5bd55" fillOpacity={1} fill="url(#colorMoved)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">Not enough data</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
        <div>
          <p className="text-sm text-blue-600 font-semibold uppercase tracking-wider">Total Value of Inventory (Cost Price)</p>
          <p className="text-2xl font-bold text-slate-900">৳{currentTabInventoryValue.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200/60 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#36609b]"
            />
          </div>
          {isAdmin && selectedProductIds.size > 0 && (
            <button 
              onClick={confirmDeleteSelected}
              className="flex items-center px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
            >
              <Trash2 size={18} className="mr-2" />
              Delete Selected ({selectedProductIds.size})
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs tracking-wider uppercase">
                {isAdmin && <th className="p-4 align-middle border-b w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-[#36609b] focus:ring-[#36609b]"
                    checked={filteredProducts.length > 0 && selectedProductIds.size === filteredProducts.length}
                    onChange={handleSelectAll}
                  />
                </th>}
                <th className="p-4 align-middle border-b">Code</th>
                <th className="p-4 align-middle border-b">Barcode (CSD)</th>
                <th className="p-4 align-middle border-b">Description</th>
                <th className="p-4 align-middle border-b">Desc (CSD)</th>
                {isAdmin && <th className="p-4 align-middle border-b text-right">CP</th>}
                {isAdmin && <th className="p-4 align-middle border-b text-right">CPU</th>}
                                <th className="p-4 align-middle border-b text-right text-slate-400">TP (Captain)</th>
                <th className="p-4 align-middle border-b text-right text-slate-400">TP (Cooper)</th>
                <th className="p-4 align-middle border-b text-right text-slate-400">TP (Shumi)</th>
                <th className="p-4 align-middle border-b text-right text-slate-400">TP (Genius)</th>
                <th className="p-4 align-middle border-b text-right text-slate-400">TP (Overseas)</th>
                <th className="p-4 align-middle border-b text-right text-slate-400">TP (Iferi)</th>
                <th className="p-4 align-middle border-b text-right">MRP</th>
                <th className="p-4 align-middle border-b text-right">Stock</th>
                {isAdmin && <th className="p-4 align-middle border-b text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredProducts.map(p => (
                <tr key={p.id} className="border-b hover:bg-slate-50 transition-colors">
                  {isAdmin && <td className="p-4 align-middle">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-[#36609b] focus:ring-[#36609b]"
                      checked={selectedProductIds.has(p.id)}
                      onChange={() => handleSelectProduct(p.id)}
                    />
                  </td>}
                  <td className="p-4 align-middle font-medium">{p.code}</td>
                  <td className="p-4 align-middle text-slate-500">{p.barcode || '-'}</td>
                  <td className="p-4 align-middle">{p.description}</td>
                  <td className="p-4 align-middle text-slate-500">{p.descriptionCsd || "-"}</td>
                  {isAdmin && <td className="p-4 align-middle text-right">৳{p.cp || 0}</td>}
                  {isAdmin && <td className="p-4 align-middle text-right">৳{p.cpu}</td>}
                                    <td className="p-4 align-middle text-right text-slate-500">৳{p.tpCaptainsWorld}</td>
                  <td className="p-4 align-middle text-right text-slate-500">৳{p.tpCoopers}</td>
                  <td className="p-4 align-middle text-right text-slate-500">৳{p.tpShumis}</td>
                  <td className="p-4 align-middle text-right text-slate-500">৳{p.tpGenius}</td>
                  <td className="p-4 align-middle text-right text-slate-500">৳{p.tpOverseas}</td>
                  <td className="p-4 align-middle text-right text-slate-500">৳{p.tpIferi}</td>
                  <td className="p-4 align-middle text-right">৳{p.mrp}</td>
                  <td className="p-4 align-middle text-right">
                    <span className={`font-medium ${p.stock === 0 ? 'text-red-600' : p.stock <= 100 ? 'text-orange-500' : 'text-green-600'}`}>
                      {p.stock}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="p-4 align-middle">
                      <div className="flex justify-center space-x-2">
                        <button onClick={() => {setFormData(p); setIsAdding(true);}} className="text-[#36609b] hover:bg-blue-50 p-1 rounded"><Edit2 size={18} /></button>
                        <button onClick={() => setProductToDelete(p.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && <div className="p-8 text-center text-slate-500">No products found.</div>}
        </div>
      </div>
    </div>
  );
};
