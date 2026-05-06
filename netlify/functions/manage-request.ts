import sql from './utils/db';

export default async (req: Request) => {
  const adminPassword = req.headers.get('x-admin-password');

  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { id, action } = await req.json(); // action: 'delete', 'complete'

    if (action === 'delete') {
      await sql`DELETE FROM app_requests WHERE id = ${id}`;
      return new Response(JSON.stringify({ message: 'Request deleted' }), { status: 200 });
    }

    if (action === 'complete') {
        await sql`UPDATE app_requests SET status = 'completed' WHERE id = ${id}`;
        return new Response(JSON.stringify({ message: 'Request marked as completed' }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });

  } catch (error) {
    console.error('Error managing request:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
