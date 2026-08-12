import React, { useState } from 'react';
import { useStore } from '../store';
import { LayoutDashboard, Receipt, Package, Users, Wallet, BookOpen, Truck, Menu, X, LogOut, History } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { currentUser, setCurrentUser } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Define all available navigation items
  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'billing', label: 'Billing', icon: Receipt },
    { id: 'invoice-history', label: 'Invoice History', icon: History },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'ledger', label: 'Ledger', icon: BookOpen },
    { id: 'shipments', label: 'Shipments', icon: Truck },
    { id: 'payroll', label: 'Payroll', icon: Wallet },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'users', label: 'Users', icon: Users },
  ];

  // Filter based on user role and permissions
  const navItems = allNavItems.filter(item => {
    if (currentUser?.role === 'Admin') return true; // Admins see everything
    if (!currentUser?.accessibleFeatures) {
      // Fallback for older users without explicit permissions
      return ['dashboard', 'billing', 'invoice-history', 'inventory', 'ledger'].includes(item.id);
    }
    return currentUser.accessibleFeatures.includes(item.id);
  });

  return (
    <div className="min-h-screen bg-gray-50 flex print:bg-white">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden print:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#36609b] text-white transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 print:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 bg-[#2a4d7d]">
          <div className="flex items-center">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto mr-3 bg-white p-1 rounded object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
            <span className="text-sm font-bold tracking-wider truncate">T&Z DISTRIBUTION</span>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <nav className="mt-6 px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === item.id ? 'bg-[#4097d0] text-white' : 'text-gray-300 hover:bg-[#2a4d7d] hover:text-white'}`}
            >
              <item.icon className="mr-3" size={20} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 print:hidden">
          <button className="text-gray-500 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-[#a5bd55] text-white px-3 py-1 rounded-full text-sm font-medium">
              <div className="w-2 h-2 rounded-full bg-white mr-2" />
              {currentUser?.name} ({currentUser?.role})
            </div>
            <button 
              onClick={() => setCurrentUser(null)}
              className="p-2 text-gray-500 hover:text-red-600 transition-colors"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 print:p-0 print:overflow-visible">
          {children}
        </main>
      </div>
    </div>
  );
};
