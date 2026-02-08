import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  try {
    console.log('Creating table app_requests...');
    await sql`
      CREATE TABLE IF NOT EXISTS app_requests (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL,
        app_name TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Table app_requests created.');
  } catch (error) {
    console.error('Error creating table:', error);
  }
}

main();
