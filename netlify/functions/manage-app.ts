import sql from './utils/db';

export default async (req: Request) => {
  const adminPassword = req.headers.get('x-admin-password');

  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const data = await req.json();

    if (req.method === 'POST') {
      const { name, version, size, category, download_url, icon_url, whats_new, description, tags, previous_versions, is_pinned, is_hidden } = data;
      const { error } = await sql
        .from('apps')
        .insert({
          name: name ?? '', 
          version: version ?? '', 
          size: size ?? '', 
          category: category ?? 'Tools', 
          download_url: download_url ?? '', 
          icon_url: icon_url ?? null, 
          whats_new: whats_new ?? null, 
          description: description ?? null, 
          tags: tags ?? [], 
          previous_versions: previous_versions ?? [], 
          is_pinned: is_pinned ?? false,
          is_hidden: is_hidden ?? false
        });
      
      if (error) throw error;
      return new Response(JSON.stringify({ message: 'App added' }), { status: 201 });
    }

    if (req.method === 'PUT') {
      const { id, name, version, size, category, download_url, icon_url, whats_new, description, tags, previous_versions, is_pinned, is_hidden } = data;
      
      const { error } = await sql
        .from('apps')
        .update({ 
          name: name ?? '', 
          version: version ?? '', 
          size: size ?? '', 
          category: category ?? 'Tools', 
          download_url: download_url ?? '', 
          icon_url: icon_url ?? null,
          whats_new: whats_new ?? null,
          description: description ?? null,
          tags: tags ?? [],
          previous_versions: previous_versions ?? [],
          is_pinned: is_pinned ?? false,
          is_hidden: is_hidden ?? false
        })
        .eq('id', id);

      if (error) throw error;
      return new Response(JSON.stringify({ message: 'App updated' }), { status: 200 });
    }

    if (req.method === 'DELETE') {
      const { id } = data;
      const { error } = await sql.from('apps').delete().eq('id', id);
      if (error) throw error;
      return new Response(JSON.stringify({ message: 'App deleted' }), { status: 200 });
    }
    
    // Fallback
    return new Response('Method Not Allowed', { status: 405 });

  } catch (error: any) {
    console.error('Error managing app:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error', stack: error.stack }), { status: 500 });
  }
};
