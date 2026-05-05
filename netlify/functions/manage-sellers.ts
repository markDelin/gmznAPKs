// manage-sellers.ts - For Main Admin to create/list sellers
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

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
            const sellers = await sql`SELECT id, username, created_at FROM sellers ORDER BY created_at DESC`;
            return new Response(JSON.stringify(sellers), { status: 200 });
        }

        if (req.method === 'POST') {
            const { username, passkey } = await req.json();
            if (!username || !passkey) return new Response(JSON.stringify({ error: 'Username and passkey required' }), { status: 400 });

            // Check if exists
            const existing = await sql`SELECT id FROM sellers WHERE username = ${username}`;
            if (existing.length > 0) return new Response(JSON.stringify({ error: 'Username already taken' }), { status: 400 });

            const newSeller = await sql`INSERT INTO sellers (username, passkey) VALUES (${username}, ${passkey}) RETURNING id, username, created_at`;
            return new Response(JSON.stringify(newSeller[0]), { status: 201 });
        }

        if (req.method === 'DELETE') {
            const { id } = await req.json();
            if (!id) return new Response(JSON.stringify({ error: 'ID required' }), { status: 400 });
            await sql`DELETE FROM sellers WHERE id = ${id}`;
            return new Response(JSON.stringify({ success: true }), { status: 200 });
        }

        return new Response('Method Not Allowed', { status: 405 });
    } catch (e: unknown) {
        console.error('Sellers error:', e);
        return new Response(JSON.stringify({ error: 'Server Error' }), { status: 500 });
    }
};
