import React, { useState } from 'react';
import { useStore } from '../store';
import { LayoutDashboard, Receipt, Package, Users, Wallet, BookOpen, Truck, Menu, X, LogOut, History, MapPin, RotateCcw, RefreshCw } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { currentUser, setCurrentUser } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'billing', label: 'Billing', icon: Receipt },
    { id: 'invoice-history', label: 'Invoice History', icon: History },
    { id: 'delivery-tracker', label: 'Delivery Tracker', icon: MapPin },
    { id: 'returns', label: 'Returns & Credits', icon: RotateCcw },
    { id: 'inventory-local', label: 'Local Inventory', icon: Package },
    { id: 'inventory-imported', label: 'Imported Inventory', icon: Package },
    { id: 'ledger', label: 'Ledger', icon: BookOpen },
    { id: 'shipments', label: 'Shipments', icon: Truck },
    { id: 'payroll', label: 'Payroll', icon: Wallet },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'users', label: 'Users', icon: Users },
  ];

  const navItems = allNavItems.filter(item => {
    if (currentUser?.role === 'Admin') return true;
    if (!currentUser?.accessibleFeatures) {
      return ['dashboard', 'billing', 'invoice-history', 'inventory-local', 'inventory-imported', 'ledger'].includes(item.id);
    }
    return currentUser.accessibleFeatures.includes(item.id);
  });

  return (
    <div className="h-[100dvh] overflow-hidden bg-[#f4f7fb] flex print:bg-white print:h-auto print:overflow-visible font-sans text-slate-800">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-all duration-300" onClick={() => setSidebarOpen(false)} />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-[#1e2a40] text-slate-300 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 print:hidden shadow-xl lg:shadow-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 bg-[#172133] shrink-0 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-md shadow-sm">
              <img src="/logo.png" alt="Logo" className="h-6 w-auto object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
            <span className="text-sm font-bold tracking-widest text-white">T&Z IMS</span>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div className="px-4 py-4 shrink-0">
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2 px-2">Main Menu</p>
        </div>

        <nav className="px-3 pb-6 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full group flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm relative ${isActive ? 'bg-[#36609b]/40 text-white' : 'hover:bg-white/5 hover:text-white'}`}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#a5bd55] rounded-r-full" />}
                <item.icon className={`mr-3 transition-colors ${isActive ? 'text-[#a5bd55]' : 'text-slate-400 group-hover:text-slate-200'}`} size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 shrink-0 border-t border-white/5 bg-[#172133]/50">
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#36609b] to-[#2a4d7d] flex items-center justify-center text-white font-bold shadow-inner ring-2 ring-white/10 shrink-0">
               {currentUser?.name?.charAt(0) || 'U'}
             </div>
             <div className="flex-1 min-w-0 text-left">
               <p className="text-sm font-medium text-white truncate">{currentUser?.name}</p>
               <p className="text-xs text-slate-400 truncate">{currentUser?.role}</p>
             </div>
             <button onClick={() => window.location.reload()} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors shrink-0" title="Refresh App">
               <RefreshCw size={16} />
             </button>
             <button onClick={() => setCurrentUser(null)} className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors shrink-0" title="Sign Out">
               <LogOut size={16} />
             </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible relative">
        <header className="bg-transparent h-2 sm:h-8 shrink-0 print:hidden"></header>
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-8 pt-0 print:p-0 print:overflow-visible pt-[env(safe-area-inset-top)] sm:pt-0">
          <div className="max-w-[1600px] mx-auto">
            <div className="print:hidden lg:hidden flex items-center justify-between mb-6 mt-4 sm:mt-0 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
               <button className="text-slate-500 hover:text-slate-900" onClick={() => setSidebarOpen(true)}>
                 <Menu size={20} />
               </button>
               <h1 className="text-lg font-semibold text-slate-800 capitalize">
                 {activeTab.replace('-', ' ')}
               </h1>
               <button className="text-slate-500 hover:text-slate-900" onClick={() => window.location.reload()} title="Refresh App">
                 <RefreshCw size={20} />
               </button>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
