import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log('Checking orders schema...');
  try {
    const result = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'status';
    `;
    
    if (result.length > 0) {
        console.log('✅ status column exists.');
        // Check default value if possible or distinct values
        const distinct = await sql`SELECT DISTINCT status FROM orders`;
        console.log('Distinct statuses:', distinct);
    } else {
        console.log('❌ status column MISSING.');
    }

  } catch (error) {
    console.error('Error checking schema:', error);
  }
}

main();
