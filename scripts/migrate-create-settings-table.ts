import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  try {
    console.log('Creating table system_settings...');
    
    // Create Table
    await sql`
      CREATE TABLE IF NOT EXISTS system_settings (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Table system_settings created.');

    // Seed Transaction Fee
    const feeKey = 'transaction_fee';
    const feeValue = '2.00'; // Default 2 pesos

    const existing = await sql`SELECT key FROM system_settings WHERE key = ${feeKey}`;
    
    if (existing.length === 0) {
        await sql`
            INSERT INTO system_settings (key, value, description)
            VALUES (${feeKey}, ${feeValue}, 'Extra fee added to each order')
        `;
        console.log(`Seeded ${feeKey} with value ${feeValue}`);
    } else {
        console.log(`${feeKey} already exists.`);
    }

  } catch (error) {
    console.error('Error in migration:', error);
  }
}

main();
