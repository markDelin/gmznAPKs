import { Context } from "@netlify/functions";
import sql from './utils/db';

export default async (req: Request, context: Context) => {
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const url = new URL(req.url);
  const animeId = url.searchParams.get('anime_id');

  if (!animeId) {
    return new Response('Anime ID is required', { status: 400 });
  }

  try {
    const { data: episodes, error } = await sql
      .from('episodes')
      .select('*')
      .eq('anime_id', animeId)
      .order('season_number', { ascending: true })
      .order('episode_number', { ascending: true });

    if (error) throw error;

    return new Response(JSON.stringify(episodes), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching episodes:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
