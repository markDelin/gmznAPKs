import { Context } from "@netlify/functions";
import sql from './utils/db';

export default async (req: Request, context: Context) => {
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  try {
    if (id) {
      const { data: anime, error } = await sql.from('anime').select('*').eq('id', id).single();
      if (error || !anime) {
        return new Response(JSON.stringify({ error: 'Anime not found' }), { status: 404 });
      }
      return new Response(JSON.stringify(anime), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: animeList, error } = await sql.from('anime').select('*').order('created_at', { ascending: false });
    if (error) throw error;

    return new Response(JSON.stringify(animeList), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching anime:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
