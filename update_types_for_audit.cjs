const fs = require('fs');
let fileContent = fs.readFileSync('src/types.ts', 'utf-8');

if (!fileContent.includes('AuditLog')) {
  fileContent += `\nexport interface AuditLog {\n  id: string;\n  timestamp: string;\n  userName: string;\n  userRole: string;\n  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'SYSTEM' | 'EXPORT';\n  module: 'Auth' | 'Inventory' | 'Billing' | 'System' | 'Ledger' | 'Shipments' | 'Users' | 'Clients' | 'Returns';\n  description: string;\n}\n`;
  fs.writeFileSync('src/types.ts', fileContent);
}
