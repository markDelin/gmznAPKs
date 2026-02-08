
import { Handler } from '@netlify/functions';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL || '', { ssl: 'require' });

export const handler: Handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, x-admin-password',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

    try {
        // Lazy Migration: Ensure table exists
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

        // GET
        if (event.httpMethod === 'GET') {
            const data = await sql`SELECT * FROM public.developer_profile LIMIT 1`;
            return { statusCode: 200, headers, body: JSON.stringify(data[0] || {}) };
        }

        // POST/PUT (Update basically)
        const body = JSON.parse(event.body || '{}');

        // Check if exists
        const exists = await sql`SELECT id FROM public.developer_profile LIMIT 1`;

        if (exists.length > 0) {
            await sql`UPDATE public.developer_profile SET ${sql(body, 'name', 'bio', 'avatar_url', 'role', 'social_links')} WHERE id = ${exists[0].id}`;
        } else {
             await sql`INSERT INTO public.developer_profile ${sql(body, 'name', 'bio', 'avatar_url', 'role', 'social_links')}`;
        }

        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Profile Updated' }) };

    } catch (error) {
        console.error(error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: String(error) }) };
    }
};
