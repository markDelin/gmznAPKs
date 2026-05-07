import { Handler } from '@netlify/functions';
import sql from './utils/db';

export const handler: Handler = async (event) => {
  const adminPassword = event.headers['x-admin-password'];
  
  if (process.env.ADMIN_PASSWORD && adminPassword !== process.env.ADMIN_PASSWORD) {
     return { statusCode: 401, body: 'Unauthorized' };
  }

  if (event.httpMethod === 'POST') {
    try {
      const { anime_id, episode_number, title, video_url, video_url_2, video_url_dub, video_url_dub_2, season_number, intro_start, intro_end, outro_start, outro_end } = JSON.parse(event.body || '{}');
      const { error } = await sql
        .from('episodes')
        .insert({
          anime_id, episode_number, title, video_url, video_url_2: video_url_2 || null, video_url_dub: video_url_dub || null, video_url_dub_2: video_url_dub_2 || null, season_number: season_number || 1,
          intro_start: intro_start || 0, intro_end: intro_end || 0, outro_start: outro_start || 0, outro_end: outro_end || 0
        });
      
      if (error) throw error;

      // Update anime count
      const { data: countData } = await sql.from('episodes').select('id', { count: 'exact', head: true }).eq('anime_id', anime_id);
      await sql.from('anime').update({ total_episodes: countData?.length || 0 }).eq('id', anime_id);
      
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } catch (error) {
      return { statusCode: 500, body: String(error) };
    }
  }

  if (event.httpMethod === 'PUT') {
    try {
      const { id, episode_number, title, video_url, video_url_2, video_url_dub, video_url_dub_2, season_number, intro_start, intro_end, outro_start, outro_end, anime_id } = JSON.parse(event.body || '{}');
      const { error } = await sql
        .from('episodes')
        .update({ 
          episode_number, 
          title, 
          video_url, 
          video_url_2: video_url_2 || null,
          video_url_dub: video_url_dub || null,
          video_url_dub_2: video_url_dub_2 || null,
          season_number: season_number || 1,
          intro_start: intro_start || 0,
          intro_end: intro_end || 0,
          outro_start: outro_start || 0,
          outro_end: outro_end || 0
        })
        .eq('id', id);

      if (error) throw error;

      // Update anime count
      if (anime_id) {
         const { data: countData } = await sql.from('episodes').select('id', { count: 'exact', head: true }).eq('anime_id', anime_id);
         await sql.from('anime').update({ total_episodes: countData?.length || 0 }).eq('id', anime_id);
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
          const { data: ep } = await sql.from('episodes').select('anime_id').eq('id', id).single();
          
          const { error: deleteError } = await sql.from('episodes').delete().eq('id', id);
          if (deleteError) throw deleteError;
          
          if(ep) {
             const { data: countData } = await sql.from('episodes').select('id', { count: 'exact', head: true }).eq('anime_id', ep.anime_id);
             await sql.from('anime').update({ total_episodes: countData?.length || 0 }).eq('id', ep.anime_id);
          }

          return { statusCode: 200, body: JSON.stringify({ success: true }) };
      } catch (error) {
          return { statusCode: 500, body: String(error) };
      }
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};
