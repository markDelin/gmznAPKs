import postgres from 'postgres';

export default async (req: Request) => {
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

  const adminPassword = req.headers.get('x-admin-password');
  const isAdmin = adminPassword === process.env.ADMIN_PASSWORD;

  try {
    let apps;
    if (isAdmin) {
        apps = await sql`SELECT * FROM apps ORDER BY created_at DESC`;
    } else {
        apps = await sql`SELECT * FROM apps WHERE is_hidden = FALSE OR is_hidden IS NULL ORDER BY created_at DESC`;
    }

    return new Response(JSON.stringify(apps), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching apps:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    await sql.end();
  }
};
