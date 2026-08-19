const fs = require('fs');
let fileContent = fs.readFileSync('src/store.tsx', 'utf-8');

// Add AuditLog to imports
if (!fileContent.includes('AuditLog')) {
  fileContent = fileContent.replace(
    `import { User, Product, Invoice, PayrollEntry, LedgerEntry, Client, Shipment, ReturnEntry } from './types';`,
    `import { User, Product, Invoice, PayrollEntry, LedgerEntry, Client, Shipment, ReturnEntry, AuditLog } from './types';`
  );
}

// Add to StoreState
if (!fileContent.includes('auditLogs: AuditLog[];')) {
  fileContent = fileContent.replace(
    `  currentUser: User | null;\n}`,
    `  currentUser: User | null;\n  auditLogs: AuditLog[];\n}`
  );
}

// Add to StoreContextType
if (!fileContent.includes('addAuditLog')) {
  fileContent = fileContent.replace(
    `  setCurrentUser: (user: User | null) => void;\n}`,
    `  setCurrentUser: (user: User | null) => void;\n  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;\n  dbStatus: 'Online' | 'Offline' | 'Connecting';\n}`
  );
}

// Add to initialState
if (!fileContent.includes('auditLogs: [],')) {
  fileContent = fileContent.replace(
    `  currentUser: null, // Default to null to show login\n};`,
    `  currentUser: null, // Default to null to show login\n  auditLogs: [],\n};`
  );
}

// Add to updatePayload and fallbacks
if (!fileContent.includes('if (!data.auditLogs)')) {
  fileContent = fileContent.replace(
    `        if (!data.shipments) { data.shipments = []; updatePayload.shipments = []; needsUpdate = true; }`,
    `        if (!data.shipments) { data.shipments = []; updatePayload.shipments = []; needsUpdate = true; }
        if (!data.auditLogs) { data.auditLogs = []; updatePayload.auditLogs = []; needsUpdate = true; }`
  );
}

// Add dbStatus and addAuditLog implementation
if (!fileContent.includes('const [dbStatus')) {
  fileContent = fileContent.replace(
    `const [isLoaded, setIsLoaded] = useState(false);`,
    `const [isLoaded, setIsLoaded] = useState(false);
  const [dbStatus, setDbStatus] = useState<'Online' | 'Offline' | 'Connecting'>('Connecting');
  
  useEffect(() => {
    const handleOnline = () => setDbStatus('Online');
    const handleOffline = () => setDbStatus('Offline');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setDbStatus(navigator.onLine ? 'Online' : 'Offline');
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);`
  );
}

if (!fileContent.includes('const addAuditLog =')) {
  fileContent = fileContent.replace(
    `  const updateState = async (key: keyof StoreState, value: any) => {`,
    `  const addAuditLog = (logData: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...logData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString()
    };
    setState(prev => {
      const updatedLogs = [newLog, ...(prev.auditLogs || [])].slice(0, 1000); // Keep last 1000
      
      // Async save to firestore without blocking state
      const cleanValue = JSON.parse(JSON.stringify(updatedLogs));
      setDoc(doc(db, 'erp_store', 'main'), { auditLogs: cleanValue }, { merge: true }).catch(console.error);
      
      return { ...prev, auditLogs: updatedLogs };
    });
  };

  const updateState = async (key: keyof StoreState, value: any) => {`
  );
}

// Add to Provider value
if (!fileContent.includes('addAuditLog,')) {
  fileContent = fileContent.replace(
    `        setCurrentUser: (user) => updateState('currentUser', user),`,
    `        setCurrentUser: (user) => updateState('currentUser', user),
        addAuditLog,
        dbStatus,`
  );
}

fs.writeFileSync('src/store.tsx', fileContent);
