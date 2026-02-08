
import { Handler } from '@netlify/functions';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { episode_id, intro_start, intro_end, outro_start, outro_end } = JSON.parse(event.body || '{}');

    if (!episode_id) {
        return { statusCode: 400, body: 'Missing episode_id' };
    }

    // Update the episode with new timings
    await sql`
      UPDATE episodes SET
        intro_start = ${intro_start || 0},
        intro_end = ${intro_end || 0},
        outro_start = ${outro_start || 0},
        outro_end = ${outro_end || 0}
      WHERE id = ${episode_id}
    `;

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error('Error updating timings:', error);
    return { statusCode: 500, body: String(error) };
  }
};
