
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env from root
const __dirname = path.dirname(new URL(import.meta.url).pathname);
// Fix pathname for windows if needed, or just use process.cwd()
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const dbUrl = process.env.DATABASE_URL;
console.log('Testing connection to:', dbUrl ? dbUrl.replace(/:[^:@]*@/, ':****@') : 'undefined');

if (!dbUrl) {
    console.error('DATABASE_URL is not defined');
    process.exit(1);
}

const sql = postgres(dbUrl, { ssl: 'require' });

async function testConnection() {
    try {
        const result = await sql`SELECT 1 as result`;
        console.log('Connection successful:', result);
        
        // Check anime table
        try {
            const count = await sql`SELECT COUNT(*) FROM anime`;
            console.log('Anime count:', count[0].count);
        } catch (e) {
            console.error('Error querying anime table:', e);
        }

    } catch (error) {
        console.error('Connection failed:', error);
    } finally {
        await sql.end();
    }
}

testConnection();
