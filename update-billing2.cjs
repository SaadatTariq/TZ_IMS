const fs = require('fs');
let code = fs.readFileSync('src/pages/Billing.tsx', 'utf-8');

code = code.replace(
  'const generatePDF = async () => {',
  'const generatePDF = async () => {\n    setIsGenerating(true);\n'
);

code = code.replace(
  'return pdf;\n    } catch (e: any) {',
  'setIsGenerating(false);\n      return pdf;\n    } catch (e: any) {'
);

code = code.replace(
  'return null;\n    }\n  };',
  'setIsGenerating(false);\n      return null;\n    }\n  };'
);

code = code.replace(
  /<Download size=\{20\} className="mr-2" \/> Download PDF/g,
  '{isGenerating ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2" /> : <Download size={20} className="mr-2" />}\n                {isGenerating ? "Generating..." : "Download PDF"}'
);

code = code.replace(
  /<Share2 size=\{20\} className="mr-2" \/> Share/g,
  '{isGenerating ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2" /> : <Share2 size={20} className="mr-2" />}\n                {isGenerating ? "Processing..." : "Share"}'
);

fs.writeFileSync('src/pages/Billing.tsx', code);
