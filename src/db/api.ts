import { db } from './index.ts';
import * as schema from './schema.ts';
import { eq } from 'drizzle-orm';

const getTable = (collection: string) => {
  switch (collection) {
    case 'users': return schema.users;
    case 'products': return schema.products;
    case 'clients': return schema.clients;
    case 'invoices': return schema.invoices;
    case 'returns': return schema.returns;
    case 'payroll': return schema.payroll;
    case 'ledger': return schema.ledger;
    case 'shipments': return schema.shipments;
    case 'auditLogs': return schema.auditLogs;
    default: return null;
  }
};

export async function getAll(collection: string) {
  const table = getTable(collection);
  if (!table) throw new Error("Invalid collection");
  return await db.select().from(table);
}

export async function upsertAll(collection: string, data: any[]) {
  const table = getTable(collection);
  if (!table) throw new Error("Invalid collection");
  if (!data || data.length === 0) return;
  
  // To keep it simple, we will do a transaction: delete all and insert all.
  // This is safe here because we have no strict foreign keys yet, and it perfectly mimics the NoSQL document replacement.
  await db.transaction(async (tx) => {
    await tx.delete(table);
    
    // Batch insert in chunks of 500 to avoid query size limits
    const chunkSize = 500;
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      
      // Map camelCase to snake_case for DB columns if necessary, but drizzle-orm handles this if we pass object with schema keys.
      // Wait, Drizzle requires keys to match the schema properties (e.g. `descriptionCsd` not `description_csd`).
      // So we can just pass the chunk directly if the keys match!
      await tx.insert(table).values(chunk);
    }
  });
}
