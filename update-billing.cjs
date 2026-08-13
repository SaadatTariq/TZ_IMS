const fs = require('fs');
let code = fs.readFileSync('src/pages/Billing.tsx', 'utf-8');

// Add printRef
code = code.replace(
  'const [isGenerating, setIsGenerating] = useState(false);',
  'const [isGenerating, setIsGenerating] = useState(false);\n  const printRef = useRef<HTMLDivElement>(null);\n  const handlePrint = useReactToPrint({\n    content: () => printRef.current,\n    documentTitle: `Invoice_${invoiceNo || "Draft"}`, \n  });'
);

// Add printRef to the div
code = code.replace(
  '<div id="invoice-print-area" className="bg-white p-4">',
  '<div id="invoice-print-area" ref={printRef} className="bg-white p-4">'
);

// Replace print button onClick
code = code.replace(
  'onClick={() => window.print()}',
  'onClick={handlePrint}'
);

fs.writeFileSync('src/pages/Billing.tsx', code);
