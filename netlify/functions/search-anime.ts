import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  const query = event.queryStringParameters?.q;
  const type = event.queryStringParameters?.type || 'anime';
  const page = event.queryStringParameters?.page || '1';

  if (!query) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing query parameter q' }) };
  }

  try {
    const res = await fetch(`https://api.jikan.moe/v4/${type}?q=${encodeURIComponent(query)}&page=${page}&limit=15`);

    if (!res.ok) {
      const text = await res.text();
      return { statusCode: res.status, body: JSON.stringify({ error: `Jikan API error: ${text}` }) };
    }

    const data = await res.json();

    const results = (data.data || []).map((item: any) => ({
      mal_id: item.mal_id,
      title: item.title,
      title_english: item.title_english,
      synopsis: item.synopsis,
      cover_image: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
      banner_image: item.images?.webp?.large_image_url || item.trailer?.images?.maximum_image_url,
      genre: (item.genres || []).map((g: any) => g.name),
      rating: item.score || 0,
      status: item.status === 'Currently Airing' ? 'ongoing' : item.status === 'Finished Airing' ? 'completed' : 'upcoming',
      total_episodes: item.episodes || 0,
      year: item.year,
      type: item.type,
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results, total: data.pagination?.items?.total || results.length }),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { statusCode: 500, body: JSON.stringify({ error: msg }) };
  }
};
