const fs = require('fs');
let code = fs.readFileSync('src/pages/Billing.tsx', 'utf-8');

code = code.replace(
  'onClick={handleDownload} className="flex',
  'onClick={handleDownload} disabled={isGenerating} className="flex'
);

code = code.replace(
  'onClick={handleShare} className="flex',
  'onClick={handleShare} disabled={isGenerating} className="flex'
);

fs.writeFileSync('src/pages/Billing.tsx', code);
