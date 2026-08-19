import React, { useState } from 'react';
import { useStore } from '../store';
import { Activity, Database, Users, Shield, Clock, FileText, Wifi, WifiOff, HardDrive, Download } from 'lucide-react';
import Papa from 'papaparse';

export const SystemMonitor: React.FC = () => {
  const { auditLogs, products, invoices, users, dbStatus, currentUser } = useStore();
  const [filterUser, setFilterUser] = useState('');
  const [filterModule, setFilterModule] = useState('');

  if (currentUser?.role !== 'Admin') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Shield size={64} className="text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">Access Denied</h2>
        <p className="text-slate-500">Only administrators can access the System Monitor.</p>
      </div>
    );
  }

  const filteredLogs = auditLogs.filter(log => {
    const matchesUser = filterUser ? log.userName.toLowerCase().includes(filterUser.toLowerCase()) : true;
    const matchesModule = filterModule ? log.module === filterModule : true;
    return matchesUser && matchesModule;
  });

  const exportLogs = () => {
    const csv = Papa.unparse(filteredLogs);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `system_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-700';
      case 'UPDATE': return 'bg-blue-100 text-blue-700';
      case 'DELETE': return 'bg-red-100 text-red-700';
      case 'LOGIN': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <Activity className="mr-2 text-[#36609b]" /> System Monitor
          </h1>
          <p className="text-slate-500">Live system health and security audit logs.</p>
        </div>
        <button 
          onClick={exportLogs}
          className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 shadow-sm"
        >
          <Download size={20} className="mr-2" />
          Export Logs
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200/60">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700 flex items-center"><Database className="mr-2" size={18}/> Database Status</h3>
            {dbStatus === 'Online' ? (
              <span className="flex items-center text-green-600 text-sm font-medium"><Wifi size={16} className="mr-1" /> Online</span>
            ) : (
              <span className="flex items-center text-red-600 text-sm font-medium"><WifiOff size={16} className="mr-1" /> Offline</span>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-500 flex justify-between"><span>Connection:</span> <span className="font-medium text-slate-900">{dbStatus}</span></p>
            <p className="text-sm text-slate-500 flex justify-between"><span>Provider:</span> <span className="font-medium text-slate-900">Firebase Firestore</span></p>
            <p className="text-sm text-slate-500 flex justify-between"><span>Sync State:</span> <span className="font-medium text-slate-900">Real-time Watcher Active</span></p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200/60">
          <div className="flex items-center mb-4">
            <h3 className="font-semibold text-slate-700 flex items-center"><HardDrive className="mr-2" size={18}/> Data Volume</h3>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-500 flex justify-between"><span>Products:</span> <span className="font-medium text-slate-900">{products.length} records</span></p>
            <p className="text-sm text-slate-500 flex justify-between"><span>Invoices:</span> <span className="font-medium text-slate-900">{invoices.length} records</span></p>
            <p className="text-sm text-slate-500 flex justify-between"><span>Users:</span> <span className="font-medium text-slate-900">{users.length} accounts</span></p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200/60">
          <div className="flex items-center mb-4">
            <h3 className="font-semibold text-slate-700 flex items-center"><Shield className="mr-2" size={18}/> Security Activity</h3>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-500 flex justify-between"><span>Total Logs:</span> <span className="font-medium text-slate-900">{auditLogs.length} events</span></p>
            <p className="text-sm text-slate-500 flex justify-between"><span>Last Event:</span> <span className="font-medium text-slate-900">{auditLogs[0] ? new Date(auditLogs[0].timestamp).toLocaleTimeString() : 'N/A'}</span></p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200/60 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Search by User Name..." 
            value={filterUser}
            onChange={e => setFilterUser(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#36609b] text-sm"
          />
          <select 
            value={filterModule} 
            onChange={e => setFilterModule(e.target.value)}
            className="px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#36609b] text-sm bg-white"
          >
            <option value="">All Modules</option>
            <option value="Auth">Auth</option>
            <option value="Inventory">Inventory</option>
            <option value="Billing">Billing</option>
            <option value="System">System</option>
          </select>
        </div>
        
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-slate-50 shadow-sm z-10">
              <tr className="text-slate-600 text-xs tracking-wider uppercase">
                <th className="p-4 font-semibold">Timestamp</th>
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Action</th>
                <th className="p-4 font-semibold">Module</th>
                <th className="p-4 font-semibold w-full">Description</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-500 flex items-center">
                    <Clock size={14} className="mr-2" />
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4 font-medium text-slate-900">
                    {log.userName} <span className="text-xs text-slate-400 font-normal ml-1">({log.userRole})</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-slate-700">{log.module}</td>
                  <td className="p-4 text-slate-600 whitespace-normal min-w-[300px]">{log.description}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No activity logs found matching the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
