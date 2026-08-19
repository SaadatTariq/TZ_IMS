const fs = require('fs');
let fileContent = fs.readFileSync('src/pages/Inventory.tsx', 'utf-8');

// 1. Change component signature
fileContent = fileContent.replace(
  `export const Inventory: React.FC = () => {`,
  `export const Inventory: React.FC<{ type: 'Local' | 'Imported' }> = ({ type }) => {`
);

// 2. Remove activeTab
fileContent = fileContent.replace(
  `const [activeTab, setActiveTab] = useState<'Local' | 'Imported'>('Local');\n`,
  ``
);

// 3. Update Title & Tab filtering
fileContent = fileContent.replace(
  `  const filteredProducts = products.filter(p => \n    (p.productType === activeTab || (!p.productType && activeTab === 'Local')) &&\n    (p.description.toLowerCase().includes(searchTerm.toLowerCase()) || \n    p.code.toLowerCase().includes(searchTerm.toLowerCase()))\n  );\n  \n  const currentTabInventoryValue = products\n    .filter(p => p.productType === activeTab || (!p.productType && activeTab === 'Local'))\n    .reduce((sum, p) => sum + (p.stock * p.cpu), 0);`,
  `  const filteredProducts = products.filter(p => {
    const isCorrectType = p.productType === type || (!p.productType && type === 'Local');
    if (!isCorrectType) return false;
    
    const s = searchTerm.toLowerCase().replace(/[\\s-]/g, '');
    const code = p.code.toLowerCase().replace(/[\\s-]/g, '');
    const desc = p.description.toLowerCase().replace(/[\\s-]/g, '');
    
    return code.includes(s) || desc.includes(s) || p.description.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  const currentTabInventoryValue = products
    .filter(p => p.productType === type || (!p.productType && type === 'Local'))
    .reduce((sum, p) => sum + (p.stock * (p.cp || 0)), 0);`
);

// 4. Update Form Data default to include cp
fileContent = fileContent.replace(
  `mrp: 0, stock: 0, productType: 'Local'`,
  `mrp: 0, stock: 0, productType: type, cp: 0`
);
fileContent = fileContent.replace(
  `mrp: 0, stock: 0, productType: 'Local'`,
  `mrp: 0, stock: 0, productType: type, cp: 0`
);

// 5. Update delete and add actions for Admin
fileContent = fileContent.replace(
  `  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPendingAction(() => () => {
      if (formData.id) {
        setProducts(products.map(p => p.id === formData.id ? { ...p, ...formData } as Product : p));
      } else {
        const existingProduct = products.find(p => p.code.toLowerCase() === formData.code?.toLowerCase());
        if (existingProduct) {
          setProducts(products.map(p => p.id === existingProduct.id ? { ...p, ...formData, id: p.id } as Product : p));
        } else {
          const newProduct: Product = { ...formData, id: Date.now().toString() } as Product;
          setProducts([...products, newProduct]);
        }
      }
      setIsAdding(false);
      resetForm();
    });
  };`,
  `  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const action = () => {
      let finalFormData = { ...formData };
      if (type === 'Local' && !finalFormData.productType) finalFormData.productType = 'Local';
      
      if (formData.id) {
        setProducts(products.map(p => p.id === formData.id ? { ...p, ...finalFormData } as Product : p));
      } else {
        const existingProduct = products.find(p => p.code.toLowerCase() === formData.code?.toLowerCase());
        if (existingProduct) {
          setProducts(products.map(p => p.id === existingProduct.id ? { ...p, ...finalFormData, id: p.id } as Product : p));
        } else {
          const newProduct: Product = { ...finalFormData, id: Date.now().toString() } as Product;
          setProducts([...products, newProduct]);
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
  };`
);

fileContent = fileContent.replace(
  `  const confirmDeleteProduct = () => {
    if (productToDelete) {
      setPendingAction(() => () => {
        setProducts(products.filter(p => p.id !== productToDelete));
        setProductToDelete(null);
      });
    }
  };`,
  `  const confirmDeleteProduct = () => {
    if (productToDelete) {
      const action = () => {
        setProducts(products.filter(p => p.id !== productToDelete));
        setProductToDelete(null);
      };
      if (isAdmin) {
        action();
      } else {
        setPendingAction(() => action);
      }
    }
  };`
);

fileContent = fileContent.replace(
  `  const confirmDeleteSelected = () => {
    if (selectedProductIds.size === 0) return;
    setPendingAction(() => () => {
      setProducts(products.filter(p => !selectedProductIds.has(p.id)));
      setSelectedProductIds(new Set());
    });
  };`,
  `  const confirmDeleteSelected = () => {
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
  };`
);

// 6. CSV Parsing and Sample
fileContent = fileContent.replace(
  `Code: 'TZ-1001', Barcode: '1234567', Description: 'Sample Item', Description_CSD: 'Sample Item CSD', Unit: 'Pcs', CPU: 100, TP_CSD: 110, TP_Captains: 115, TP_Coopers: 120, TP_Shumis: 125, TP_Genius: 130, TP_Overseas: 135, TP_Iferi: 140, MRP: 200, Stock: 50, ProductType: 'Local'`,
  `Code: 'TZ-1001', Barcode: '1234567', Description: 'Sample Item', Description_CSD: 'Sample Item CSD', Unit: 'Pcs', CP: 95, CPU: 110, TP_CSD: 110, TP_Captains: 115, TP_Coopers: 120, TP_Shumis: 125, TP_Genius: 130, TP_Overseas: 135, TP_Iferi: 140, MRP: 200, Stock: 50`
);

fileContent = fileContent.replace(
  `cpu: parseFloat(row.CPU) || 0,`,
  `cp: parseFloat(row.CP) || parseFloat(row.CPU) || 0,
            cpu: parseFloat(row.CPU) || 0,`
);
fileContent = fileContent.replace(
  `productType: row.ProductType === 'Imported' ? 'Imported' : 'Local',`,
  `productType: type,`
);

// 7. Update headers and remove activeTab UI
fileContent = fileContent.replace(
  `      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>`,
  `      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">{type} Inventory Management</h1>`
);

// Remove the inline tabs UI block entirely and replace it with just the Total Value box
fileContent = fileContent.replace(
  /      <div className="flex border-b border-slate-200">[\s\S]*?      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">/,
  `      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">`
);

// Form updates
fileContent = fileContent.replace(
  `<div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select value={formData.productType || 'Local'} onChange={e => setFormData({...formData, productType: e.target.value as 'Local' | 'Imported'})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none">
                <option value="Local">Local</option>
                <option value="Imported">Imported</option>
              </select>
            </div>`,
  ``
);

fileContent = fileContent.replace(
  `<div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CPU</label>`,
  `<div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CP (Cost Price)</label>
              <input required type="number" step="0.01" value={formData.cp || 0} onChange={e => setFormData({...formData, cp: parseFloat(e.target.value)})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CPU / TP(CSD)</label>`
);

fileContent = fileContent.replace(
  `{isAdmin && <th className="p-4 align-middle border-b text-right">CPU</th>}`,
  `{isAdmin && <th className="p-4 align-middle border-b text-right">CP</th>}
                {isAdmin && <th className="p-4 align-middle border-b text-right">CPU</th>}`
);

fileContent = fileContent.replace(
  `{isAdmin && <td className="p-4 align-middle text-right">৳{p.cpu}</td>}`,
  `{isAdmin && <td className="p-4 align-middle text-right">৳{p.cp || 0}</td>}
                  {isAdmin && <td className="p-4 align-middle text-right">৳{p.cpu}</td>}`
);


fs.writeFileSync('src/pages/Inventory.tsx', fileContent);
