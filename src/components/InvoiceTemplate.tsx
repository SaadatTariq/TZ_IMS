import React, { forwardRef } from 'react';
import { Client, InvoiceItem, Product } from '../types';
import { numberToWords } from '../utils';

interface InvoiceTemplateProps {
  invoiceNo: string;
  selectedClientObj: Client;
  items: (InvoiceItem & { product: Product })[];
  date: string; // ISO string or formatted string
}

export const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(({
  invoiceNo, selectedClientObj, items, date
}, ref) => {
  const getUnitPrice = (p: Product) => {
    if (!selectedClientObj) return p.cpu;
    const field = selectedClientObj.priceField;
    return (p[field] as number) || p.cpu;
  };

  const calculateItemPrice = (item: InvoiceItem & { product: Product }) => {
    return getUnitPrice(item.product) * item.quantity;
  };

  const calculateSubTotal = () => {
    return items.reduce((sum, item) => sum + calculateItemPrice(item), 0);
  };

  const calculateTotal = () => {
    let total = calculateSubTotal();
    if (selectedClientObj?.discountPercent) {
      total = total * (1 - (selectedClientObj.discountPercent / 100));
    }
    return total;
  };

  const renderCell = (header: string, item: InvoiceItem & { product: Product }, sl: number, arrLength: number, i: number) => {
    const h = header.toLowerCase();
    const p = item.product;
    const isLast = i === arrLength - 1;
    let content: React.ReactNode = '-';

    if (h.includes('s.l') || h.includes('sl')) content = sl;
    else if (h.includes('code')) content = selectedClientObj?.name === 'CSD' ? (p.barcode || p.code) : p.code;
    else if (h.includes('desc')) content = selectedClientObj?.name === 'CSD' ? (p.descriptionCsd || p.description) : p.description;
    else if (h.includes('unit')) content = p.unit;
    else if (h.includes('quant') || h === 'qty') content = item.quantity;
    else if (h.includes('remark') || h.includes('remarks')) content = item.remark;
    else if (h === 'cpu') content = p.cpu;
    else if (h === 'mrp') content = p.mrp;
    else if (h.includes('total')) content = (getUnitPrice(p) * item.quantity).toFixed(2);
    else if (h.includes('tp')) {
      if (selectedClientObj.name === 'Captains World') {
        content = (p.cpu * 0.74).toFixed(2);
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

  const chunkedItems = [];
  for (let i = 0; i < items.length; i += 20) {
    chunkedItems.push(items.slice(i, i + 20));
  }
  if (chunkedItems.length === 0) chunkedItems.push([]);

  const formattedDate = new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();

  return (
    <div id="invoice-print-area" ref={ref} className="bg-white p-4">
      {chunkedItems.map((pageItems, pageIndex) => {
        const isLastPage = pageIndex === chunkedItems.length - 1;
        const globalStartIndex = pageIndex * 20;
        return (
          <div key={pageIndex} className="font-sans text-black print:page-break-after">
            <h1 className="text-xl font-bold text-center mb-6 mt-8 print:mt-16">Invoice</h1>
            
            <div className="flex justify-between mb-4">
              <div>
                <div className="flex items-center mb-1">
                  <span className="font-semibold mr-2">Company Name:</span> 
                  <span>{selectedClientObj?.displayName || selectedClientObj?.name}</span>
                </div>
                {selectedClientObj?.name !== 'CSD' && (
                  <div className="flex items-center mb-1">
                    <span className="font-semibold mr-2">Address:</span> 
                    <span>{selectedClientObj?.address}</span>
                  </div>
                )}
                <div className="flex items-center mt-1">
                  <span className="font-semibold mr-2">Invoice No:</span> 
                  <span>{invoiceNo}</span>
                </div>
              </div>
              <div className="text-right">
                <p><span className="font-semibold">Date:</span> {formattedDate}</p>
              </div>
            </div>

            <div className="overflow-x-auto mb-4">
              <table className="w-full text-left border-collapse border border-gray-400">
                <thead>
                  <tr className="border-b border-gray-400 text-sm">
                    {selectedClientObj?.headers.map((h, i, arr) => (
                      <th key={h} className={`p-2 text-center ${i < arr.length - 1 ? 'border-r border-gray-400' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {pageItems.map((item, localIndex) => (
                    <tr key={localIndex} className="border-b border-gray-400">
                      {selectedClientObj?.headers.map((h, i, arr) => 
                        renderCell(h, item, globalStartIndex + localIndex + 1, arr.length, i)
                      )}
                    </tr>
                  ))}
                  
                  {isLastPage && (
                    <>
                      {selectedClientObj?.discountPercent > 0 ? (
                        <>
                          <tr className="border-b border-gray-400">
                            <td colSpan={selectedClientObj.headers.length - 2} className="p-2 border-r border-gray-400 text-right pr-4">Sub Total</td>
                            <td className="p-2 border-r border-gray-400 text-center">{calculateSubTotal().toFixed(2)}</td>
                            <td className="p-2"></td>
                          </tr>
                          <tr className="border-b border-gray-400">
                            <td colSpan={selectedClientObj.headers.length - 2} className="p-2 border-r border-gray-400 text-right pr-4">DISCOUNT {selectedClientObj.discountPercent}%</td>
                            <td className="p-2 border-r border-gray-400 text-center">{(calculateSubTotal() * (selectedClientObj.discountPercent / 100)).toFixed(2)}</td>
                            <td className="p-2"></td>
                          </tr>
                        </>
                      ) : null}
                      <tr className="border-b border-gray-400 font-bold">
                        <td colSpan={selectedClientObj?.headers.length - 2} className="p-2 border-r border-gray-400 text-right pr-4">Total</td>
                        <td className="p-2 border-r border-gray-400 text-center">{calculateTotal().toFixed(2)}</td>
                        <td className="p-2"></td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
            
            {isLastPage && (
              <>
                <div className="mb-16">
                  <p className="text-sm">Amount In Word: {numberToWords(calculateTotal())}</p>
                </div>

                <div className="flex justify-between items-end mt-20">
                  <div className="border-t border-black w-48 text-center pt-2">
                    <p className="text-sm">Received By</p>
                  </div>
                  <div className="text-center w-64 flex flex-col items-center">
                    <p className="text-sm mb-12">Authorized Signature</p>
                    <div className="border-t border-black w-48 text-center pt-2">
                      <p className="text-sm">T & Z DISTRIBUTION</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
});
