
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log('Migrating database for Shop Payment features...');

  try {
    // Add 'type' column to products table if it doesn't exist
    // Default to 'physical' for existing items
    await sql`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'physical';
    `;
    console.log('Added type column to products.');

    // Add 'payment_method' column to orders table if it doesn't exist
    await sql`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20);
    `;
    console.log('Added payment_method column to orders.');

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
