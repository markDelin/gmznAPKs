import sql from './utils/db';

export default async (req: Request) => {
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const adminPassword = req.headers.get('x-admin-password');
  const isAdmin = adminPassword === process.env.ADMIN_PASSWORD;

  try {
    let query = sql.from('apps').select('*').order('created_at', { ascending: false });
    
    if (!isAdmin) {
        query = query.or('is_hidden.eq.false,is_hidden.is.null');
    }

    const { data: apps, error } = await query;

    if (error) throw error;

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
