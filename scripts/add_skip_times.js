
import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

async function migrate() {
  try {
    console.log('Adding skip timing columns to episodes table...');
    await sql`
      ALTER TABLE episodes 
      ADD COLUMN IF NOT EXISTS intro_start INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS intro_end INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS outro_start INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS outro_end INTEGER DEFAULT 0;
    `;
    console.log('Migration successful!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sql.end();
  }
}

migrate();
