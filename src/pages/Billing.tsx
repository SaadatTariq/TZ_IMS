// ... existing imports
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { Invoice, InvoiceItem, Product, Client } from '../types';
import { Plus, Trash2, Printer, Save, CheckCircle, Search, Download, Share2 } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { numberToWords } from '../utils';
import { InvoiceTemplate } from '../components/InvoiceTemplate';
import { PasswordConfirmModal } from '../components/PasswordConfirmModal';

// Global POS Product Search
const GlobalProductSearch: React.FC<{
  products: Product[];
  onSelect: (p: Product) => void;
}> = ({ products, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter by code, barcode, or description
  const normalize = (str: string) => (str || '').toLowerCase().replace(/[\s\-_]/g, '');
  const searchNormalized = normalize(searchTerm);
  
  const filteredProducts = products.filter(p => 
     normalize(p.code).includes(searchNormalized) || 
     normalize(p.barcode || '').includes(searchNormalized) ||
     normalize(p.description).includes(searchNormalized)
  ).slice(0, 15);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isOpen && filteredProducts.length > 0) {
      onSelect(filteredProducts[0]);
      setSearchTerm('');
      setIsOpen(false);
    }
  };

  return (
    <div className="relative mb-6" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none"
          placeholder="Search by Code, Name, or Barcode (Press Enter to add)..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        <Search className="absolute left-3.5 top-2.5 text-slate-400" size={18} />
      </div>
      {isOpen && searchTerm && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-80 overflow-auto">
          {filteredProducts.map(p => (
            <li 
              key={p.id}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-0 border-slate-100 flex justify-between items-center"
              onClick={() => {
                onSelect(p);
                setSearchTerm('');
                setIsOpen(false);
              }}
            >
              <div>
                <span className="font-bold text-slate-800">{p.code}</span>
                <span className="ml-2 text-sm text-slate-600">{p.description}</span>
              </div>
              <div className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">Stock: {p.stock}</div>
            </li>
          ))}
          {filteredProducts.length === 0 && (
            <li className="px-4 py-3 text-slate-500 text-sm">No products found.</li>
          )}
        </ul>
      )}
    </div>
  );
};

export const Billing: React.FC = () => {
  const { products, invoices, setInvoices, setProducts, clients, currentUser } = useStore();
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [items, setItems] = useState<(InvoiceItem & { product: Product })[]>([]);
  
  const [isSaved, setIsSaved] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [invoiceNo, setInvoiceNo] = useState('');
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice_${invoiceNo || "Draft"}`, 
  });
  const [paymentMethod, setPaymentMethod] = useState<'Cash Sale' | 'Credit Sale'>('Cash Sale');
  const [csdBranch, setCsdBranch] = useState('');
  const [shumisBranch, setShumisBranch] = useState('');
  const shumisBranches = ["Sobhanbagh","Mohammadpur","Lalmatia","Kolabagan","Tajmahal Rd","Dhanmondi","Asadgate","Satmasjid Rd","Farmgate","Gulshan-1","Mirpur - 12","DOHS Mirpur","Ibrahimpur","Monipur Mirpur-2","Uttara 4","Uttara 6","Uttara 7","Khilgaon","Rampura","Wari","Banasree","Taltola","Eskaton","Tipu Sultan Rd"];

  
  const isAdmin = currentUser?.role === 'Admin';
  
  const selectedClientObj = clients.find(c => c.id === selectedClientId) || clients[0];

  useEffect(() => {
    if (selectedClientObj?.name === 'Coopers') {
      const today = new Date();
      setInvoiceNo(`${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`);
    } else {
      setInvoiceNo('');
    }
  }, [selectedClientId]);

  const handleAddProduct = (p: Product) => {
    setItems([...items, { productId: p.id, quantity: 0, remark: '', product: p }]);
    setIsSaved(false);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    if (field === 'productId') {
      const p = products.find(p => p.id === value);
      if (p) {
        newItems[index].productId = value;
        newItems[index].product = p;
      }
    } else {
      (newItems[index] as any)[field] = value;
    }
    setItems(newItems);
    setIsSaved(false);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    setIsSaved(false);
  };

  const getUnitPrice = (p: Product) => {
    if (!selectedClientObj) return p.cpu;
    const field = selectedClientObj.priceField;
    if (selectedClientObj.name === 'Captains World') {
      // Previous logic specifically for Captains World if TP was 26% off CPU, but they have their own price field now.
      // If we strictly follow the price field:
      return p[field] as number || p.cpu;
    }
    return p[field] as number || p.cpu;
  };

  const calculateItemPrice = (item: InvoiceItem & { product: Product }) => {
    return getUnitPrice(item.product) * item.quantity;
  };

  const calculateSubTotal = () => {
    return items.reduce((sum, item) => sum + calculateItemPrice(item), 0);
  };

  const calculateTotal = () => {
    let subTotal = calculateSubTotal();
    let discount = selectedClientObj?.discountPercent ? Math.round(subTotal * (selectedClientObj.discountPercent / 100)) : 0;
    return Math.round(subTotal - discount);
  };

  
  const saveInvoice = () => {
    if (items.length === 0) return;
    setPendingAction(() => performSaveInvoice);
  };

  const performSaveInvoice = () => {
    if (items.length === 0) return alert('Add items to generate invoice.');
    if (selectedClientObj.name === 'Shumis' && !shumisBranch) return alert('Please select a Shumis branch.');
    
    const total = calculateTotal();
    const status = isAdmin ? 'Approved' : 'Pending Approval';
    const dateFormatted = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const invoiceTitle = selectedClientObj.name === 'CSD' 
      ? `CSD ${csdBranch || '___________________'} invoice dated ${dateFormatted}`
      : selectedClientObj.name === 'Shumis' ? `Shumis ${shumisBranch || ''} invoice dated ${dateFormatted}` : `${selectedClientObj.name} Invoice Dated ${dateFormatted}`;

    const newInvoice: Invoice = {
      id: invoiceNo || Date.now().toString(),
      title: invoiceTitle,
      clientId: selectedClientObj.name,
      date: new Date().toISOString(),
      items: items.map(({ productId, quantity, remark }) => ({ productId, quantity, remark })),
      total,
      discount: selectedClientObj?.discountPercent ? Math.round(calculateSubTotal() * (selectedClientObj.discountPercent / 100)) : 0,
      status,
      createdBy: currentUser?.name,
      paymentMethod,
      csdBranch: selectedClientObj.name === 'CSD' ? csdBranch : undefined,
      shumisBranch: selectedClientObj.name === 'Shumis' ? shumisBranch : undefined
    };
    
    setInvoices([...invoices, newInvoice]);
    
    if (isAdmin) {
      const updatedProducts = products.map(p => {
        const invoicedItem = items.find(i => i.productId === p.id);
        if (invoicedItem) {
          return { ...p, stock: p.stock - invoicedItem.quantity };
        }
        return p;
      });
      setProducts(updatedProducts);
      alert('Invoice approved and stock deducted successfully!');
    } else {
      alert('Invoice submitted for Admin approval.');
    }
    
    setIsSaved(true);
  };

  
  const handleDownload = () => {
    handlePrint();
  };

  const handleShare = () => {
    handlePrint();
  };

  const renderCell = (header: string, item: InvoiceItem & { product: Product }, sl: number, arrLength: number, i: number) => {
    const h = header.toLowerCase();
    const p = item.product;
    const isLast = i === arrLength - 1;
    let content: React.ReactNode = '-';

    if (h.includes('s.l') || h.includes('sl')) content = sl;
    else if (h.includes('code')) content = p.code;
    else if (h.includes('desc')) content = p.description;
    else if (h.includes('unit')) content = p.unit;
    else if (h.includes('quant') || h === 'qty') content = item.quantity;
    else if (h.includes('remark') || h.includes('remarks')) content = item.remark;
    else if (h === 'cpu') content = p.cpu;
    else if (h === 'mrp') content = p.mrp;
    else if (h.includes('total')) content = (getUnitPrice(p) * item.quantity).toFixed(2);
    else if (h.includes('tp')) {
      if (selectedClientObj.name === 'Captains World') {
        content = (p.cpu * 0.74).toFixed(2); // Retain original 26% off display logic for CW TP column
      } else {
        content = getUnitPrice(p);
      }
    }

    return (
      <td key={h} className={`p-2 text-center ${!isLast ? 'border-r border-gray-400' : ''}`}>
        {content}
      </td>
    );
  };

  // Pagination logic: max 20 items per page
  const chunkedItems = [];
  for (let i = 0; i < items.length; i += 20) {
    chunkedItems.push(items.slice(i, i + 20));
  }
  if (chunkedItems.length === 0) chunkedItems.push([]); // Ensure at least one page renders

  return (
    <div className="space-y-6 print:m-0 print:p-0 print:space-y-0">
      <PasswordConfirmModal isOpen={!!pendingAction} onConfirm={() => { pendingAction?.(); setPendingAction(null); }} onCancel={() => setPendingAction(null)} />
      <div className="print:hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Billing & Invoicing</h1>
        <div className="flex space-x-3">
          <button type="button" onClick={handlePrint} className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 shadow-sm transition-colors">
            <Printer size={20} className="mr-2" /> Print
          </button>
          {isSaved && (
            <>
              <button type="button" onClick={handleDownload} disabled={isGenerating} className="flex items-center px-4 py-2 bg-[#36609b]/10 text-[#36609b] border border-[#36609b]/20 rounded-xl hover:bg-[#36609b]/20 shadow-sm transition-colors">
                {isGenerating ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2" /> : <Download size={20} className="mr-2" />}
                {isGenerating ? "Generating..." : "Download PDF"}
              </button>
              <button type="button" onClick={handleShare} disabled={isGenerating} className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors">
                {isGenerating ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2" /> : <Share2 size={20} className="mr-2" />}
                {isGenerating ? "Processing..." : "Share"}
              </button>
            </>
          )}
          <button type="button" onClick={saveInvoice} disabled={isSaved || items.length === 0} className="flex items-center px-4 py-2 bg-[#36609b] text-white shadow-md shadow-[#36609b]/20 hover:-translate-y-0.5 transition-all rounded-xl hover:bg-[#36609b] transition-colors disabled:opacity-50">
            {isAdmin ? <><CheckCircle size={20} className="mr-2" /> Approve & Save</> : <><Save size={20} className="mr-2" /> Submit for Approval</>}
          </button>
        </div>
      </div>
      
      <div className="print:hidden flex justify-end">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-slate-700">Payment Method:</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as 'Cash Sale' | 'Credit Sale')} className="px-3 py-2 border rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#36609b]">
            <option value="Cash Sale">Cash Sale</option>
            <option value="Credit Sale">Credit Sale</option>
          </select>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200/60 print:shadow-none print:border-none print:p-0">
        <div className="mb-6 print:hidden grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Client</label>
            <select 
              value={selectedClientId} 
              onChange={(e) => { setSelectedClientId(e.target.value); setItems([]); setIsSaved(false); setCsdBranch(''); setShumisBranch(''); }}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none"
            >
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Method</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as 'Cash Sale' | 'Credit Sale')} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none">
              <option value="Cash Sale">Cash Sale</option>
              <option value="Credit Sale">Credit Sale</option>
            </select>
          </div>
          {selectedClientObj?.name === 'CSD' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">CSD Branch/Warehouse</label>
              <input 
                type="text" 
                value={csdBranch} 
                onChange={(e) => setCsdBranch(e.target.value)} 
                placeholder="e.g. Dhaka Cantt" 
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none"
              />
            </div>
          )}
          {selectedClientObj?.name === 'Shumis' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Shumis Branch (Address)</label>
              <select
                value={shumisBranch}
                onChange={(e) => setShumisBranch(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none"
              >
                <option value="" disabled>Select a branch</option>
                {shumisBranches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          )}
        </div>

        
        <div className="print:hidden mb-8 max-w-2xl">
          <GlobalProductSearch products={products} onSelect={handleAddProduct} />
        </div>
        {/* Invoice Pages */}
        <InvoiceTemplate 
          ref={printRef}
          invoiceNo={invoiceNo}
          selectedClientObj={selectedClientObj}
          items={items}
          date={new Date().toISOString()}
          csdBranch={csdBranch}
          shumisBranch={shumisBranch}
          updateItem={updateItem}
          removeItem={removeItem}
        />
      </div>

      

    </div>
  );
};