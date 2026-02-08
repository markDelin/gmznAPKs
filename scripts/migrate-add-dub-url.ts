
import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config(); 

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

async function migrate() {
  console.log('Starting migration...');
  try {
    await sql`
      ALTER TABLE episodes 
      ADD COLUMN IF NOT EXISTS video_url_dub TEXT;
    `;
    console.log('Migration successful: video_url_dub column added.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sql.end();
  }
}

migrate();
