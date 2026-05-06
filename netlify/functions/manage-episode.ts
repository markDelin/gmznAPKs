import { Handler } from '@netlify/functions';
import sql from './utils/db';

export const handler: Handler = async (event) => {
  const adminPassword = event.headers['x-admin-password'];
  
  if (process.env.ADMIN_PASSWORD && adminPassword !== process.env.ADMIN_PASSWORD) {
     return { statusCode: 401, body: 'Unauthorized' };
  }

  // Ensure columns exist before processing request
  try {
    await sql`ALTER TABLE episodes ADD COLUMN IF NOT EXISTS video_url_2 text;`;
    await sql`ALTER TABLE episodes ADD COLUMN IF NOT EXISTS video_url_dub text;`;
    await sql`ALTER TABLE episodes ADD COLUMN IF NOT EXISTS video_url_dub_2 text;`;
    await sql`ALTER TABLE episodes ADD COLUMN IF NOT EXISTS season_number integer DEFAULT 1;`;
    await sql`ALTER TABLE episodes ADD COLUMN IF NOT EXISTS intro_start integer DEFAULT 0;`;
    await sql`ALTER TABLE episodes ADD COLUMN IF NOT EXISTS intro_end integer DEFAULT 0;`;
    await sql`ALTER TABLE episodes ADD COLUMN IF NOT EXISTS outro_start integer DEFAULT 0;`;
    await sql`ALTER TABLE episodes ADD COLUMN IF NOT EXISTS outro_end integer DEFAULT 0;`;
  } catch (err) {
    console.error('Database migration failed:', err);
  }

  if (event.httpMethod === 'POST') {
    try {
      const { anime_id, episode_number, title, video_url, video_url_2, video_url_dub, video_url_dub_2, season_number, intro_start, intro_end, outro_start, outro_end } = JSON.parse(event.body || '{}');
      await sql`
        INSERT INTO episodes (anime_id, episode_number, title, video_url, video_url_2, video_url_dub, video_url_dub_2, season_number, intro_start, intro_end, outro_start, outro_end)
        VALUES (
          ${anime_id}, ${episode_number}, ${title}, ${video_url}, ${video_url_2 || null}, ${video_url_dub || null}, ${video_url_dub_2 || null}, ${season_number || 1},
          ${intro_start || 0}, ${intro_end || 0}, ${outro_start || 0}, ${outro_end || 0}
        )
      `;
      // Update anime count
      await sql`UPDATE anime SET total_episodes = (SELECT COUNT(*) FROM episodes WHERE anime_id = ${anime_id}) WHERE id = ${anime_id}`;
      
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } catch (error) {
      return { statusCode: 500, body: String(error) };
    }
  }

  if (event.httpMethod === 'PUT') {
    try {
      const { id, episode_number, title, video_url, video_url_2, video_url_dub, video_url_dub_2, season_number, intro_start, intro_end, outro_start, outro_end, anime_id } = JSON.parse(event.body || '{}');
      await sql`
        UPDATE episodes SET 
          episode_number = ${episode_number}, 
          title = ${title}, 
          video_url = ${video_url}, 
          video_url_2 = ${video_url_2 || null},
          video_url_dub = ${video_url_dub || null},
          video_url_dub_2 = ${video_url_dub_2 || null},
          season_number = ${season_number || 1},
          intro_start = ${intro_start || 0},
          intro_end = ${intro_end || 0},
          outro_start = ${outro_start || 0},
          outro_end = ${outro_end || 0}
        WHERE id = ${id}
      `;
      // Update anime count if anime_id is provided (though usually ID represents the relationship)
      if (anime_id) {
         await sql`UPDATE anime SET total_episodes = (SELECT COUNT(*) FROM episodes WHERE anime_id = ${anime_id}) WHERE id = ${anime_id}`;
      }

      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } catch (error) {
      return { statusCode: 500, body: String(error) };
    }
  }

  if (event.httpMethod === 'DELETE') {
      try {
          const { id } = JSON.parse(event.body || '{}');
          // Get anime_id before delete to update count
          const [ep] = await sql`SELECT anime_id FROM episodes WHERE id = ${id}`;
          
          await sql`DELETE FROM episodes WHERE id = ${id}`;
          
          if(ep) {
             await sql`UPDATE anime SET total_episodes = (SELECT COUNT(*) FROM episodes WHERE anime_id = ${ep.anime_id}) WHERE id = ${ep.anime_id}`;
          }

          return { statusCode: 200, body: JSON.stringify({ success: true }) };
      } catch (error) {
          return { statusCode: 500, body: String(error) };
      }
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};
