import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  try {
    console.log('Adding quantity column to orders table...');
    await sql`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
    `;
    console.log('Column quantity added to orders table.');
  } catch (error) {
    console.error('Error altering table:', error);
  }
}

main();
