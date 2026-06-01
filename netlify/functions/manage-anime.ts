import sql from './utils/db';
import { handleOptions, corsHeaders } from './utils/cors';

export default async (req: Request) => {
  const optionsRes = handleOptions(req);
  if (optionsRes) return optionsRes;

  const adminPassword = req.headers.get('x-admin-password');

  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { id, title, description, cover_image, banner_image, genre, status, rating, total_episodes } = body;

    if (req.method === 'POST') {
      const { data, error } = await sql
        .from('anime')
        .insert({ title, description, cover_image, banner_image, genre, status, rating, total_episodes })
        .select()
        .single();
      
      if (error) throw error;
      return new Response(JSON.stringify(data), { status: 201, headers: corsHeaders });
    }

    if (req.method === 'PUT') {
      if (!id) return new Response(JSON.stringify({ error: 'ID required' }), { status: 400, headers: corsHeaders });
      const { data, error } = await sql
        .from('anime')
        .update({ title, description, cover_image, banner_image, genre, status, rating, total_episodes })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return new Response(JSON.stringify(data), { status: 200, headers: corsHeaders });
    }

    if (req.method === 'DELETE') {
      if (!id) return new Response(JSON.stringify({ error: 'ID required' }), { status: 400, headers: corsHeaders });
      const { error } = await sql.from('anime').delete().eq('id', id);
      if (error) throw error;
      return new Response(JSON.stringify({ message: 'Deleted' }), { status: 200, headers: corsHeaders });
    }

    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  } catch (error) {
    console.error('Error managing anime:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: corsHeaders });
  }
};
