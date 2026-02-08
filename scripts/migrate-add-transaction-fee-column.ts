import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  try {
    console.log('Adding transaction_fee column to orders table...');
    await sql`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS transaction_fee DECIMAL(10, 2) DEFAULT 0
    `;
    console.log('Column transaction_fee added successfully.');
  } catch (error) {
    console.error('Error altering table:', error);
  }
}

main();
