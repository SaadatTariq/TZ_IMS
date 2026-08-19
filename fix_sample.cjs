const fs = require('fs');
let fileContent = fs.readFileSync('src/pages/Inventory.tsx', 'utf-8');

fileContent = fileContent.replace(
  `{ Code: 'TZ-1001', Barcode: '1234567', Description: 'Sample Item', Description_CSD: 'Sample Item CSD', Unit: 'Pcs', CP: 95, CPU: 110, TP_CSD: 110, TP_Captains: 115, TP_Coopers: 120, TP_Shumis: 125, TP_Genius: 130, TP_Overseas: 135, TP_Iferi: 140, MRP: 200, Stock: 50 }`,
  `{ Code: 'TZ-1001', Barcode: '1234567', Description: 'Sample Item', Description_CSD: 'Sample Item CSD', Unit: 'Pcs', CP: 95, CPU: 110, TP_Captains: 115, TP_Coopers: 120, TP_Shumis: 125, TP_Genius: 130, TP_Overseas: 135, TP_Iferi: 140, MRP: 200, Stock: 50 }`
);

fileContent = fileContent.replace(
  `tpCsd: parseFloat(row.TP_CSD) || 0,`,
  `tpCsd: parseFloat(row.CPU) || 0,`
);

fs.writeFileSync('src/pages/Inventory.tsx', fileContent);
