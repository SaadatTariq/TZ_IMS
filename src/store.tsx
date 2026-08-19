import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Product, Invoice, PayrollEntry, LedgerEntry, Client, Shipment, ReturnEntry } from './types';
import { db } from './lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

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
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const sanitizeForFirestore = (value: any): any => {
  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeForFirestore(item))
      .filter((item) => item !== undefined);
  }

  if (value && typeof value === 'object') {
    const sanitizedEntries = Object.entries(value)
      .filter(([, entryValue]) => entryValue !== undefined)
      .map(([entryKey, entryValue]) => [entryKey, sanitizeForFirestore(entryValue)]);
    return Object.fromEntries(sanitizedEntries);
  }

  if (typeof value === 'number' && Number.isNaN(value)) {
    return 0;
  }

  return value;
};

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

  useEffect(() => {
    // Fallback timer: if Firebase takes too long to connect/respond, just use local state
    const fallbackTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 2500);

    const unsubscribe = onSnapshot(doc(db, 'erp_store', 'main'), (docSnap) => {
      clearTimeout(fallbackTimer);
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<StoreState>;
        const repairPayload: Partial<StoreState> = {};

        const safeData: Partial<StoreState> = {
          users: Array.isArray(data.users) ? data.users : initialUsers,
          clients: Array.isArray(data.clients) ? data.clients : initialClients,
          products: Array.isArray(data.products) ? data.products : [],
          invoices: Array.isArray(data.invoices) ? data.invoices : [],
          returns: Array.isArray(data.returns) ? data.returns : [],
          payroll: Array.isArray(data.payroll) ? data.payroll : [],
          ledger: Array.isArray(data.ledger) ? data.ledger : [],
          shipments: Array.isArray(data.shipments) ? data.shipments : [],
        };

        // Recovery: reseed critical collections if they were accidentally wiped to empty arrays.
        if (Array.isArray(data.users) && data.users.length === 0) {
          safeData.users = initialUsers;
          repairPayload.users = initialUsers;
        }
        if (Array.isArray(data.clients) && data.clients.length === 0) {
          safeData.clients = initialClients;
          repairPayload.clients = initialClients;
        }

        if (!Array.isArray(data.users)) repairPayload.users = initialUsers;
        if (!Array.isArray(data.clients)) repairPayload.clients = initialClients;
        if (!Array.isArray(data.products)) repairPayload.products = [];
        if (!Array.isArray(data.invoices)) repairPayload.invoices = [];
        if (!Array.isArray(data.returns)) repairPayload.returns = [];
        if (!Array.isArray(data.payroll)) repairPayload.payroll = [];
        if (!Array.isArray(data.ledger)) repairPayload.ledger = [];
        if (!Array.isArray(data.shipments)) repairPayload.shipments = [];

        if (Object.keys(repairPayload).length > 0) {
          setDoc(doc(db, 'erp_store', 'main'), sanitizeForFirestore(repairPayload), { merge: true }).catch(console.error);
        }

        // Ensure currentUser is never overwritten by remote database
        delete (safeData as any).currentUser;

        setState(prev => ({ ...prev, ...safeData }));
      } else {
        const { currentUser, ...stateToSave } = initialState;
        console.log("Document does not exist. Creating it now...");
        setDoc(doc(db, 'erp_store', 'main'), stateToSave).then(() => {
          console.log("Successfully created initial database document!");
        }).catch(e => {
          console.error("Failed to create initial database document:", e);
          alert("Failed to initialize database: " + e.message);
        });
      }
      setIsLoaded(true);
    }, (error) => {
      clearTimeout(fallbackTimer);
      console.error("Firebase read error:", error);
      alert("Database read failed! You may need to update your Firestore Security Rules in the Firebase Console to allow reads. Using local fallback. Error: " + error.message);
      setIsLoaded(true);
    });

    return () => {
      clearTimeout(fallbackTimer);
      unsubscribe();
    };
  }, []);

  const updateState = async (key: keyof StoreState, value: any) => {
    setState(prev => ({ ...prev, [key]: value }));
    
    if (key === 'currentUser') {
      sessionStorage.setItem('erp-currentUser', JSON.stringify(value));
    } else {
      try {
        await setDoc(
          doc(db, 'erp_store', 'main'),
          { [key]: sanitizeForFirestore(value) },
          { merge: true }
        );
      } catch (err: any) {
        console.error("Firebase sync error:", err);
        alert("Database save failed! You may need to update your Firestore Security Rules in the Firebase Console to allow writes. Error: " + err.message);
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
        setReturns: (returns) => updateState('returns', returns),
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
