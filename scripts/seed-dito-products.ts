import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  try {
    console.log('Seeding DITO products with check...');
    
    const products = [
        {
            name: 'DITO 99',
            description: '7GB Data valid for 30 days. Calls & Texts to DITO.',
            price: 99,
            image_url: 'https://images.unsplash.com/photo-1512428559087-560fa5ce7d87?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
            category: 'Data Promos'
        },
        {
            name: 'DITO 199',
            description: '16GB Data valid for 30 days. Unli DITO Calls & Texts.',
            price: 199,
            image_url: 'https://images.unsplash.com/photo-1512428559087-560fa5ce7d87?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
            category: 'Data Promos'
        },
        {
            name: 'DITO Level Up 300',
            description: '28GB Data valid for 30 days. Unli All-Net Calls & Texts.',
            price: 300,
            image_url: 'https://images.unsplash.com/photo-1512428559087-560fa5ce7d87?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
            category: 'Data Promos'
        },
        {
            name: 'DITO 10',
            description: '1GB Data valid for 1 day.',
            price: 10,
            image_url: 'https://images.unsplash.com/photo-1512428559087-560fa5ce7d87?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
            category: 'Data Promos'
        }
    ];

    for (const p of products) {
         const existing = await sql`SELECT id FROM products WHERE name = ${p.name}`;
         if (existing.length === 0) {
             await sql`
                INSERT INTO products (name, description, price, image_url, category, stock)
                VALUES (${p.name}, ${p.description}, ${p.price}, ${p.image_url}, ${p.category}, 1000)
             `;
             console.log(`Seeded: ${p.name}`);
         } else {
             console.log(`Skipped (Exists): ${p.name}`);
         }
    }

    console.log('DITO products seeded successfully.');
  } catch (error) {
    console.error('Error seeding products:', error);
  }
}

main();
