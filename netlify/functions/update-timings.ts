import { Handler } from '@netlify/functions';
import sql from './utils/db';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { episode_id, intro_start, intro_end, outro_start, outro_end } = JSON.parse(event.body || '{}');

    if (!episode_id) {
        return { statusCode: 400, body: 'Missing episode_id' };
    }

    // Update the episode with new timings
    const { error } = await sql
      .from('episodes')
      .update({
        intro_start: intro_start || 0,
        intro_end: intro_end || 0,
        outro_start: outro_start || 0,
        outro_end: outro_end || 0
      })
      .eq('id', episode_id);

    if (error) throw error;

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error('Error updating timings:', error);
    return { statusCode: 500, body: String(error) };
  }
};
