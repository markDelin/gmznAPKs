import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

export default async (req: Request) => {
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const url = new URL(req.url);
  const animeId = url.searchParams.get('anime_id');

  if (!animeId) {
    return new Response('Anime ID is required', { status: 400 });
  }

  try {
    const episodes = await sql`
      SELECT * FROM episodes
      WHERE anime_id = ${animeId}
      ORDER BY episode_number ASC
    `;

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
