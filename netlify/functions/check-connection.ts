import sql from './utils/db';

export default async (req: Request) => {
  try {
    // Attempt to fetch a single setting to verify connection
    const { data, error } = await sql.from('system_settings').select('count').limit(1);
    
    if (error) {
        return new Response(JSON.stringify({ 
            status: 'error', 
            message: 'Connected to Supabase client, but failed to query table.',
            error: error 
        }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ 
        status: 'success', 
        message: 'Successfully connected to Supabase!',
        data: data
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error: any) {
    return new Response(JSON.stringify({ 
        status: 'error', 
        message: 'Failed to initialize Supabase client. Check your environment variables.',
        error: error.message
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
