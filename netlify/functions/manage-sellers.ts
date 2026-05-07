import sql from './utils/db';

export default async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, x-admin-password', 'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS' } });
    }

    const adminPassword = req.headers.get('x-admin-password');
    if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        if (req.method === 'GET') {
            const { data: sellers, error } = await sql.from('sellers').select('id, username, created_at').order('created_at', { ascending: false });
            if (error) throw error;
            return new Response(JSON.stringify(sellers), { status: 200 });
        }

        if (req.method === 'POST') {
            const { username, passkey } = await req.json();
            if (!username || !passkey) return new Response(JSON.stringify({ error: 'Username and passkey required' }), { status: 400 });

            // Check if exists
            const { data: existing } = await sql.from('sellers').select('id').eq('username', username).maybeSingle();
            if (existing) return new Response(JSON.stringify({ error: 'Username already taken' }), { status: 400 });

            const { data: newSeller, error } = await sql
                .from('sellers')
                .insert({ username, passkey })
                .select('id, username, created_at')
                .single();
            
            if (error) throw error;
            return new Response(JSON.stringify(newSeller), { status: 201 });
        }

        if (req.method === 'DELETE') {
            const { id } = await req.json();
            if (!id) return new Response(JSON.stringify({ error: 'ID required' }), { status: 400 });
            const { error } = await sql.from('sellers').delete().eq('id', id);
            if (error) throw error;
            return new Response(JSON.stringify({ success: true }), { status: 200 });
        }

        return new Response('Method Not Allowed', { status: 405 });
    } catch (e: unknown) {
        console.error('Sellers error:', e);
        return new Response(JSON.stringify({ error: 'Server Error' }), { status: 500 });
    }
};
