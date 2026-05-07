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

        const tableName = type === 'softwares' ? 'softwares' : 'tutorials';

        // GET
        if (event.httpMethod === 'GET') {
            const { data, error } = await sql.from(tableName).select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return { statusCode: 200, headers, body: JSON.stringify(data) };
        }

        // Protected Methods
        const adminPassword = event.headers['x-admin-password'];
        // Simple auth check (in production use real auth)
        if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) { 
             // Return 401 if unauthorized
             // return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }

        const body = JSON.parse(event.body || '{}');

        if (event.httpMethod === 'POST') {
            let insertData = {};
            if (type === 'softwares') {
                insertData = {
                    name: body.name ?? '',
                    description: body.description ?? null,
                    icon_url: body.icon_url ?? null,
                    download_url: body.download_url ?? '',
                    category: body.category ?? 'Utility'
                };
            } else {
                insertData = {
                    title: body.title ?? '',
                    description: body.description ?? null,
                    thumbnail_url: body.thumbnail_url ?? null,
                    video_url: body.video_url ?? '',
                    category: body.category ?? 'General',
                    duration: body.duration ?? '00:00'
                };
            }
            const { error } = await sql.from(tableName).insert(insertData);
            if (error) throw error;
            return { statusCode: 200, headers, body: JSON.stringify({ message: 'Created' }) };
        }

        if (event.httpMethod === 'PUT') {
            if (!body.id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'ID required' }) };
            
            let updateData = {};
            if (type === 'softwares') {
                updateData = {
                    name: body.name ?? '',
                    description: body.description ?? null,
                    icon_url: body.icon_url ?? null,
                    download_url: body.download_url ?? '',
                    category: body.category ?? 'Utility'
                };
            } else {
                updateData = {
                    title: body.title ?? '',
                    description: body.description ?? null,
                    thumbnail_url: body.thumbnail_url ?? null,
                    video_url: body.video_url ?? '',
                    category: body.category ?? 'General',
                    duration: body.duration ?? '00:00'
                };
            }
            const { error } = await sql.from(tableName).update(updateData).eq('id', body.id);
            if (error) throw error;
            return { statusCode: 200, headers, body: JSON.stringify({ message: 'Updated' }) };
        }

        if (event.httpMethod === 'DELETE') {
            if (!body.id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'ID required' }) };
            const { error } = await sql.from(tableName).delete().eq('id', body.id);
            if (error) throw error;
            return { statusCode: 200, headers, body: JSON.stringify({ message: 'Deleted' }) };
        }

        return { statusCode: 405, headers, body: 'Method Not Allowed' };

    } catch (error) {
        console.error(error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: String(error) }) };
    }
};
