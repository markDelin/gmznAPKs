
import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

async function migrate() {
  try {
    console.log('Adding season_number column to episodes table...');
    await sql`
      ALTER TABLE episodes 
      ADD COLUMN IF NOT EXISTS season_number INTEGER DEFAULT 1;
    `;
    console.log('Migration successful!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sql.end();
  }
}

migrate();
