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
      const idNum = parseInt(id);
      const anime = await sql`SELECT * FROM anime WHERE id = ${idNum}`;
      if (anime.length === 0) {
        return new Response(JSON.stringify({ error: 'Anime not found' }), { status: 404 });
      }
      return new Response(JSON.stringify(anime[0]), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const animeList = await sql`SELECT * FROM anime ORDER BY created_at DESC`;
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
