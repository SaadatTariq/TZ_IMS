import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Cloud, Check, AlertCircle, RefreshCw } from 'lucide-react';
import config from '../../firebase-applet-config.json';

export const DriveBackup: React.FC = () => {
  const store = useStore();
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'backing_up' | 'success' | 'error'>('idle');
  const [lastBackup, setLastBackup] = useState<number>(() => parseInt(localStorage.getItem('erp_last_backup') || '0', 10));

  const clientId = import.meta.env.VITE_OAUTH_CLIENT_ID || config.oAuthClientId;
  
  useEffect(() => {
    // Initialize Google Identity Services
    if (window.google?.accounts?.oauth2) {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: (response: any) => {
          if (response.error !== undefined) {
            console.error('OAuth error:', response);
            setStatus('error');
            return;
          }
          performBackup(response.access_token);
        },
      });
      setTokenClient(client);
    }
  }, [clientId]);

  // Check if automated backup is due
  useEffect(() => {
    const checkBackup = () => {
      const twelveHours = 12 * 60 * 60 * 1000;
      if (Date.now() - lastBackup > twelveHours) {
        // We need a user gesture to trigger the popup in GIS, 
        // so we just highlight the button if it's due.
        // We can't auto-trigger without popup blockers stopping it.
      }
    };
    const interval = setInterval(checkBackup, 60000);
    checkBackup();
    return () => clearInterval(interval);
  }, [lastBackup]);

  const performBackup = async (accessToken: string) => {
    setStatus('backing_up');
    try {
      const backupData = JSON.stringify({
        users: store.users,
        products: store.products,
        invoices: store.invoices,
        returns: store.returns,
        payroll: store.payroll,
        ledger: store.ledger,
        shipments: store.shipments,
        clients: store.clients,
        auditLogs: store.auditLogs
      }, null, 2);

      const metadata = {
        name: `IMS_Backup_${new Date().toISOString().replace(/:/g, '-')}.json`,
        mimeType: 'application/json',
      };

      // 1. Create file metadata
      const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metadata)
      });
      
      if (!createRes.ok) {
        const errText = await createRes.text();
        console.error("Create metadata error:", errText);
        throw new Error('Failed to create file metadata');
      }
      const fileData = await createRes.json();
      
      // 2. Upload file content
      const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileData.id}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: backupData
      });

      if (!res.ok) {
        throw new Error('Failed to upload backup to Drive');
      }

      const data = await res.json();
      console.log('Backup successful:', data);
      
      const now = Date.now();
      setLastBackup(now);
      localStorage.setItem('erp_last_backup', now.toString());
      setStatus('success');
      
      store.addAuditLog({
        action: 'UPDATE',
        module: 'System',
        description: 'Successfully backed up database to Google Drive.',
        userName: store.currentUser?.name || 'System',
        userRole: store.currentUser?.role || 'System'
      });

      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const requestBackup = () => {
    if (tokenClient) {
      tokenClient.requestAccessToken();
    }
  };

  const isDue = Date.now() - lastBackup > 12 * 60 * 60 * 1000;

  if (store.currentUser?.role !== 'Admin') return null;

  return (
    <div className="bg-white/10 p-3 rounded-xl border border-white/10 mt-4 mb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cloud size={16} className={isDue ? "text-amber-400" : "text-slate-400"} />
          <span className="text-xs font-medium text-slate-300">Cloud Backup</span>
        </div>
        {status === 'backing_up' ? (
          <RefreshCw size={14} className="text-blue-400 animate-spin" />
        ) : status === 'success' ? (
          <Check size={14} className="text-emerald-400" />
        ) : status === 'error' ? (
          <AlertCircle size={14} className="text-red-400" />
        ) : null}
      </div>
      <p className="text-[10px] text-slate-400 mt-1 mb-2">
        {lastBackup > 0 ? `Last: ${new Date(lastBackup).toLocaleString()}` : 'No backups yet'}
      </p>
      <button
        onClick={requestBackup}
        disabled={status === 'backing_up' || !tokenClient}
        className={`w-full py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
          isDue 
            ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
            : 'bg-white/5 text-slate-300 hover:bg-white/10'
        }`}
      >
        {status === 'backing_up' ? 'Backing up...' : isDue ? 'Backup Due (Click to Run)' : 'Backup Now'}
      </button>
    </div>
  );
};
