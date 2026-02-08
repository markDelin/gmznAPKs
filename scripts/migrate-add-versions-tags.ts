import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  try {
    console.log('Adding columns to apps table...');
    await sql`ALTER TABLE apps ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'`;
    await sql`ALTER TABLE apps ADD COLUMN IF NOT EXISTS previous_versions JSONB DEFAULT '[]'`;
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

main();
