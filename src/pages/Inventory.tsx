import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { Product } from '../types';
import { Plus, Search, Edit2, Trash2, Upload, Download } from 'lucide-react';
import Papa from 'papaparse';

export const Inventory: React.FC = () => {
  const { products, setProducts, currentUser } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
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
    mrp: 0, stock: 0
  });

  const filteredProducts = products.filter(p => 
    p.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      setProducts(products.map(p => p.id === formData.id ? { ...p, ...formData } as Product : p));
    } else {
      const newProduct: Product = { ...formData, id: Date.now().toString() } as Product;
      setProducts([...products, newProduct]);
    }
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      code: '', barcode: '', description: '', unit: 'Box', cpu: 0, 
      tpCsd: 0, tpCaptainsWorld: 0, tpCoopers: 0, tpShumis: 0, tpGenius: 0, tpOverseas: 0, tpIferi: 0,
      mrp: 0, stock: 0
    });
  };

  const confirmDeleteProduct = () => {
    if (productToDelete) {
      setProducts(products.filter(p => p.id !== productToDelete));
      setProductToDelete(null);
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
      { Code: 'TZ-1001', Barcode: '1234567', Description: 'Sample Item', Description_CSD: 'Sample Item CSD', Unit: 'Pcs', CPU: 100, TP_CSD: 110, TP_Captains: 115, TP_Coopers: 120, TP_Shumis: 125, TP_Genius: 130, TP_Overseas: 135, TP_Iferi: 140, MRP: 200, Stock: 50 }
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
        const newProducts: Product[] = results.data.map((row: any, index) => ({
          id: `csv-${Date.now()}-${index}`,
          code: row.Code || `CSV-${index}`,
          barcode: row.Barcode || '',
          description: row.Description || 'Unknown',
          descriptionCsd: row.Description_CSD || '',
          unit: row.Unit || 'Box',
          cpu: parseFloat(row.CPU) || 0,
          tpCsd: parseFloat(row.TP_CSD) || 0,
          tpCaptainsWorld: parseFloat(row.TP_Captains) || 0,
          tpCoopers: parseFloat(row.TP_Coopers) || 0,
          tpShumis: parseFloat(row.TP_Shumis) || 0,
          tpGenius: parseFloat(row.TP_Genius) || 0,
          tpOverseas: parseFloat(row.TP_Overseas) || 0,
          tpIferi: parseFloat(row.TP_Iferi) || 0,
          mrp: parseFloat(row.MRP) || 0,
          stock: parseInt(row.Stock) || 0,
        }));
        
        setProducts([...products, ...newProducts]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <>
              <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                <Upload size={20} className="mr-2" />
                Import CSV
              </button>
              <button onClick={downloadSample} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                <Download size={20} className="mr-2" />
                Sample
              </button>
              <button onClick={() => setIsBulkDeleting(true)} className="flex items-center px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                <Trash2 size={20} className="mr-2" />
                Delete All
              </button>
            </>
          )}
          <button onClick={() => {resetForm(); setIsAdding(true);}} className="flex items-center px-4 py-2 bg-[#4097d0] text-white rounded-lg hover:bg-blue-600">
            <Plus size={20} className="mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Modals for Custom Confirmation (No window.confirm/prompt) */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Product</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setProductToDelete(null)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
              <button onClick={confirmDeleteProduct} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}

      {isBulkDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg">
            <h3 className="text-lg font-bold text-red-600 mb-2">Delete ALL Products</h3>
            <p className="text-gray-600 mb-4">Are you absolutely sure? This will delete all products permanently. Enter your password to confirm.</p>
            <input 
              type="password" 
              placeholder="Admin Password"
              value={bulkDeletePassword}
              onChange={e => setBulkDeletePassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {bulkDeleteError && <p className="text-red-500 text-sm mb-4">{bulkDeleteError}</p>}
            <div className="flex justify-end space-x-3 mt-4">
              <button onClick={() => {setIsBulkDeleting(false); setBulkDeleteError('');}} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
              <button onClick={confirmBulkDelete} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg">Delete All</button>
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">{formData.id ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Barcode (Optional)</label>
              <input type="text" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input required type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input required type="text" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPU</label>
              <input required type="number" step="0.01" value={formData.cpu} onChange={e => setFormData({...formData, cpu: parseFloat(e.target.value)})} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MRP</label>
              <input required type="number" step="0.01" value={formData.mrp} onChange={e => setFormData({...formData, mrp: parseFloat(e.target.value)})} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-md" />
            </div>
            
            <div><label className="block text-xs font-medium text-gray-700 mb-1">TP (CSD)</label><input required type="number" step="0.01" value={formData.tpCsd} onChange={e => setFormData({...formData, tpCsd: parseFloat(e.target.value)})} className="w-full px-3 py-2 border rounded-md" /></div>
            <div><label className="block text-xs font-medium text-gray-700 mb-1">TP (Captains World)</label><input required type="number" step="0.01" value={formData.tpCaptainsWorld} onChange={e => setFormData({...formData, tpCaptainsWorld: parseFloat(e.target.value)})} className="w-full px-3 py-2 border rounded-md" /></div>
            <div><label className="block text-xs font-medium text-gray-700 mb-1">TP (Coopers)</label><input required type="number" step="0.01" value={formData.tpCoopers} onChange={e => setFormData({...formData, tpCoopers: parseFloat(e.target.value)})} className="w-full px-3 py-2 border rounded-md" /></div>
            <div><label className="block text-xs font-medium text-gray-700 mb-1">TP (Shumis)</label><input required type="number" step="0.01" value={formData.tpShumis} onChange={e => setFormData({...formData, tpShumis: parseFloat(e.target.value)})} className="w-full px-3 py-2 border rounded-md" /></div>
            <div><label className="block text-xs font-medium text-gray-700 mb-1">TP (Genius)</label><input required type="number" step="0.01" value={formData.tpGenius} onChange={e => setFormData({...formData, tpGenius: parseFloat(e.target.value)})} className="w-full px-3 py-2 border rounded-md" /></div>
            <div><label className="block text-xs font-medium text-gray-700 mb-1">TP (Overseas)</label><input required type="number" step="0.01" value={formData.tpOverseas} onChange={e => setFormData({...formData, tpOverseas: parseFloat(e.target.value)})} className="w-full px-3 py-2 border rounded-md" /></div>
            <div><label className="block text-xs font-medium text-gray-700 mb-1">TP (Iferi)</label><input required type="number" step="0.01" value={formData.tpIferi} onChange={e => setFormData({...formData, tpIferi: parseFloat(e.target.value)})} className="w-full px-3 py-2 border rounded-md" /></div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-[#a5bd55] text-white rounded-lg hover:bg-[#8da742]">Save Product</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search products..." 
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
                <th className="p-4 border-b">Code</th>
                <th className="p-4 border-b">Barcode (CSD)</th>
                <th className="p-4 border-b">Description</th>
                <th className="p-4 border-b">Desc (CSD)</th>
                {isAdmin && <th className="p-4 border-b text-right">CPU</th>}
                <th className="p-4 border-b text-right text-gray-400">TP (CSD)</th>
                <th className="p-4 border-b text-right text-gray-400">TP (Captain)</th>
                <th className="p-4 border-b text-right text-gray-400">TP (Cooper)</th>
                <th className="p-4 border-b text-right text-gray-400">TP (Shumi)</th>
                <th className="p-4 border-b text-right text-gray-400">TP (Genius)</th>
                <th className="p-4 border-b text-right text-gray-400">TP (Overseas)</th>
                <th className="p-4 border-b text-right text-gray-400">TP (Iferi)</th>
                <th className="p-4 border-b text-right">MRP</th>
                <th className="p-4 border-b text-right">Stock</th>
                {isAdmin && <th className="p-4 border-b text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredProducts.map(p => (
                <tr key={p.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium">{p.code}</td>
                  <td className="p-4 text-gray-500">{p.barcode || '-'}</td>
                  <td className="p-4">{p.description}</td>
                  <td className="p-4 text-gray-500">{p.descriptionCsd || "-"}</td>
                  {isAdmin && <td className="p-4 text-right">৳{p.cpu}</td>}
                  <td className="p-4 text-right text-gray-500">৳{p.tpCsd}</td>
                  <td className="p-4 text-right text-gray-500">৳{p.tpCaptainsWorld}</td>
                  <td className="p-4 text-right text-gray-500">৳{p.tpCoopers}</td>
                  <td className="p-4 text-right text-gray-500">৳{p.tpShumis}</td>
                  <td className="p-4 text-right text-gray-500">৳{p.tpGenius}</td>
                  <td className="p-4 text-right text-gray-500">৳{p.tpOverseas}</td>
                  <td className="p-4 text-right text-gray-500">৳{p.tpIferi}</td>
                  <td className="p-4 text-right">৳{p.mrp}</td>
                  <td className="p-4 text-right">
                    <span className={`font-medium ${p.stock === 0 ? 'text-red-600' : p.stock <= 100 ? 'text-orange-500' : 'text-green-600'}`}>
                      {p.stock}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="p-4">
                      <div className="flex justify-center space-x-2">
                        <button onClick={() => {setFormData(p); setIsAdding(true);}} className="text-[#4097d0] hover:bg-blue-50 p-1 rounded"><Edit2 size={18} /></button>
                        <button onClick={() => setProductToDelete(p.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && <div className="p-8 text-center text-gray-500">No products found.</div>}
        </div>
      </div>
    </div>
  );
};
