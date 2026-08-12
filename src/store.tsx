import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Product, Invoice, PayrollEntry, LedgerEntry, Client, Shipment } from './types';
import { db } from './lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface StoreState {
  users: User[];
  products: Product[];
  invoices: Invoice[];
  payroll: PayrollEntry[];
  ledger: LedgerEntry[];
  shipments: Shipment[];
  clients: Client[];
  currentUser: User | null;
}

interface StoreContextType extends StoreState {
  setUsers: (users: User[]) => void;
  setProducts: (products: Product[]) => void;
  setInvoices: (invoices: Invoice[]) => void;
  setPayroll: (payroll: PayrollEntry[]) => void;
  setLedger: (ledger: LedgerEntry[]) => void;
  setShipments: (shipments: Shipment[]) => void;
  setClients: (clients: Client[]) => void;
  setCurrentUser: (user: User | null) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const initialProducts: Product[] = [
  { id: '1', code: 'TZ-1803', barcode: '1234567890123', description: 'Big Sieve', unit: 'Pcs', cpu: 200, tpCsd: 220, tpCaptainsWorld: 230, tpCoopers: 240, tpShumis: 250, tpGenius: 0, tpOverseas: 350, tpIferi: 260, mrp: 500, stock: 150 },
  { id: '2', code: 'TZ-1804', barcode: '1234567890124', description: 'M Sieve', unit: 'Pcs', cpu: 180, tpCsd: 200, tpCaptainsWorld: 210, tpCoopers: 220, tpShumis: 230, tpGenius: 0, tpOverseas: 330, tpIferi: 240, mrp: 450, stock: 95 },
  { id: '3', code: 'TZ-1805', barcode: '1234567890125', description: 'S Sieve', unit: 'Pcs', cpu: 150, tpCsd: 170, tpCaptainsWorld: 180, tpCoopers: 190, tpShumis: 200, tpGenius: 0, tpOverseas: 295, tpIferi: 210, mrp: 400, stock: 0 },
];

const initialUsers: User[] = [
  { id: '1', name: 'Mohammed Tarique Ismail', role: 'Admin', email: 'admin1@tz.com', password: 'Admin001' },
  { id: '2', name: 'Mohammed Saadat Tariq', role: 'Admin', email: 'admin2@tz.com', password: 'Admin002' },
  { id: '3', name: 'Md Masum', role: 'Employee', email: 'masum@tz.com', password: 'Emp001' },
];

const initialClients: Client[] = [
  { id: 'c1', name: 'CSD', displayName: '', address: '', headers: ['S.L No', 'Code', 'Product Description', 'Unit', 'Quantity', 'CPU', 'Total Price', 'Remark'], priceField: 'tpCsd', discountPercent: 4 },
  { id: 'c2', name: 'Captains World', displayName: 'Captains World', address: '', headers: ['S.L No', 'Item Code', 'Description', 'Quantity', 'CPU', 'TP', 'Total', 'Remark'], priceField: 'tpCaptainsWorld', discountPercent: 0 },
  { id: 'c3', name: 'Coopers', displayName: 'GWEEBARRA BAKERY INDUSTRY LIMITED', address: '147/1, VIP OLD AIRPORT ROAD, TEJGAON, DHAKA -1215.', headers: ['S.L No', 'Item Code', 'Item Description', 'Quantity', 'TP (TAX INCLUDED)', 'Total Price', 'Remark'], priceField: 'tpCoopers', discountPercent: 0 },
  { id: 'c4', name: 'GENIUS', displayName: 'GENIUS', address: '', headers: ['S.L No', 'ITEM CODE', 'ITEM DESCRIPTION', 'Quantity', 'CPU', 'Total', 'REMARKS'], priceField: 'tpIferi', discountPercent: 0 },
  { id: 'c5', name: 'Overseas', displayName: 'OVERSEAS', address: 'NIMTOLI KHILKHET DHAKA', headers: ['S.L No', 'ITEM CODE', 'ITEM DESCRIPTION', 'Quantity', 'CPU', 'Total', 'REMARKS'], priceField: 'tpOverseas', discountPercent: 0 },
  { id: 'c6', name: 'Iferi', displayName: 'IFERI', address: '', headers: ['S.L No', 'Item Code', 'Description', 'Quantity', 'TP', 'Total', 'Remark'], priceField: 'tpIferi', discountPercent: 0 },
  { id: 'c7', name: 'Shumis', displayName: 'SHUMIS', address: '', headers: ['S.L No', 'Item Code', 'Item Description', 'Quantity', 'TP', 'MRP', 'Total Price', 'Remark'], priceField: 'tpShumis', discountPercent: 0 },
];

const initialState: StoreState = {
  users: initialUsers,
  products: initialProducts,
  invoices: [],
  payroll: [],
  ledger: [],
  shipments: [],
  clients: initialClients,
  currentUser: null, // Default to null to show login
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<StoreState>(() => {
    const savedUser = localStorage.getItem('erp-currentUser');
    return {
      ...initialState,
      currentUser: savedUser ? JSON.parse(savedUser) : null
    };
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'erp_store', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<StoreState>;
        // Migration: Ensure new demo users exist in the saved state
        if (data.users && !data.users.find((u: User) => u.name === 'Mohammed Tarique Ismail')) {
          data.users = initialUsers;
        }
        // Migration: Ensure new clients exist
        if (data.clients && data.clients.length === 0) {
          data.clients = initialClients;
        }
        
        // Ensure currentUser is never overwritten by remote database
        delete (data as any).currentUser;

        setState(prev => ({ ...prev, ...data }));
      } else {
        const { currentUser, ...stateToSave } = initialState;
        setDoc(doc(db, 'erp_store', 'main'), stateToSave);
      }
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  const updateState = async (key: keyof StoreState, value: any) => {
    setState(prev => ({ ...prev, [key]: value }));
    
    if (key === 'currentUser') {
      localStorage.setItem('erp-currentUser', JSON.stringify(value));
    } else {
      try {
        await setDoc(doc(db, 'erp_store', 'main'), { [key]: value }, { merge: true });
      } catch (err) {
        console.error("Firebase sync error:", err);
      }
    }
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
        setCurrentUser: (user) => updateState('currentUser', user),
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
