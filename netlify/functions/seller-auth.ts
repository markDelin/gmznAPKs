import sql from './utils/db';

export default async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' } });
    }

    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    try {
        const { username, passkey } = await req.json();
        if (!username || !passkey) return new Response(JSON.stringify({ error: 'Missing credentials' }), { status: 400 });

        const { data: seller, error } = await sql
            .from('sellers')
            .select('id, username')
            .eq('username', username)
            .eq('passkey', passkey)
            .maybeSingle();
        
        if (error || !seller) {
            return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
        }

        return new Response(JSON.stringify({ success: true, seller }), { status: 200 });
    } catch (e: unknown) {
        console.error('Seller Auth Error:', e);
        return new Response(JSON.stringify({ error: 'Server Error' }), { status: 500 });
    }
};
