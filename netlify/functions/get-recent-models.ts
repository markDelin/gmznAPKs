import { Handler } from '@netlify/functions';
import sql from './utils/db';

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
        const { data, error } = await sql
            .from('repair_requests')
            .select('unit_model')
            .neq('unit_model', '')
            .order('unit_model', { ascending: true })
            .limit(100); // Fetch more to account for duplicates

        if (error) throw error;
        
        // Extract just the unique strings
        const models = Array.from(new Set(data.map((row: any) => row.unit_model))).slice(0, 50);

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
