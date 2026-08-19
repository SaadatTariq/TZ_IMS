const fs = require('fs');

let fileContent = fs.readFileSync('src/pages/Inventory.tsx', 'utf-8');

// 1. Sync tpCsd with cpu on submit
fileContent = fileContent.replace(
  `let finalFormData = { ...formData };`,
  `let finalFormData = { ...formData };
      finalFormData.tpCsd = finalFormData.cpu;`
);

// 2. Remove TP (CSD) input field from the form
fileContent = fileContent.replace(
  `<div><label className="block text-xs font-medium text-slate-700 mb-1">TP (CSD)</label><input required type="number" step="0.01" value={formData.tpCsd} onChange={e => setFormData({...formData, tpCsd: parseFloat(e.target.value)})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none" /></div>\n`,
  ``
);

// 3. Remove TP (CSD) column from headers
fileContent = fileContent.replace(
  `<th className="p-4 align-middle border-b text-right text-slate-400">TP (CSD)</th>\n`,
  ``
);

// 4. Remove TP (CSD) column from table body
fileContent = fileContent.replace(
  `<td className="p-4 align-middle text-right text-slate-500">৳{p.tpCsd}</td>\n`,
  ``
);

fs.writeFileSync('src/pages/Inventory.tsx', fileContent);
