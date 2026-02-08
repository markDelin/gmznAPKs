import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log('Migrating: Adding phone_number to orders...');
  try {
    await sql`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);
    `;
    console.log('Success: Added phone_number column.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

main();
