import postgres from 'postgres';

export default async (req: Request) => {
  const adminPassword = req.headers.get('x-admin-password');

  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

  try {
    const data = await req.json();

    if (req.method === 'POST') {
      const { name, version, size, category, download_url, icon_url, whats_new, description, tags, previous_versions, is_pinned, is_hidden } = data;
      await sql`
        INSERT INTO apps (name, version, size, category, download_url, icon_url, whats_new, description, tags, previous_versions, is_pinned, is_hidden)
        VALUES (
          ${name ?? ''}, 
          ${version ?? ''}, 
          ${size ?? ''}, 
          ${category ?? 'Tools'}, 
          ${download_url ?? ''}, 
          ${icon_url ?? null}, 
          ${whats_new ?? null}, 
          ${description ?? null}, 
          ${tags ?? []}, 
          ${JSON.stringify(previous_versions ?? [])}, 
          ${is_pinned ?? false},
          ${is_hidden ?? false}
        )
      `;
      return new Response(JSON.stringify({ message: 'App added' }), { status: 201 });
    }

    if (req.method === 'PUT') {
      const { id, name, version, size, category, download_url, icon_url, whats_new, description, tags, previous_versions, is_pinned, is_hidden } = data;
      
      await sql`
        UPDATE apps 
        SET 
          name = ${name ?? ''}, 
          version = ${version ?? ''}, 
          size = ${size ?? ''}, 
          category = ${category ?? 'Tools'}, 
          download_url = ${download_url ?? ''}, 
          icon_url = ${icon_url ?? null},
          whats_new = ${whats_new ?? null},
          description = ${description ?? null},
          tags = ${tags ?? []},
          previous_versions = ${JSON.stringify(previous_versions ?? [])},
          is_pinned = ${is_pinned ?? false},
          is_hidden = ${is_hidden ?? false}
        WHERE id = ${id}
      `;
      return new Response(JSON.stringify({ message: 'App updated' }), { status: 200 });
    }

    if (req.method === 'DELETE') {
      const { id } = data;
      await sql`DELETE FROM apps WHERE id = ${id}`;
      return new Response(JSON.stringify({ message: 'App deleted' }), { status: 200 });
    }
    
    // Fallback
    return new Response('Method Not Allowed', { status: 405 });

  } catch (error: any) {
    console.error('Error managing app:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error', stack: error.stack }), { status: 500 });
  } finally {
    await sql.end();
  }
};
