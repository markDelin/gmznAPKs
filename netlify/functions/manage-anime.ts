import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

export default async (req: Request) => {
  const headers = { 'Content-Type': 'application/json' };
  const adminPassword = req.headers.get('x-admin-password');

  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
  }

  try {
    const body = await req.json();
    const { id, title, description, cover_image, banner_image, genre, status, rating, total_episodes } = body;

    if (req.method === 'POST') {
      const result = await sql`
        INSERT INTO anime (title, description, cover_image, banner_image, genre, status, rating, total_episodes)
        VALUES (${title}, ${description}, ${cover_image}, ${banner_image}, ${genre}, ${status}, ${rating}, ${total_episodes})
        RETURNING *
      `;
      return new Response(JSON.stringify(result[0]), { status: 201, headers });
    }

    if (req.method === 'PUT') {
      if (!id) return new Response(JSON.stringify({ error: 'ID required' }), { status: 400, headers });
      const result = await sql`
        UPDATE anime SET
          title = ${title},
          description = ${description},
          cover_image = ${cover_image},
          banner_image = ${banner_image},
          genre = ${genre},
          status = ${status},
          rating = ${rating},
          total_episodes = ${total_episodes}
        WHERE id = ${id}
        RETURNING *
      `;
      return new Response(JSON.stringify(result[0]), { headers });
    }

    if (req.method === 'DELETE') {
      if (!id) return new Response(JSON.stringify({ error: 'ID required' }), { status: 400, headers });
      await sql`DELETE FROM anime WHERE id = ${id}`;
      return new Response(JSON.stringify({ message: 'Deleted' }), { headers });
    }

    return new Response('Method Not Allowed', { status: 405 });
  } catch (error) {
    console.error('Error managing anime:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers });
  }
};
