import { Handler } from '@netlify/functions';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL || '', { ssl: 'require' });

export const handler: Handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, headers, body: 'Method Not Allowed' };
    }

    try {
        // Fetch distinct unit models that are not empty, limiting to recent 50 for performance
        const data = await sql`
            SELECT DISTINCT unit_model 
            FROM public.repair_requests 
            WHERE unit_model != '' 
            ORDER BY unit_model ASC
            LIMIT 50
        `;
        
        // Extract just the strings
        const models = data.map(row => row.unit_model);

        return { 
            statusCode: 200, 
            headers, 
            body: JSON.stringify(models) 
        };
    } catch (error) {
        console.error('get-recent-models logic failed:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: String(error) }) };
    }
};
