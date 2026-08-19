const fs = require('fs');

// Update Layout.tsx
let layoutContent = fs.readFileSync('src/components/Layout.tsx', 'utf-8');
layoutContent = layoutContent.replace(
  `{ id: 'inventory', label: 'Inventory', icon: Package },`,
  `{ id: 'inventory-local', label: 'Local Inventory', icon: Package },
    { id: 'inventory-imported', label: 'Imported Inventory', icon: Package },`
);
layoutContent = layoutContent.replace(
  `['dashboard', 'billing', 'invoice-history', 'inventory', 'ledger']`,
  `['dashboard', 'billing', 'invoice-history', 'inventory-local', 'inventory-imported', 'ledger']`
);
fs.writeFileSync('src/components/Layout.tsx', layoutContent);

// Update App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf-8');
appContent = appContent.replace(
  `case 'inventory': return <Inventory />;`,
  `case 'inventory-local': return <Inventory type="Local" />;
      case 'inventory-imported': return <Inventory type="Imported" />;`
);
fs.writeFileSync('src/App.tsx', appContent);
