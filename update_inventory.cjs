const fs = require('fs');

let fileContent = fs.readFileSync('src/pages/Inventory.tsx', 'utf-8');

// 1. Add new states
fileContent = fileContent.replace(
  `const [searchTerm, setSearchTerm] = useState('');`,
  `const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'Local' | 'Imported'>('Local');
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());`
);

fileContent = fileContent.replace(
  `mrp: 0, stock: 0`,
  `mrp: 0, stock: 0, productType: 'Local'`
);

// 2. Filter products by tab
fileContent = fileContent.replace(
  `const filteredProducts = products.filter(p => \n    p.description.toLowerCase().includes(searchTerm.toLowerCase()) || \n    p.code.toLowerCase().includes(searchTerm.toLowerCase())\n  );`,
  `const filteredProducts = products.filter(p => 
    (p.productType === activeTab || (!p.productType && activeTab === 'Local')) &&
    (p.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const currentTabInventoryValue = products
    .filter(p => p.productType === activeTab || (!p.productType && activeTab === 'Local'))
    .reduce((sum, p) => sum + (p.stock * p.cpu), 0);
  
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
    setPendingAction(() => () => {
      setProducts(products.filter(p => !selectedProductIds.has(p.id)));
      setSelectedProductIds(new Set());
    });
  };`
);

// Reset form
fileContent = fileContent.replace(
  `mrp: 0, stock: 0
    });`,
  `mrp: 0, stock: 0, productType: 'Local'
    });`
);

// Papa parse sample
fileContent = fileContent.replace(
  `Stock: 50 }`,
  `Stock: 50, ProductType: 'Local' }`
);

// Papa parse row map
fileContent = fileContent.replace(
  `stock: parseInt(row.Stock) || 0,`,
  `stock: parseInt(row.Stock) || 0,
            productType: row.ProductType === 'Imported' ? 'Imported' : 'Local',`
);

// Add Tab UI & Delete Selected Button
fileContent = fileContent.replace(
  `      <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200/60 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center bg-slate-50">
          <div className="relative flex-1 max-w-md">`,
  `      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => { setActiveTab('Local'); setSelectedProductIds(new Set()); }}
          className={\`px-6 py-3 font-medium text-sm transition-colors \${activeTab === 'Local' ? 'border-b-2 border-[#36609b] text-[#36609b]' : 'text-slate-500 hover:text-slate-700'}\`}
        >
          Local Products Inventory
        </button>
        <button 
          onClick={() => { setActiveTab('Imported'); setSelectedProductIds(new Set()); }}
          className={\`px-6 py-3 font-medium text-sm transition-colors \${activeTab === 'Imported' ? 'border-b-2 border-[#36609b] text-[#36609b]' : 'text-slate-500 hover:text-slate-700'}\`}
        >
          Imported Products Inventory
        </button>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
        <div>
          <p className="text-sm text-blue-600 font-semibold uppercase tracking-wider">Total Value of Inventory (Cost Price)</p>
          <p className="text-2xl font-bold text-slate-900">৳{currentTabInventoryValue.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200/60 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 gap-4">
          <div className="relative flex-1 max-w-md">`
);

// Add delete selected button next to search
fileContent = fileContent.replace(
  `              className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#36609b]"
            />
          </div>
        </div>`,
  `              className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#36609b]"
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
        </div>`
);

// Table header Checkbox
fileContent = fileContent.replace(
  `<th className="p-4 align-middle border-b">Code</th>`,
  `{isAdmin && <th className="p-4 align-middle border-b w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-[#36609b] focus:ring-[#36609b]"
                    checked={filteredProducts.length > 0 && selectedProductIds.size === filteredProducts.length}
                    onChange={handleSelectAll}
                  />
                </th>}
                <th className="p-4 align-middle border-b">Code</th>`
);

// Table row checkbox
fileContent = fileContent.replace(
  `<td className="p-4 align-middle font-medium">{p.code}</td>`,
  `{isAdmin && <td className="p-4 align-middle">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-[#36609b] focus:ring-[#36609b]"
                      checked={selectedProductIds.has(p.id)}
                      onChange={() => handleSelectProduct(p.id)}
                    />
                  </td>}
                  <td className="p-4 align-middle font-medium">{p.code}</td>`
);

// Form dropdown for Type
fileContent = fileContent.replace(
  `<div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>`,
  `<div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select value={formData.productType || 'Local'} onChange={e => setFormData({...formData, productType: e.target.value as 'Local' | 'Imported'})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none">
                <option value="Local">Local</option>
                <option value="Imported">Imported</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>`
);

fs.writeFileSync('src/pages/Inventory.tsx', fileContent);

