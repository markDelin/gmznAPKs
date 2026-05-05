// seller-auth.ts - For Sellers to login
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

export default async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' } });
    }

    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    try {
        const { username, passkey } = await req.json();
        if (!username || !passkey) return new Response(JSON.stringify({ error: 'Missing credentials' }), { status: 400 });

        const sellers = await sql`SELECT id, username FROM sellers WHERE username = ${username} AND passkey = ${passkey}`;
        
        if (sellers.length === 0) {
            return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
        }

        return new Response(JSON.stringify({ success: true, seller: sellers[0] }), { status: 200 });
    } catch (e: unknown) {
        console.error('Seller Auth Error:', e);
        return new Response(JSON.stringify({ error: 'Server Error' }), { status: 500 });
    }
};
