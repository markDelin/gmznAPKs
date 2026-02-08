
import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL || '', { ssl: 'require' });

async function createTable() {
  try {
    console.log('Creating developer_profile table if not exists...');
    await sql`
      CREATE TABLE IF NOT EXISTS public.developer_profile (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        bio TEXT,
        avatar_url TEXT,
        role TEXT,
        social_links JSONB DEFAULT '{}'::jsonb
      );
    `;
    console.log('Table created or already exists.');
    
    // Verify it exists now
    const result = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'developer_profile';
    `;
    console.table(result);

  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    await sql.end();
  }
}

createTable();
