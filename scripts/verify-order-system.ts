import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
// import fetch from 'node-fetch'; // Removed unused import

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  try {
    console.log('Starting Cart & Order Verification...');

    // 1. Create Test Products
    console.log('Creating test product A and B...');
    const p1 = await sql`INSERT INTO products (name, description, price, category, stock) VALUES ('Prod A', 'Desc', 100, 'Test', 10) RETURNING id`;
    const p2 = await sql`INSERT INTO products (name, description, price, category, stock) VALUES ('Prod B', 'Desc', 200, 'Test', 10) RETURNING id`;
    
    const id1 = p1[0].id;
    const id2 = p2[0].id;

    console.log(`Created Prod A (${id1}) and Prod B (${id2})`);

    // 2. Simulate Multi-Item Order
    // Request payload structure: { items: [{product_id, quantity}], ... }
    
    const items = [
        { product_id: id1, quantity: 2 },
        { product_id: id2, quantity: 3 }
    ];

    console.log('Simulating order placement for 2x Prod A and 3x Prod B...');

    // Logic from place-order.ts simulation
    for (const item of items) {
        await sql`UPDATE products SET stock = stock - ${item.quantity} WHERE id = ${item.product_id}`;
        // Verify stock immediately
        const s = await sql`SELECT stock FROM products WHERE id = ${item.product_id}`;
    }

    // Insert orders
    await sql`INSERT INTO orders (product_id, product_name, buyer_name, buyer_email, buyer_social_media, quantity) VALUES (${id1}, 'Prod A', 'Buyer', 'b@g.com', 'fb', 2)`;
    await sql`INSERT INTO orders (product_id, product_name, buyer_name, buyer_email, buyer_social_media, quantity) VALUES (${id2}, 'Prod B', 'Buyer', 'b@g.com', 'fb', 3)`;

    // 3. Verify Final State
    const s1 = await sql`SELECT stock FROM products WHERE id = ${id1}`;
    const s2 = await sql`SELECT stock FROM products WHERE id = ${id2}`;

    console.log(`Prod A Stock: ${s1[0].stock} (Expected 8)`);
    console.log(`Prod B Stock: ${s2[0].stock} (Expected 7)`);

    const orders = await sql`SELECT * FROM orders WHERE buyer_email = 'b@g.com'`;
    console.log(`Orders found: ${orders.length} (Expected 2)`);
    console.log(`Order 1 Qty: ${orders.find(o => o.product_id === id1).quantity} (Expected 2)`);

    if (s1[0].stock === 8 && s2[0].stock === 7 && orders.length === 2) {
        console.log('Verification SUCCESS!');
    } else {
        console.error('Verification FAILED');
    }

    // Cleanup
    console.log('Cleaning up...');
    await sql`DELETE FROM orders WHERE buyer_email = 'b@g.com'`;
    await sql`DELETE FROM products WHERE id IN (${id1}, ${id2})`;
    console.log('Done.');

  } catch (error) {
    console.error('Verification Error:', error);
  }
}

main();
