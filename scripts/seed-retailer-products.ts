import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

const networks = [
  { name: 'Smart Load', prefix: 'smart' },
  { name: 'Globe Load', prefix: 'globe' },
  { name: 'DITO Load', prefix: 'dito' },
  { name: 'TM Load', prefix: 'tm' },
  { name: 'TNT Load', prefix: 'tnt' }
];

const amounts = [10, 20, 30, 50, 100, 200, 300, 500];

async function main() {
  console.log('Seeding Retailer Products...');

  try {
    for (const network of networks) {
      console.log(`Processing ${network.name}...`);
      
      // Check if products already exist to avoid duplicates
      // We'll just insert common loads
      
      for (const amount of amounts) {
         const productName = `${network.name} ${amount}`;
         const description = `E-Load for ${network.name} - ${amount} Pesos`;
         const uniqueKey = `${network.prefix}_${amount}`; // Not used in DB but mentally tracking
         
         // Using a simple check
         const existing = await sql`SELECT id FROM products WHERE name = ${productName} AND category = 'E-Load'`;
         
         if (existing.length === 0) {
             await sql`
                INSERT INTO products (name, description, price, category, stock, type, image_url)
                VALUES (
                    ${productName},
                    ${description},
                    ${amount}, 
                    'E-Load',
                    9999,
                    'digital',
                    ''
                )
             `;
             console.log(`Created: ${productName}`);
         } else {
             console.log(`Skipped (Exists): ${productName}`);
         }
      }
    }
    console.log('Seeding Complete!');
  } catch (error) {
    console.error('Error seeding products:', error);
  }
}

main();
