export type Role = 'Admin' | 'Employee';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  password?: string;
  accessibleFeatures?: string[];
}

export interface Product {
  id: string;
  code: string;
  barcode?: string;
  description: string;
  unit: string;
  cpu: number; 
  tpCsd: number;
  tpCaptainsWorld: number;
  tpCoopers: number;
  tpShumis: number;
  tpGenius: number;
  tpOverseas: number;
  tpIferi: number;
  mrp: number; 
  stock: number;
}

export type ClientName = 'CSD' | 'Captains World' | 'Coopers' | 'GENIUS' | 'Overseas' | 'Iferi' | 'Shumis';

export interface Client {
  id: string;
  name: string;
  displayName: string;
  address: string;
  headers: string[];
  priceField: keyof Product;
  discountPercent: number;
}

export interface InvoiceItem {
  productId: string;
  quantity: number;
  remark: string;
}

export interface Invoice {
  id: string;
  title?: string;
  clientId: string;
  date: string;
  items: InvoiceItem[];
  total: number;
  discount?: number;
  status: 'Pending Approval' | 'Approved' | 'Paid' | 'Unpaid' | 'Cancelled';
  createdBy?: string;
}

export type ShipmentStatus = 'In Transit' | 'Delivered' | 'Pending' | 'Customs Clearance' | 'Delayed';

export interface Shipment {
  id: string;
  lcNumber: string;
  vendor: string;
  origin: string;
  destination: string;
  departureDate: string;
  expectedArrival: string;
  status: ShipmentStatus;
  items: { productId: string; quantity: number }[];
  notes: string;
}

export interface PayrollEntry {
  id: string;
  employeeId: string;
  month: string;
  salary: number;
  status: 'Paid' | 'Pending';
}

export interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
}

