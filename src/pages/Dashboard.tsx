import React, { useMemo } from 'react';
import { useStore } from '../store';
import { Package, Receipt, Wallet, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const Dashboard: React.FC = () => {
  const { products, invoices, setInvoices, setProducts, currentUser } = useStore();

  const isAdmin = currentUser?.role === 'Admin';
  const totalProducts = products.length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 100).length;
  
  const totalRevenue = invoices
    .filter(i => i.status === 'Paid' || i.status === 'Approved')
    .reduce((sum, inv) => sum + inv.total, 0);

  const pendingInvoices = invoices.filter(i => i.status === 'Pending Approval');

  const stats = [
    { title: 'Total Revenue', value: `৳ ${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-[#4097d0]', bg: 'bg-blue-100' },
    { title: 'Total Products', value: totalProducts, icon: Package, color: 'text-[#a5bd55]', bg: 'bg-green-100' },
    { title: 'Low Stock (< 100)', value: lowStock, icon: Receipt, color: 'text-orange-600', bg: 'bg-orange-100' },
    { title: 'Out of Stock', value: outOfStock, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  const monthlySalesData = React.useMemo(() => {
    const months = {};
    invoices
      .filter(i => i.status === 'Paid' || i.status === 'Approved')
      .forEach(inv => {
        const date = new Date(inv.date);
        const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        months[monthYear] = (months[monthYear] || 0) + inv.total;
      });

    return Object.entries(months)
      .map(([key, value]) => ({
        name: key,
        Sales: value,
        timestamp: new Date(key).getTime()
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [invoices]);

  const demandData = useMemo(() => {
    const counts: Record<string, number> = {};
    invoices.forEach(inv => {
      inv.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        if (prod) {
          counts[prod.description] = (counts[prod.description] || 0) + item.quantity;
        }
      });
    });
    
    return Object.keys(counts).map(key => ({
      name: key,
      Demand: counts[key]
    })).sort((a, b) => b.Demand - a.Demand).slice(0, 5);
  }, [invoices, products]);

  const approveInvoice = (id: string) => {
    if (!isAdmin) return;
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;
    
    // Check stock
    let canApprove = true;
    for (const item of inv.items) {
      const p = products.find(prod => prod.id === item.productId);
      if (p && p.stock < item.quantity) {
        canApprove = false;
        alert(`Cannot approve. Insufficient stock for ${p.description}. Needs ${item.quantity}, has ${p.stock}.`);
        break;
      }
    }

    if (!canApprove) return;

    // Deduct stock
    const updatedProducts = products.map(p => {
      const invoicedItem = inv.items.find(i => i.productId === p.id);
      if (invoicedItem) {
        return { ...p, stock: p.stock - invoicedItem.quantity };
      }
      return p;
    });
    setProducts(updatedProducts);

    // Update invoice status
    setInvoices(invoices.map(i => i.id === id ? { ...i, status: 'Approved' } : i));
  };

  const nameParts = currentUser?.name?.trim().split(/\s+/) || [];
  const greetingName = nameParts.length > 2 ? nameParts[1] : (nameParts.length === 2 ? nameParts[1] : nameParts[0]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#2a4d7d] to-[#4097d0] rounded-xl p-8 text-white shadow-md">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {greetingName}!</h1>
        <p className="text-blue-100">Here's what's happening with your inventory and sales today.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isAdmin && pendingInvoices.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-6 bg-yellow-50">
          <h2 className="text-lg font-bold text-yellow-800 mb-4 flex items-center">
            <AlertTriangle className="mr-2" size={20} /> Invoices Pending Approval
          </h2>
          <div className="space-y-4">
            {pendingInvoices.map(inv => (
              <div key={inv.id} className="flex justify-between items-center p-4 border border-yellow-200 rounded-lg bg-white">
                <div>
                  <p className="font-semibold text-gray-900">Client: {inv.title || inv.clientId}</p>
                  <p className="text-sm text-gray-500">
                    Created by {inv.createdBy || 'Unknown'} on {new Date(inv.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{inv.items.length} items</p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <p className="font-bold text-gray-900">৳ {inv.total.toLocaleString()}</p>
                  <button 
                    onClick={() => approveInvoice(inv.id)}
                    className="flex items-center px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                  >
                    <CheckCircle size={14} className="mr-1" /> Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Monthly Sales Trends</h2>
          <div className="h-64">
            {monthlySalesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlySalesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <YAxis />
                  <Tooltip formatter={(value) => ['৳ ' + value.toLocaleString(), 'Sales']} />
                  <Line type="monotone" dataKey="Sales" stroke="#a5bd55" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No sales data available
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Product Demand (Top 5)</h2>
          <div className="h-64">
            {demandData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demandData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="Demand" fill="#4097d0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No data available for charts
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Stock Alerts</h2>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {products.filter(p => p.stock <= 100).sort((a, b) => a.stock - b.stock).map(p => (
              <div key={p.id} className={`flex justify-between items-center p-4 border rounded-lg ${p.stock === 0 ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'}`}>
                <div>
                  <p className="font-semibold text-gray-900">{p.description}</p>
                  <p className="text-sm text-gray-500">Code: {p.code}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${p.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>{p.stock} {p.unit}</p>
                  <p className={`text-xs font-medium ${p.stock === 0 ? 'text-red-500' : 'text-orange-500'}`}>
                    {p.stock === 0 ? 'Out of Stock!' : 'Reorder needed'}
                  </p>
                </div>
              </div>
            ))}
            {(outOfStock + lowStock) === 0 && <p className="text-gray-500 text-center py-4">All stock levels are healthy.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
