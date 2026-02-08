
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import placeOrder from '../netlify/functions/place-order';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

// Mock Context
const mockContext: any = {};

async function main() {
    console.log('--- Starting Security Verification ---');
    try {
        // 1. Create a dummy product with limited stock
        const productName = `SecurityTest-${Date.now()}`;
        console.log(`Creating dummy product: ${productName} with Stock: 10`);
        
        await sql`
            INSERT INTO products (name, description, price, image_url, category, stock, type)
            VALUES (${productName}, 'Test Desc', 100, '', 'Test', 10, 'physical')
        `;
        
        const productRes = await sql`SELECT id FROM products WHERE name = ${productName}`;
        const productId = productRes[0].id;
        console.log(`Product created with ID: ${productId}`);

        // 2. Test Invalid Quantity (Negative)
        console.log('\n--- Test 1: Negative Quantity ---');
        let req = new Request('http://localhost/.netlify/functions/place-order', {
            method: 'POST',
            body: JSON.stringify({
                items: [{ product_id: productId, quantity: -5 }],
                buyer_name: 'Tester', buyer_email: 'test@gmail.com', buyer_social_media: 'fb'
            })
        });

        let res = await placeOrder(req, mockContext);
        console.log('Response Status:', res.status);
        console.log('Response Body:', await res.text());
        if (res.status === 400) console.log('SUCCESS: Blocked negative quantity.');
        else console.error('FAILURE: Allowed negative quantity.');

        // 3. Test Overselling (Atomic Check)
        console.log('\n--- Test 2: Overselling (Requesting 20, Stock 10) ---');
        req = new Request('http://localhost/.netlify/functions/place-order', {
            method: 'POST',
            body: JSON.stringify({
                items: [{ product_id: productId, quantity: 20 }],
                buyer_name: 'Tester', buyer_email: 'test@gmail.com', buyer_social_media: 'fb'
            })
        });

        res = await placeOrder(req, mockContext);
        console.log('Response Status:', res.status);
        console.log('Response Body:', await res.text());
        if (res.status === 400) console.log('SUCCESS: Blocked overselling.');
        else console.error('FAILURE: Allowed overselling.');

        // 4. Test Valid Order
        console.log('\n--- Test 3: Valid Order (Buying 5) ---');
        req = new Request('http://localhost/.netlify/functions/place-order', {
            method: 'POST',
            body: JSON.stringify({
                items: [{ product_id: productId, quantity: 5 }],
                buyer_name: 'Tester', buyer_email: 'test@gmail.com', buyer_social_media: 'fb'
            })
        });

        res = await placeOrder(req, mockContext);
        console.log('Response Status:', res.status);
        if (res.status === 201) console.log('SUCCESS: Order placed.');
        else console.error('FAILURE: Valid order rejected.', await res.text());

        // 5. Verify Remaining Stock
        const stockRes = await sql`SELECT stock FROM products WHERE id = ${productId}`;
        console.log('Remaining Stock:', stockRes[0].stock);
        if (stockRes[0].stock === 5) console.log('SUCCESS: Stock updated correctly.');
        else console.error('FAILURE: Stock mismatch.');

        // Cleanup
        await sql`DELETE FROM orders WHERE product_name = ${productName}`;
        await sql`DELETE FROM products WHERE id = ${productId}`;
        console.log('\nCleanup complete.');

    } catch (error) {
        console.error('Verification failed:', error);
    }
}

main();
