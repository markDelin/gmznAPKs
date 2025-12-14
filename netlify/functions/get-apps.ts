import { Context } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';

export default async (req: Request, context: Context) => {
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const apps = await sql`SELECT * FROM apps ORDER BY created_at DESC`;

    return new Response(JSON.stringify(apps), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching apps:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
