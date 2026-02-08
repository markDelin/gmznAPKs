
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function testConnection() {
  try {
    console.log('Testing connection...');
    const version = await sql`SELECT version()`;
    console.log('Connection successful:', version[0].version);

    console.log('Checking tables...');
    const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    `;
    console.log('Tables found:', tables.map(t => t.table_name));
    
    // Check products count
    try {
        const productCount = await sql`SELECT COUNT(*) FROM products`;
        console.log('Product count:', productCount[0].count);
    } catch (e) {
        console.log('Could not query products table:', e.message);
    }

  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

testConnection();
