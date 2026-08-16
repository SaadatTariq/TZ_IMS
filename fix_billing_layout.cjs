const fs = require('fs');
let code = fs.readFileSync('src/pages/Billing.tsx', 'utf-8');

// 1. Remove the floating payment method
code = code.replace(
  `      <div className="print:hidden flex justify-end">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-slate-700">Payment Method:</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as 'Cash Sale' | 'Credit Sale')} className="px-3 py-2 border rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#36609b]">
            <option value="Cash Sale">Cash Sale</option>
            <option value="Credit Sale">Credit Sale</option>
          </select>
        </div>
      </div>`,
  ''
);

// 2. Put Payment Method next to Select Client and CSD Branch, and improve their layout
const newCardHeader = `        <div className="mb-8 print:hidden grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Client</label>
            <select 
              value={selectedClientId} 
              onChange={(e) => handleClientSelect(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-sm transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none"
            >
              <option value="">Walk-in Customer</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Method</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as 'Cash Sale' | 'Credit Sale')} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-sm transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none">
              <option value="Cash Sale">Cash Sale</option>
              <option value="Credit Sale">Credit Sale</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">CSD Branch/Warehouse</label>
            <input 
              type="text" 
              value={csdBranch} 
              onChange={(e) => setCsdBranch(e.target.value)} 
              placeholder="e.g. Dhaka Cantt"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-sm transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none"
            />
          </div>
        </div>`;

// We have to replace the existing one which might look like:
code = code.replace(
  /<div className="mb-6 print:hidden flex items-end space-x-4">[\s\S]*?<\/div>[\s]*<\/div>[\s]*<div className="print:hidden space-y-4/g,
  (match) => {
     // Wait, the old code has "Add Product" inside the same flex row or is it separate?
     // Let's check how Add Product is laid out.
     return '';
  }
);
fs.writeFileSync('src/pages/Billing.tsx', code);
