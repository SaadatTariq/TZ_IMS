const fs = require('fs');

let fileContent = fs.readFileSync('src/components/Layout.tsx', 'utf-8');

fileContent = fileContent.replace(
  `import { LayoutDashboard, Receipt, Package, Users, Wallet, BookOpen, Truck, Menu, X, LogOut, History, MapPin, RotateCcw } from 'lucide-react';`,
  `import { LayoutDashboard, Receipt, Package, Users, Wallet, BookOpen, Truck, Menu, X, LogOut, History, MapPin, RotateCcw, RefreshCw } from 'lucide-react';`
);

fileContent = fileContent.replace(
  `<button onClick={() => setCurrentUser(null)} className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors shrink-0" title="Sign Out">
               <LogOut size={16} />
             </button>`,
  `<button onClick={() => window.location.reload()} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors shrink-0" title="Refresh App">
               <RefreshCw size={16} />
             </button>
             <button onClick={() => setCurrentUser(null)} className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors shrink-0" title="Sign Out">
               <LogOut size={16} />
             </button>`
);

fileContent = fileContent.replace(
  `<div className="w-5"></div>`,
  `<button className="text-slate-500 hover:text-slate-900" onClick={() => window.location.reload()} title="Refresh App">
                 <RefreshCw size={20} />
               </button>`
);

fs.writeFileSync('src/components/Layout.tsx', fileContent);
