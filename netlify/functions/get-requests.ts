import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

export default async (req: Request) => {
  const adminPassword = req.headers.get('x-admin-password');

  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const requests = await sql`SELECT * FROM app_requests ORDER BY created_at DESC`;
    return new Response(JSON.stringify(requests), { status: 200 });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
