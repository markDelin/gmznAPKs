import sql from './utils/db';

export default async (req: Request) => {
  const adminPassword = req.headers.get('x-admin-password');

  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { data: requests, error } = await sql.from('app_requests').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return new Response(JSON.stringify(requests), { status: 200 });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
