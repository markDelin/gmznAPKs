
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.error('DATABASE_URL is not defined');
    process.exit(1);
}

const sql = postgres(dbUrl, { ssl: 'require' });

async function updateEpisodesTable() {
    try {
        console.log('Updating episodes table schema...');
        
        await sql`
            ALTER TABLE episodes 
            ADD COLUMN IF NOT EXISTS season_number integer default 1,
            ADD COLUMN IF NOT EXISTS intro_start integer default 0,
            ADD COLUMN IF NOT EXISTS intro_end integer default 0,
            ADD COLUMN IF NOT EXISTS outro_start integer default 0,
            ADD COLUMN IF NOT EXISTS outro_end integer default 0
        `;
        
        // Update unique constraint? 
        // Old: unique(anime_id, episode_number)
        // New: unique(anime_id, episode_number, season_number)
        // We need to drop the old constraint if we want to change it.
        // Assuming constraint name. Typically episodes_anime_id_episode_number_key or similar.
        
        // Find constraint name
        const constraints = await sql`
            SELECT conname
            FROM pg_constraint
            WHERE conrelid = 'public.episodes'::regclass
            AND contype = 'u'
        `;
        
        for (const c of constraints) {
             console.log('Found unique constraint:', c.conname);
             if (c.conname.includes('anime_id') && c.conname.includes('episode_number')) {
                 console.log('Dropping constraint:', c.conname);
                 await sql`ALTER TABLE episodes DROP CONSTRAINT ${sql(c.conname)}`;
             }
        }

        console.log('Adding new unique constraint...');
        await sql`ALTER TABLE episodes ADD UNIQUE (anime_id, episode_number, season_number)`;

        console.log('Episodes table updated successfully.');
    } catch (error) {
        console.error('Error updating episodes table:', error);
    } finally {
        await sql.end();
    }
}

updateEpisodesTable();
