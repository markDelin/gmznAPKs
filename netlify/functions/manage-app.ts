import { Context } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';

export default async (req: Request, context: Context) => {
  const adminPassword = req.headers.get('x-admin-password');

  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const sql = neon(process.env.DATABASE_URL!);

  try {
    if (req.method === 'POST') {
      const { name, version, size, category, download_url, icon_url } = await req.json();
      await sql`
        INSERT INTO apps (name, version, size, category, download_url, icon_url)
        VALUES (${name}, ${version}, ${size}, ${category}, ${download_url}, ${icon_url})
      `;
      return new Response(JSON.stringify({ message: 'App added' }), { status: 201 });
    }

    if (req.method === 'DELETE') {
      const { id } = await req.json();
      await sql`DELETE FROM apps WHERE id = ${id}`;
      return new Response(JSON.stringify({ message: 'App deleted' }), { status: 200 });
    }
    
    // Fallback
    return new Response('Method Not Allowed', { status: 405 });

  } catch (error) {
    console.error('Error managing app:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
