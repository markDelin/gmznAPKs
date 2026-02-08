
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

async function main() {
  try {
    console.log('Creating table apps...');
    await sql`
      CREATE TABLE IF NOT EXISTS apps (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        version TEXT NOT NULL,
        size TEXT NOT NULL,
        category TEXT NOT NULL,
        download_url TEXT NOT NULL,
        icon_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Table apps created or already exists.');

    // Optional: Insert initial data if empty
    const countResult = await sql`SELECT COUNT(*) FROM apps`;
    const count = parseInt(countResult[0].count);
    
    if (count === 0) {
      console.log('Seeding initial data...');
      await sql`
        INSERT INTO apps (name, version, size, category, icon_url, download_url)
        VALUES 
        ('Spotify Premium', '8.8.4', '85 MB', 'Music', '🎵', '#'),
        ('Netflix Mod', '10.2.1', '120 MB', 'Entertainment', '🎬', '#'),
        ('Lightroom Pro', '9.0.0', '95 MB', 'Photography', '📸', '#');
      `;
      console.log('Initial data seeded.');
    } else {
      console.log('Table not empty, skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
     await sql.end();
  }
}

main();
