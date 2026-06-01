import { Handler } from '@netlify/functions';

const TMDB_TOKEN = process.env.TMDB_BEARER_TOKEN;
const TMDB_BASE = 'https://api.themoviedb.org/3';

const tmdbFetch = async (path: string) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (TMDB_TOKEN) headers['Authorization'] = `Bearer ${TMDB_TOKEN}`;
  return fetch(`${TMDB_BASE}${path}`, { headers });
};

const EMBED_PROVIDERS = [
  (id: number, s: number, e: number) => `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}`,
  (id: number, s: number, e: number) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
  (id: number, s: number, e: number) => `https://embed.su/embed/tv/${id}/${s}/${e}`,
  (id: number, s: number, e: number) => `https://vidlink.pro/tv/${id}/${s}/${e}`,
  (id: number, s: number, e: number) => `https://multiembed.mov/directstream.php?video_id=${id}&s=${s}&e=${e}`,
  (id: number, s: number, e: number) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
];

export const handler: Handler = async (event) => {
  const query = event.queryStringParameters?.q;
  const season = parseInt(event.queryStringParameters?.s || '1');
  const episode = parseInt(event.queryStringParameters?.ep || '1');
  const type = event.queryStringParameters?.type || 'tv';

  if (!query) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing query parameter q' }) };
  }

  try {
    let tmdbId: number | null = null;

    if (TMDB_TOKEN) {
      const searchRes = await tmdbFetch(
        `/search/${type}?query=${encodeURIComponent(query)}&page=1`
      );

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const result = searchData.results?.[0];
        if (result) {
          tmdbId = result.id;
        }
      }
    }

    if (!tmdbId) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Anime not found on TMDB',
          hint: 'Set TMDB_BEARER_TOKEN in .env (get one free at themoviedb.org/settings/api)',
        }),
      };
    }

    const sources = EMBED_PROVIDERS.map(fn => ({
      url: fn(tmdbId!, season, episode),
      type: 'embed' as const,
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tmdbId,
        title: query,
        season,
        episode,
        sources,
        embed_url: sources[0].url,
      }),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { statusCode: 500, body: JSON.stringify({ error: msg }) };
  }
};
