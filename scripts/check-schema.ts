
import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 1 });

async function checkSchema() {
  try {
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'apps'
    `;
    console.log('Columns in apps table:', columns);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.end();
  }
}

checkSchema();
