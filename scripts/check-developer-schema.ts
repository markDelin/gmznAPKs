
import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL || '', { ssl: 'require' });

async function checkSchema() {
  try {
    console.log('Checking developer_profile table...');
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'developer_profile';
    `;
    
    if (result.length === 0) {
        console.log('Table developer_profile DOES NOT EXIST.');
    } else {
        console.log('Table exists. Columns:');
        console.table(result);
    }
  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    await sql.end();
  }
}

checkSchema();
