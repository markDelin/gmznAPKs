import { Handler } from '@netlify/functions';

const API_KEY = process.env.OPENSUBTITLES_API_KEY;
const API_BASE = 'https://api.opensubtitles.com/api/v1';

const srtToVtt = (srt: string): string => {
  let vtt = 'WEBVTT\n\n';
  vtt += srt
    .replace(/\r\n/g, '\n')
    .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
  return vtt;
};

export const handler: Handler = async (event) => {
  const query = event.queryStringParameters?.q;
  const season = event.queryStringParameters?.s;
  const episode = event.queryStringParameters?.ep;
  const language = event.queryStringParameters?.lang || 'en';

  if (!query) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing query parameter q' }) };
  }

  if (!API_KEY) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        error: 'OpenSubtitles API key required',
        hint: 'Get a free key at https://opensubtitles.com and add to .env as OPENSUBTITLES_API_KEY',
      }),
    };
  }

  try {
    const params = new URLSearchParams({ query });
    if (season) params.set('season_number', season);
    if (episode) params.set('episode_number', episode);
    params.set('languages', language);
    params.set('type', 'episode');
    params.set('order_by', 'download_count');
    params.set('order_direction', 'desc');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Api-Key': API_KEY,
      'User-Agent': 'GMZNAnime v1.0',
    };

    const searchRes = await fetch(`${API_BASE}/subtitles?${params}`, { headers });
    if (!searchRes.ok) {
      return { statusCode: searchRes.status, body: JSON.stringify({ error: 'OpenSubtitles search failed' }) };
    }

    const searchData = await searchRes.json();
    const items = searchData.data || [];

    if (items.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ error: 'No subtitles found' }) };
    }

    const results: { language: string; release: string; data_url: string; format: string }[] = [];
    const seen = new Set<string>();

    for (const item of items) {
      if (results.length >= 3) break;
      const file = item.attributes?.files?.[0];
      if (!file?.file_id) continue;

      const lang = item.attributes?.language || 'en';
      const release = item.attributes?.release || 'unknown';
      const key = `${lang}-${release}`;
      if (seen.has(key)) continue;
      seen.add(key);

      try {
        const dlRes = await fetch(`${API_BASE}/download`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ file_id: file.file_id }),
        });
        if (!dlRes.ok) continue;
        const dlData = await dlRes.json();
        const link = dlData.link;
        if (!link) continue;

        const fileRes = await fetch(link);
        if (!fileRes.ok) continue;
        const rawText = await fileRes.text();

        const fileFormat = (file.file_name || '').endsWith('.vtt') ? 'vtt' : 'srt';
        const vttContent = fileFormat === 'srt' ? srtToVtt(rawText) : rawText;
        if (!vttContent.trim()) continue;

        const base64 = Buffer.from(vttContent, 'utf-8').toString('base64');
        const dataUrl = `data:text/vtt;base64,${base64}`;

        results.push({ language: lang, release, data_url: dataUrl, format: fileFormat });
      } catch {
        continue;
      }
    }

    if (results.length === 0) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Failed to download any subtitles' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subtitles: results,
        total_found: items.length,
      }),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { statusCode: 500, body: JSON.stringify({ error: msg }) };
  }
};
