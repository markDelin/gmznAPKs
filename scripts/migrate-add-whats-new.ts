import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  try {
    console.log('Adding whats_new column to apps table...');
    await sql`
      ALTER TABLE apps 
      ADD COLUMN IF NOT EXISTS whats_new TEXT;
    `;
    console.log('Column whats_new added successfully.');
  } catch (error) {
    console.error('Error running migration:', error);
  }
}

main();
