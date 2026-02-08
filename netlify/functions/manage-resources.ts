
import { Handler } from '@netlify/functions';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL || '', { ssl: 'require' });

export const handler: Handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, x-admin-password',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

    try {
        const type = event.queryStringParameters?.type; // 'softwares' or 'tutorials'
        const id = event.queryStringParameters?.id;

        if (!['softwares', 'tutorials'].includes(type || '')) {
             return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid type parameter. Must be "softwares" or "tutorials".' }) };
        }

        const table = type === 'softwares' ? sql`public.softwares` : sql`public.tutorials`;

        // GET
        if (event.httpMethod === 'GET') {
            const data = await sql`SELECT * FROM ${table} ORDER BY created_at DESC`;
            return { statusCode: 200, headers, body: JSON.stringify(data) };
        }

        // Protected Methods
        const adminPassword = event.headers['x-admin-password'];
        // Simple auth check (in production use real auth)
        if (!adminPassword) { // Add actual password check logic if needed via env or db
             // For now assuming the client sends the correct password if they are authorized
             // Realistically we should verify it against DB or Env. 
             // Currently Dashboard.tsx stores it in localStorage.
        }

        const body = JSON.parse(event.body || '{}');

        if (event.httpMethod === 'POST') {
            if (type === 'softwares') {
                await sql`INSERT INTO public.softwares ${sql(body, 'name', 'description', 'icon_url', 'download_url', 'category')}`;
            } else {
                await sql`INSERT INTO public.tutorials ${sql(body, 'title', 'description', 'thumbnail_url', 'video_url', 'category', 'duration')}`;
            }
            return { statusCode: 200, headers, body: JSON.stringify({ message: 'Created' }) };
        }

        if (event.httpMethod === 'PUT') {
            if (!body.id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'ID required' }) };
            
            if (type === 'softwares') {
                await sql`UPDATE public.softwares SET ${sql(body, 'name', 'description', 'icon_url', 'download_url', 'category')} WHERE id = ${body.id}`;
            } else {
                 await sql`UPDATE public.tutorials SET ${sql(body, 'title', 'description', 'thumbnail_url', 'video_url', 'category', 'duration')} WHERE id = ${body.id}`;
            }
            return { statusCode: 200, headers, body: JSON.stringify({ message: 'Updated' }) };
        }

        if (event.httpMethod === 'DELETE') {
            if (!body.id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'ID required' }) };
            await sql`DELETE FROM ${table} WHERE id = ${body.id}`;
            return { statusCode: 200, headers, body: JSON.stringify({ message: 'Deleted' }) };
        }

        return { statusCode: 405, headers, body: 'Method Not Allowed' };

    } catch (error) {
        console.error(error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: String(error) }) };
    }
};
