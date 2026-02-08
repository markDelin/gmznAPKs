
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.error('DATABASE_URL is not defined');
    process.exit(1);
}

const sql = postgres(dbUrl, { ssl: 'require' });

async function applySchema() {
    try {
        const schemaPath = path.resolve(process.cwd(), 'schema.sql');
        console.log('Reading schema from:', schemaPath);
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Applying schema...');
        // Split by semicolon to run statements? Or just run the whole thing?
        // postgres.js can run multiple statements if simple function usage? 
        // usually sql.file() is good but we loaded it.
        // Let's try running as one block. Note: postgres.js might treat it as a prepared statement which might fail for multi-statement.
        // Better to use sql.file or split. 
        // Actually sql(schema) should work for simple scripts if simple is allowed?
        // Let's use `sql.unsafe` or just `sql` but commonly multi-statement needs care.
        // Let's try `sql.file` which is safer if I point it to path.
        
        await sql.file(schemaPath);
        
        console.log('Schema applied successfully.');
        
        // Verify
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;
        console.log('Tables in public schema:', tables.map(t => t.table_name));

    } catch (error) {
        console.error('Error applying schema:', error);
    } finally {
        await sql.end();
    }
}

applySchema();
