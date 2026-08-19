/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StoreProvider, useStore } from './store';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Billing } from './pages/Billing';
import { InvoiceHistory } from './pages/InvoiceHistory';
import { Shipments } from './pages/Shipments';
import { Payroll } from './pages/Payroll';
import { Ledger } from './pages/Ledger';
import { Users } from './pages/Users';
import { Clients } from './pages/Clients';
import { Returns } from './pages/Returns';
import { DeliveryTracker } from './pages/DeliveryTracker';
import { Login } from './pages/Login';

function AppContent() {
  const { currentUser } = useStore();
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('erp-activeTab') || 'dashboard';
  });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    localStorage.setItem('erp-activeTab', tab);
  };

  if (!currentUser) {
    return <Login />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'inventory-local': return <Inventory type="Local" />;
      case 'inventory-imported': return <Inventory type="Imported" />;
      case 'billing': return <Billing />;
      case 'invoice-history': return <InvoiceHistory />;
      case 'shipments': return <Shipments />;
      case 'payroll': return <Payroll />;
      case 'ledger': return <Ledger />;
      case 'users': return <Users />;
      case 'clients': return <Clients />;
      case 'returns': return <Returns />;
      case 'delivery-tracker': return <DeliveryTracker />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={handleTabChange}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

