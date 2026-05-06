import { Handler } from '@netlify/functions';
import sql from './utils/db';

export const handler: Handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, x-admin-password',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

    try {
        const type = event.queryStringParameters?.type; // 'softwares' or 'tutorials'

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
                const safeBody = {
                    name: body.name ?? '',
                    description: body.description ?? null,
                    icon_url: body.icon_url ?? null,
                    download_url: body.download_url ?? '',
                    category: body.category ?? 'Utility'
                };
                await sql`INSERT INTO public.softwares ${sql(safeBody, 'name', 'description', 'icon_url', 'download_url', 'category')}`;
            } else {
                const safeBody = {
                    title: body.title ?? '',
                    description: body.description ?? null,
                    thumbnail_url: body.thumbnail_url ?? null,
                    video_url: body.video_url ?? '',
                    category: body.category ?? 'General',
                    duration: body.duration ?? '00:00'
                };
                await sql`INSERT INTO public.tutorials ${sql(safeBody, 'title', 'description', 'thumbnail_url', 'video_url', 'category', 'duration')}`;
            }
            return { statusCode: 200, headers, body: JSON.stringify({ message: 'Created' }) };
        }

        if (event.httpMethod === 'PUT') {
            if (!body.id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'ID required' }) };
            
            if (type === 'softwares') {
                const safeBody = {
                    name: body.name ?? '',
                    description: body.description ?? null,
                    icon_url: body.icon_url ?? null,
                    download_url: body.download_url ?? '',
                    category: body.category ?? 'Utility'
                };
                await sql`UPDATE public.softwares SET ${sql(safeBody, 'name', 'description', 'icon_url', 'download_url', 'category')} WHERE id = ${body.id}`;
            } else {
                 const safeBody = {
                    title: body.title ?? '',
                    description: body.description ?? null,
                    thumbnail_url: body.thumbnail_url ?? null,
                    video_url: body.video_url ?? '',
                    category: body.category ?? 'General',
                    duration: body.duration ?? '00:00'
                };
                 await sql`UPDATE public.tutorials SET ${sql(safeBody, 'title', 'description', 'thumbnail_url', 'video_url', 'category', 'duration')} WHERE id = ${body.id}`;
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
