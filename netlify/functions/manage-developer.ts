import { Handler } from '@netlify/functions';
import sql from './utils/db';

export const handler: Handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, x-admin-password',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

    try {
        // GET
        if (event.httpMethod === 'GET') {
            const { data, error } = await sql.from('developer_profile').select('*').limit(1).maybeSingle();
            if (error) {
                // Return an empty object gracefully if error (e.g. table not found)
                return { statusCode: 200, headers, body: JSON.stringify({}) };
            }
            return { statusCode: 200, headers, body: JSON.stringify(data || {}) };
        }

        // POST/PUT (Update basically)
        const body = JSON.parse(event.body || '{}');
        const { name, bio, avatar_url, role, social_links } = body;
        
        // Upsert approach: since we only have one profile, we can use a fixed ID if we want, 
        // or just update the first one found.
        const { data: existing } = await sql.from('developer_profile').select('id').limit(1).maybeSingle();

        if (existing) {
            const { error } = await sql
                .from('developer_profile')
                .update({ name, bio, avatar_url, role, social_links })
                .eq('id', existing.id);
            if (error) throw error;
        } else {
             const { error } = await sql
                .from('developer_profile')
                .insert({ name, bio, avatar_url, role, social_links });
             if (error) throw error;
        }

        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Profile Updated' }) };

    } catch (error) {
        console.error(error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: String(error) }) };
    }
};
