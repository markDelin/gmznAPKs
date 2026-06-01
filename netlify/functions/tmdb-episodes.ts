import { Handler } from '@netlify/functions';

const TMDB_TOKEN = process.env.TMDB_BEARER_TOKEN;
const TMDB_BASE = 'https://api.themoviedb.org/3';

const tmdbFetch = async (path: string) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (TMDB_TOKEN) headers['Authorization'] = `Bearer ${TMDB_TOKEN}`;
  return fetch(`${TMDB_BASE}${path}`, { headers });
};

export const handler: Handler = async (event) => {
  const query = event.queryStringParameters?.q;
  const tmdbId = event.queryStringParameters?.tmdb_id;

  if (!query && !tmdbId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing query or tmdb_id' }) };
  }

  try {
    let id = tmdbId;

    if (!id) {
      const searchRes = await tmdbFetch(`/search/tv?query=${encodeURIComponent(query!)}&page=1`);
      if (!searchRes.ok) {
        return { statusCode: searchRes.status, body: JSON.stringify({ error: 'TMDB search failed' }) };
      }
      const searchData = await searchRes.json();
      const result = searchData.results?.[0];
      if (!result) {
        return { statusCode: 404, body: JSON.stringify({ error: 'No results found on TMDB' }) };
      }
      id = String(result.id);
    }

    const [showRes, seasonsRes] = await Promise.all([
      tmdbFetch(`/tv/${id}`),
      tmdbFetch(`/tv/${id}/season/1`),
    ]);

    if (!showRes.ok) {
      return { statusCode: showRes.status, body: JSON.stringify({ error: 'TMDB show fetch failed' }) };
    }

    const show = await showRes.json();

    const seasons = await Promise.all(
      (show.seasons || [])
        .filter((s: any) => s.season_number > 0)
        .map(async (s: any) => {
          const epRes = await tmdbFetch(`/tv/${id}/season/${s.season_number}`);
          const epData = await epRes.json();
          return {
            season_number: s.season_number,
            episode_count: s.episode_count,
            episodes: (epData.episodes || []).map((ep: any) => ({
              episode_number: ep.episode_number,
              title: ep.name || '',
              overview: ep.overview || '',
              still_path: ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : '',
            })),
          };
        })
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tmdb_id: id,
        title: show.name,
        seasons,
        total_seasons: seasons.length,
        total_episodes: seasons.reduce((sum: number, s: any) => sum + s.episode_count, 0),
      }),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { statusCode: 500, body: JSON.stringify({ error: msg }) };
  }
};
