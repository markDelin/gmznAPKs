import sql from './utils/db';

export default async (req: Request) => {

  try {
    console.log('Migrating apps table to add is_hidden...');
    
    await sql`
      ALTER TABLE apps 
      ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;
    `;

    return new Response(JSON.stringify({ message: 'Migration complete! is_hidden column added to apps.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: unknown) {
    console.error('Migration failed:', error);
    return new Response(JSON.stringify({ error: `Migration failed: ${error instanceof Error ? error.message : String(error)}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
