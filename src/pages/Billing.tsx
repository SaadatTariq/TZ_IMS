// ... existing imports
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { Invoice, InvoiceItem, Product, Client } from '../types';
import { Plus, Trash2, Printer, Save, CheckCircle, Search, Download, Share2 } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';
import { useReactToPrint } from 'react-to-print';
import { numberToWords } from '../utils';
import { InvoiceTemplate } from '../components/InvoiceTemplate';

// Helper component for Product Search
const ProductSearch: React.FC<{
  products: Product[];
  selectedProduct: Product;
  onSelect: (p: Product) => void;
}> = ({ products, selectedProduct, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = products.filter(p => 
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) || (p.barcode || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full pl-8 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#4097d0]"
          placeholder="Search by Code (e.g. 1235)"
          value={isOpen ? searchTerm : selectedProduct?.code || ''}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <Search className="absolute left-2 top-2.5 text-gray-400" size={16} />
      </div>
      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(p => (
              <li
                key={p.id}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm flex justify-between"
                onClick={() => {
                  onSelect(p);
                  setSearchTerm('');
                  setIsOpen(false);
                }}
              >
                <span className="font-medium">{p.code}</span>
                <span className="text-gray-500 truncate ml-2 text-xs">{p.description} (Stock: {p.stock})</span>
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-gray-500">No products found.</li>
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
  const printRef = useRef<HTMLDivElement>(null);
  const [invoiceNo, setInvoiceNo] = useState('');
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice_${invoiceNo || "Draft"}`, 
  });
  const [paymentMethod, setPaymentMethod] = useState<'Cash Sale' | 'Credit Sale'>('Cash Sale');
  const [csdBranch, setCsdBranch] = useState('');
  
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

  const addItem = () => {
    if (products.length > 0) {
      setItems([...items, { productId: products[0].id, quantity: 1, remark: '', product: products[0] }]);
      setIsSaved(false);
    }
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
    if (items.length === 0) return alert('Add items to generate invoice.');
    
    const total = calculateTotal();
    const status = isAdmin ? 'Approved' : 'Pending Approval';
    const dateFormatted = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const invoiceTitle = selectedClientObj.name === 'CSD' 
      ? `CSD ${csdBranch || '___________________'} invoice dated ${dateFormatted}`
      : `${selectedClientObj.name} Invoice Dated ${dateFormatted}`;

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
      csdBranch: selectedClientObj.name === 'CSD' ? csdBranch : undefined
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

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      const element = document.getElementById("invoice-print-area");
      if (!element) {
        alert("Print area not found");
        return null;
      }
      const data = await htmlToImage.toPng(element, { pixelRatio: 2 });
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const img = new Image();
      img.src = data;
      await new Promise((resolve) => { img.onload = resolve; });
      const pdfHeight = (img.height * pdfWidth) / img.width;
      pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
      setIsGenerating(false);
      return pdf;
    } catch (e: any) {
      console.error("PDF Generation error:", e);
      alert("Failed to generate PDF: " + e.message);
      setIsGenerating(false);
      return null;
    }
  };

  const handleDownload = async () => {
    const pdf = await generatePDF();
    if (pdf) {
      const fileName = selectedClientObj.name === 'CSD' ? `CSD ${csdBranch || '___________________'} invoice dated ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.pdf` : `Invoice_${invoiceNo || Date.now().toString()}.pdf`;
      pdf.save(fileName);
    }
  };

  const handleShare = async () => {
    const pdf = await generatePDF();
    if (!pdf) return;
    try {
      const blob = pdf.output("blob");
      const fileName = selectedClientObj.name === 'CSD' ? `CSD ${csdBranch || '___________________'} invoice dated ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.pdf` : `Invoice_${invoiceNo || Date.now().toString()}.pdf`;
      const file = new File([blob], fileName, { type: "application/pdf" });
      if (navigator.share) {
        await navigator.share({ title: "Invoice", files: [file] });
      } else {
        alert("Sharing is not supported on this device/browser. Downloading instead.");
        handleDownload();
      }
    } catch (err: any) {
      console.error("Error sharing:", err);
      if (err.name !== "AbortError") {
        alert("Failed to share: " + err.message);
      }
    }
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
      <div className="print:hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Invoicing</h1>
        <div className="flex space-x-3">
          <button type="button" onClick={handlePrint} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Printer size={20} className="mr-2" /> Print
          </button>
          {isSaved && (
            <>
              <button type="button" onClick={handleDownload} disabled={isGenerating} className="flex items-center px-4 py-2 bg-blue-100 text-[#4097d0] rounded-lg hover:bg-blue-200 transition-colors">
                {isGenerating ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2" /> : <Download size={20} className="mr-2" />}
                {isGenerating ? "Generating..." : "Download PDF"}
              </button>
              <button type="button" onClick={handleShare} disabled={isGenerating} className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
                {isGenerating ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2" /> : <Share2 size={20} className="mr-2" />}
                {isGenerating ? "Processing..." : "Share"}
              </button>
            </>
          )}
          <button type="button" onClick={saveInvoice} disabled={isSaved || items.length === 0} className="flex items-center px-4 py-2 bg-[#4097d0] text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50">
            {isAdmin ? <><CheckCircle size={20} className="mr-2" /> Approve & Save</> : <><Save size={20} className="mr-2" /> Submit for Approval</>}
          </button>
        </div>
      </div>
      
      <div className="print:hidden flex justify-end">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Payment Method:</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as 'Cash Sale' | 'Credit Sale')} className="px-3 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4097d0]">
            <option value="Cash Sale">Cash Sale</option>
            <option value="Credit Sale">Credit Sale</option>
          </select>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0">
        <div className="mb-6 print:hidden flex items-end space-x-4">
          <div className="flex-1 sm:flex-none sm:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Client</label>
            <select 
              value={selectedClientId} 
              onChange={(e) => { setSelectedClientId(e.target.value); setItems([]); setIsSaved(false); setCsdBranch(''); }}
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4097d0]"
            >
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {selectedClientObj?.name === 'CSD' && (
            <div className="flex-1 sm:flex-none sm:w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-2">CSD Branch/Warehouse</label>
              <input 
                type="text" 
                value={csdBranch} 
                onChange={(e) => setCsdBranch(e.target.value)} 
                placeholder="e.g. Dhaka Cantt" 
                className="w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#4097d0]"
              />
            </div>
          )}
        </div>

        {/* Invoice Pages */}
        <InvoiceTemplate 
          ref={printRef}
          invoiceNo={invoiceNo}
          selectedClientObj={selectedClientObj}
          items={items}
          date={new Date().toISOString()}
          csdBranch={csdBranch}
        />

        <div className="print:hidden mt-8">
          <button type="button" onClick={addItem} className="flex items-center text-sm text-[#4097d0] hover:text-blue-700 font-medium">
            <Plus size={16} className="mr-1" /> Add Product Line
          </button>
        </div>
      </div>

      {/* Editor Section (Hidden in print) */}
      <div className="print:hidden bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-4 text-gray-900">Edit Line Items</h3>
        {items.length === 0 ? (
          <p className="text-gray-500 text-sm">No items added to invoice.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex flex-wrap gap-4 items-start bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex-1 min-w-[250px]">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Product</label>
                  <ProductSearch 
                    products={products} 
                    selectedProduct={item.product} 
                    onSelect={(p) => updateItem(index, 'productId', p.id)} 
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Quantity</label>
                  <input 
                    type="number" 
                    min="1"
                    max={item.product.stock}
                    value={item.quantity}
                    onChange={(e) => {
                      let val = parseInt(e.target.value) || 1;
                      if (val > item.product.stock) val = item.product.stock;
                      updateItem(index, 'quantity', val);
                    }}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                  <div className="text-[10px] text-gray-500 mt-1">Max: {item.product.stock}</div>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Remark</label>
                  <input 
                    type="text" 
                    value={item.remark}
                    onChange={(e) => updateItem(index, 'remark', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    placeholder="Optional remark..."
                  />
                </div>
                <div className="pt-5">
                  <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove item">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};