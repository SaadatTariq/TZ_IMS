const fs = require('fs');

let layoutContent = fs.readFileSync('src/components/Layout.tsx', 'utf-8');
if (!layoutContent.includes('system-monitor')) {
  layoutContent = layoutContent.replace(
    `import { LayoutDashboard, Receipt, Package, Users, Wallet, BookOpen, Truck, Menu, X, LogOut, History, MapPin, RotateCcw, RefreshCw } from 'lucide-react';`,
    `import { LayoutDashboard, Receipt, Package, Users, Wallet, BookOpen, Truck, Menu, X, LogOut, History, MapPin, RotateCcw, RefreshCw, Activity } from 'lucide-react';`
  );
  layoutContent = layoutContent.replace(
    `{ id: 'users', label: 'Users', icon: Users },`,
    `{ id: 'users', label: 'Users', icon: Users },
    { id: 'system-monitor', label: 'System Monitor', icon: Activity },`
  );
  fs.writeFileSync('src/components/Layout.tsx', layoutContent);
}

let appContent = fs.readFileSync('src/App.tsx', 'utf-8');
if (!appContent.includes('SystemMonitor')) {
  appContent = appContent.replace(
    `import { Login } from './pages/Login';`,
    `import { Login } from './pages/Login';\nimport { SystemMonitor } from './pages/SystemMonitor';`
  );
  appContent = appContent.replace(
    `case 'delivery-tracker': return <DeliveryTracker />;`,
    `case 'delivery-tracker': return <DeliveryTracker />;\n      case 'system-monitor': return <SystemMonitor />;`
  );
  fs.writeFileSync('src/App.tsx', appContent);
}

