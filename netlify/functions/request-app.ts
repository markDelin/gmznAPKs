import sql from './utils/db';

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { username, app_name } = await req.json();

    if (!username || !app_name) {
      return new Response(JSON.stringify({ error: 'Username and App Name are required' }), { status: 400 });
    }

    const { error } = await sql
      .from('app_requests')
      .insert({ username, app_name });

    if (error) throw error;

    return new Response(JSON.stringify({ message: 'Request submitted successfully' }), { status: 201 });
  } catch (error) {
    console.error('Error submitting request:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
