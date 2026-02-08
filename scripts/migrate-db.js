
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('DATABASE_URL is missing in .env');
    process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: 'require' });

async function migrate() {
    try {
        console.log('Connecting to Database...');
        
        console.log('Reading schema.sql...');
        const schemaPath = path.join(__dirname, '../schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Applying schema...');
        // Execute the entire schema file. using unsafe because it contains multiple statements
        await sql.unsafe(schemaSql);
        
        console.log('Schema applied successfully!');
        
        const count = await sql`SELECT count(*) from anime`;
        if (Number(count[0].count) === 0) {
           console.log('Seeding initial Anime data...');
           
           await sql`
             INSERT INTO anime (title, description, cover_image, genre, status, rating, total_episodes) 
             VALUES 
             ('Solo Leveling', 'Ten years ago, the "Gate" appeared and connected the real world with the realm of magic and monsters.', 'https://m.media-amazon.com/images/M/MV5BMmMzZjdkODUtNjczZC00OTg4LTk3YjQtYjZkODE1ZWIxYjYxXkEyXkFqcGc@._V1_.jpg', ARRAY['Action', 'Fantasy'], 'ongoing', 9.8, 12),
             ('One Piece', 'Monkey D. Luffy refuses to let anyone or anything stand in the way of his quest to become the king of all pirates.', 'https://m.media-amazon.com/images/M/MV5BMTNjNGU4NTItYzc0ZS00NzNhLWE0OTcsN2I3YzcxYWZhMTJiXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg', ARRAY['Adventure', 'Action'], 'ongoing', 9.5, 1000),
             ('Frieren: Beyond Journey''s End', 'The adventure is over but life goes on for an elf mage just beginning to learn what living is all about.', 'https://m.media-amazon.com/images/M/MV5BMjA3Y2YyTEtYjY1ZS00ZTM2LTk0MzEtYjE2ZjY2YmE4ZDE4XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg', ARRAY['Fantasy', 'Adventure'], 'ongoing', 9.9, 28)
           `;
           
           // Seed episodes for Solo Leveling
           const anime = await sql`SELECT id FROM anime WHERE title = 'Solo Leveling' LIMIT 1`;
           if (anime.length > 0) {
               const animeId = anime[0].id;
               await sql`
                INSERT INTO episodes (anime_id, episode_number, title, video_url, duration)
                VALUES 
                (${animeId}, 1, 'I''m Used to It', 'https://example.com/video1.mp4', 1400),
                (${animeId}, 2, 'If I Had One More Chance', 'https://example.com/video2.mp4', 1400)
               `;
           }

           console.log('Seeding done.');
        }

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await sql.end();
    }
}

migrate();
