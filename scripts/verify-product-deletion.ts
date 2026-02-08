
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import manageProduct from '../netlify/functions/manage-product';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

// Mock Context
const mockContext: any = {};

async function main() {
    console.log('--- Starting Verification ---');
    try {
        // 1. Create a dummy product
        const productName = `DeleteTest-${Date.now()}`;
        console.log(`Creating dummy product: ${productName}`);
        
        await sql`
            INSERT INTO products (name, description, price, image_url, category, stock, type)
            VALUES (${productName}, 'Test Desc', 100, '', 'Test', 10, 'physical')
        `;
        
        const productRes = await sql`SELECT id FROM products WHERE name = ${productName}`;
        const productId = productRes[0].id;
        console.log(`Product created with ID: ${productId}`);

        // 2. Create a dummy order linked to it
        console.log(`Creating dummy order for Product ID: ${productId}`);
        await sql`
            INSERT INTO orders (product_id, product_name, buyer_name, buyer_email, buyer_social_media, status, quantity)
            VALUES (${productId}, ${productName}, 'Tester', 'test@test.com', 'test', 'pending', 1)
        `;
        
        const orderRes = await sql`SELECT id FROM orders WHERE product_id = ${productId}`;
        console.log(`Order created with ID: ${orderRes[0].id}`);

        // 3. Attempt to delete via the handler
        console.log('Attempting to delete product via handler...');
        
        // Mock Request
        const req = new Request('http://localhost/.netlify/functions/manage-product', {
            method: 'DELETE',
            headers: {
                'x-admin-password': process.env.ADMIN_PASSWORD!
            },
            body: JSON.stringify({ id: productId })
        });

        const res = await manageProduct(req, mockContext);
        
        if (res.status === 200) {
            console.log('Handler returned 200 OK.');
        } else {
            console.error('Handler returned:', res.status, await res.text());
        }

        // 4. Verify deletion in DB
        const productsCheck = await sql`SELECT * FROM products WHERE id = ${productId}`;
        const ordersCheck = await sql`SELECT * FROM orders WHERE product_id = ${productId}`;

        if (productsCheck.length === 0) {
            console.log('SUCCESS: Product deleted from DB.');
        } else {
            console.error('FAILURE: Product still exists in DB.');
        }

        if (ordersCheck.length === 0) {
            console.log('SUCCESS: Associated orders deleted from DB.');
        } else {
            console.error('FAILURE: Associated orders still exist in DB.');
        }

    } catch (error) {
        console.error('Verification failed:', error);
    }
}

main();
