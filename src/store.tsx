import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Product, Invoice, PayrollEntry, LedgerEntry, Client, Shipment, ReturnEntry, AuditLog } from './types';
import { db } from './lib/firebase';
import { collection, onSnapshot, doc, writeBatch, getDocs } from 'firebase/firestore';



interface StoreState {
  users: User[];
  products: Product[];
  invoices: Invoice[];
  returns: ReturnEntry[];
  payroll: PayrollEntry[];
  ledger: LedgerEntry[];
  shipments: Shipment[];
  clients: Client[];
  currentUser: User | null;
  auditLogs: AuditLog[];
}

interface StoreContextType extends StoreState {
  setUsers: (users: User[]) => void;
  setProducts: (products: Product[]) => void;
  setInvoices: (invoices: Invoice[]) => void;
  setReturns: (returns: ReturnEntry[]) => void;
  setPayroll: (payroll: PayrollEntry[]) => void;
  setLedger: (ledger: LedgerEntry[]) => void;
  setShipments: (shipments: Shipment[]) => void;
  setClients: (clients: Client[]) => void;
  setCurrentUser: (user: User | null) => void;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  dbStatus: 'Online' | 'Offline' | 'Connecting';
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const initialProducts: Product[] = [];

const initialUsers: User[] = [
  { id: '1', name: 'Mohammed Tarique Ismail', username: 'MTI01', role: 'Admin', email: 'admin1@tz.com', password: 'Admin001' },
  { id: '2', name: 'Mohammed Saadat Tariq', username: 'MST02', role: 'Admin', email: 'admin2@tz.com', password: 'Admin002' },
  { id: '3', name: 'Md Masum', username: 'MMEmp01', role: 'Employee', email: 'masum@tz.com', password: 'Emp001' },
];

const initialClients: Client[] = [
  { id: 'c1', name: 'CSD', displayName: '', address: '', headers: ['S.L No', 'Code', 'Product Description', 'Unit', 'Quantity', 'CPU', 'Total Price', 'Remark'], priceField: 'tpCsd', discountPercent: 4 },
  { id: 'c2', name: 'Captains World', displayName: 'Captains World', address: '', headers: ['S.L No', 'Item Code', 'Description', 'Quantity', 'CPU', 'TP', 'Total', 'Remark'], priceField: 'tpCaptainsWorld', discountPercent: 0 },
  { id: 'c3', name: 'Coopers', displayName: 'GWEEBARRA BAKERY INDUSTRY LIMITED', address: '147/1, VIP OLD AIRPORT ROAD, TEJGAON, DHAKA -1215.', headers: ['S.L No', 'Item Code', 'Item Description', 'Quantity', 'TP (TAX INCLUDED)', 'Total Price', 'Remark'], priceField: 'tpCoopers', discountPercent: 0 },
  { id: 'c4', name: 'GENIUS', displayName: 'GENIUS', address: '', headers: ['S.L No', 'ITEM CODE', 'ITEM DESCRIPTION', 'Quantity', 'CPU', 'Total', 'REMARKS'], priceField: 'tpGenius', discountPercent: 0 },
  { id: 'c5', name: 'Overseas', displayName: 'OVERSEAS', address: 'NIMTOLI KHILKHET DHAKA', headers: ['S.L No', 'ITEM CODE', 'ITEM DESCRIPTION', 'Quantity', 'CPU', 'Total', 'REMARKS'], priceField: 'tpOverseas', discountPercent: 0 },
  { id: 'c6', name: 'Iferi', displayName: 'IFERI', address: '', headers: ['S.L No', 'Item Code', 'Description', 'Quantity', 'TP', 'Total', 'Remark'], priceField: 'tpIferi', discountPercent: 0 },
  { id: 'c7', name: 'Shumis', displayName: 'SHUMIS', address: '', headers: ['S.L No', 'Item Code', 'Item Description', 'Quantity', 'TP', 'MRP', 'Total Price', 'Remark'], priceField: 'tpShumis', discountPercent: 0 },
];

const initialState: StoreState = {
  users: initialUsers,
  products: initialProducts,
  invoices: [],
  returns: [],
  payroll: [],
  ledger: [],
  shipments: [],
  clients: initialClients,
  currentUser: null, // Default to null to show login
  auditLogs: [],
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<StoreState>(() => {
    const savedUser = sessionStorage.getItem('erp-currentUser');
    return {
      ...initialState,
      currentUser: savedUser ? JSON.parse(savedUser) : null
    };
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [dbStatus, setDbStatus] = useState<'Online' | 'Offline' | 'Connecting'>('Connecting');

  useEffect(() => {
    setDbStatus(navigator.onLine ? 'Online' : 'Offline');
    const handleOnline = () => setDbStatus('Online');
    const handleOffline = () => setDbStatus('Offline');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const collectionsList = ['users', 'products', 'invoices', 'returns', 'payroll', 'ledger', 'shipments', 'clients', 'auditLogs'];
    
    const unsub = onSnapshot(collection(db, 'erp_store'), (snapshot) => {
      const allDocs = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
      
      setState(prev => {
        const newState = { ...prev };
        collectionsList.forEach(col => {
          const colData = allDocs.filter(d => d._collection === col);
          newState[col as keyof StoreState] = colData.length > 0 ? colData : (initialState as any)[col] || [];
        });
        return newState;
      });
      setIsLoaded(true);
    }, (error) => {
      console.error("Firebase read error:", error);
      setIsLoaded(true);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsub();
    };
  }, []);

    const updateState = async (key: keyof StoreState, value: any) => {
    if (key === 'currentUser') {
      setState(prev => ({ ...prev, currentUser: value }));
      sessionStorage.setItem('erp-currentUser', JSON.stringify(value));
      return;
    }

    setState(prev => {
      const oldItems = (prev[key] || []) as any[];
      const newItems = value as any[];
      
      const oldIds = new Set(oldItems.map(i => String(i.id)));
      const newIds = new Set(newItems.map(i => String(i.id)));

      const added = newItems.filter(i => !oldIds.has(String(i.id)));
      const deleted = oldItems.filter(i => !newIds.has(String(i.id)));
      const updated = newItems.filter(i => {
         if (!oldIds.has(String(i.id))) return false;
         const oldItem = oldItems.find(o => String(o.id) === String(i.id));
         return JSON.stringify(oldItem) !== JSON.stringify(i);
      });

      (async () => {
         try {
            const b = writeBatch(db);
            let opsCount = 0;

            deleted.forEach(item => {
               b.delete(doc(db, 'erp_store', String(item.id)));
               opsCount++;
            });
            
            [...added, ...updated].forEach(item => {
               const docId = item.id ? String(item.id) : doc(collection(db, 'erp_store')).id;
               item.id = docId; // mutates local value but that's fine
               const dataToSave = JSON.parse(JSON.stringify(item));
               dataToSave._collection = key;
               b.set(doc(db, 'erp_store', docId), dataToSave, { merge: true });
               opsCount++;
            });

            if (opsCount > 0) {
               await b.commit();
            }
         } catch (error) {
            console.error("Firestore sync error:", error);
         }
      })();

      return { ...prev, [key]: value };
    });
  };

  const addAuditLog = (logData: Omit<AuditLog, 'id' | 'timestamp'>) => {
    setState(prev => {
       const newLog: AuditLog = {
         ...logData,
         id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
         timestamp: new Date().toISOString()
       };
       const updatedLogs = [newLog, ...(prev.auditLogs || [])].slice(0, 1000);
       
       (async () => {
         try {
            const b = writeBatch(db);
            const dataToSave = JSON.parse(JSON.stringify(newLog));
            dataToSave._collection = 'auditLogs';
            b.set(doc(db, 'erp_store', newLog.id), dataToSave, { merge: true });
            await b.commit();
         } catch (err) { console.error(err); }
       })();
       return { ...prev, auditLogs: updatedLogs };
    });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4097d0] mb-4"></div>
        <p className="text-gray-500 font-medium">Connecting to secure cloud database...</p>
      </div>
    );
  }

  return (
    <StoreContext.Provider
      value={{
        ...state,
        setUsers: (users) => updateState('users', users),
        setProducts: (products) => updateState('products', products),
        setInvoices: (invoices) => updateState('invoices', invoices),
        setPayroll: (payroll) => updateState('payroll', payroll),
        setLedger: (ledger) => updateState('ledger', ledger),
        setShipments: (shipments) => updateState('shipments', shipments),
        setClients: (clients) => updateState('clients', clients),
        setReturns: (returns) => updateState('returns', returns),
        setCurrentUser: (user) => updateState('currentUser', user),
        addAuditLog,
        dbStatus,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
