
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function main() {
    console.log('Seeding DITO Open Load Product (Price = 1.00)...');

    try {
        const exists = await sql`SELECT id FROM products WHERE name = 'DITO Regular Load'`;
        if (exists.length > 0) {
            console.log('Skipped (Exists): DITO Regular Load');
        } else {
            await sql`
                INSERT INTO products (name, description, price, category, stock, type, image_url)
                VALUES (
                    'DITO Regular Load', 
                    'Custom amount regular load. 1 Quantity = 1 Peso Load.', 
                    1.00, 
                    'E-Load', 
                    999999, 
                    'digital', 
                    'https://images.unsplash.com/photo-1616423664033-d7348e02d842?w=800&auto=format&fit=crop&q=60'
                )
            `;
            console.log('Inserted: DITO Regular Load');
        }
    } catch (error) {
        console.error('Error seeding regular load:', error);
    }
}

main();
