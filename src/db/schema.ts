import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, doublePrecision, boolean, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  uid: text('uid').unique(), // Firebase Auth UID
  name: text('name').notNull(),
  username: text('username'),
  role: text('role').notNull(),
  email: text('email').notNull(),
  password: text('password'), // Optional, they may not use this anymore
  accessibleFeatures: jsonb('accessible_features').$type<string[]>(),
  photoUrl: text('photo_url'),
  idNumber: text('id_number'),
  phoneNumber: text('phone_number'),
  bloodGroup: text('blood_group'),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  barcode: text('barcode'),
  description: text('description').notNull(),
  descriptionCsd: text('description_csd'),
  unit: text('unit').notNull(),
  cpu: doublePrecision('cpu').notNull(),
  tpCsd: doublePrecision('tp_csd').notNull(),
  tpCaptainsWorld: doublePrecision('tp_captains_world').notNull(),
  tpCoopers: doublePrecision('tp_coopers').notNull(),
  tpShumis: doublePrecision('tp_shumis').notNull(),
  tpGenius: doublePrecision('tp_genius').notNull(),
  tpOverseas: doublePrecision('tp_overseas').notNull(),
  tpIferi: doublePrecision('tp_iferi').notNull(),
  mrp: doublePrecision('mrp').notNull(),
  stock: integer('stock').notNull(),
  cp: doublePrecision('cp').notNull(),
  productType: text('product_type'), // 'Local' | 'Imported'
  createdAt: timestamp('created_at').defaultNow(),
});

export const clients = pgTable('clients', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  displayName: text('display_name').notNull(),
  address: text('address').notNull(),
  headers: jsonb('headers').$type<string[]>(),
  priceField: text('price_field').notNull(),
  discountPercent: doublePrecision('discount_percent').notNull(),
});

export const invoices = pgTable('invoices', {
  id: text('id').primaryKey(),
  title: text('title'),
  clientId: text('client_id').notNull(),
  date: text('date').notNull(),
  items: jsonb('items').$type<any[]>(), // Array of InvoiceItem
  total: doublePrecision('total').notNull(),
  discount: doublePrecision('discount'),
  paymentMethod: text('payment_method'), // 'Cash Sale' | 'Credit Sale'
  status: text('status').notNull(), // 'Pending Approval' | 'Approved' | 'Paid' | 'Unpaid' | 'Cancelled'
  createdBy: text('created_by'),
  csdBranch: text('csd_branch'),
  shumisBranch: text('shumis_branch'),
  deliveryStatus: text('delivery_status'),
  deliveryDate: text('delivery_date'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const shipments = pgTable('shipments', {
  id: text('id').primaryKey(),
  lcNumber: text('lc_number').notNull(),
  vendor: text('vendor').notNull(),
  origin: text('origin').notNull(),
  destination: text('destination').notNull(),
  departureDate: text('departure_date').notNull(),
  expectedArrival: text('expected_arrival').notNull(),
  status: text('status').notNull(),
  items: jsonb('items').$type<any[]>(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const payroll = pgTable('payroll', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id').notNull(),
  month: text('month').notNull(),
  salary: doublePrecision('salary').notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const ledger = pgTable('ledger', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  description: text('description').notNull(),
  debit: doublePrecision('debit').notNull(),
  credit: doublePrecision('credit').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const returns = pgTable('returns', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  clientId: text('client_id').notNull(),
  items: jsonb('items').$type<any[]>(),
  totalValue: doublePrecision('total_value').notNull(),
  status: text('status').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  timestamp: text('timestamp').notNull(),
  userName: text('user_name').notNull(),
  userRole: text('user_role').notNull(),
  action: text('action').notNull(),
  module: text('module').notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
