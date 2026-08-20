import { db } from './src/db/index.ts';
import { users } from './src/db/schema.ts';

const initialUsers = [
  { id: '1', name: 'Mohammed Tarique Ismail', username: 'MTI01', role: 'Admin', email: 'admin1@tz.com', password: 'Admin001' },
  { id: '2', name: 'Mohammed Saadat Tariq', username: 'MST02', role: 'Admin', email: 'admin2@tz.com', password: 'Admin002' },
  { id: '3', name: 'Md Masum', username: 'MMEmp01', role: 'Employee', email: 'masum@tz.com', password: 'Emp001' },
];

async function run() {
  await db.insert(users).values(initialUsers).onConflictDoNothing();
  console.log("Users seeded");
  process.exit(0);
}
run();
