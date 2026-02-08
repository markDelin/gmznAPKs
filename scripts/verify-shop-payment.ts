
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
// import fetch from 'node-fetch'; // Native fetch in Node 18+

dotenv.config();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const BASE_URL = 'http://localhost:8888/.netlify/functions';

async function verifyPaymentFlow() {
    console.log('\n--- Verifying Payment Method Flow ---');

    // 1. Create a Test Product
    const testProduct = {
        name: 'Payment Test ' + Date.now(),
        description: 'Test Desc',
        price: 100,
        image_url: 'http://example.com/img.png',
        category: 'Test',
        stock: 10,
        type: 'physical' 
    };

    console.log('Creating Product...');
    const addRes = await fetch(`${BASE_URL}/manage-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': ADMIN_PASSWORD! },
        body: JSON.stringify(testProduct)
    });

    if (addRes.status !== 201) {
        console.error('Failed to add product:', await addRes.text());
        return;
    }
    console.log('Product added.');

    // Get Product ID
    const listRes = await fetch(`${BASE_URL}/get-products`);
    const products: any[] = await listRes.json();
    const product = products.find((p: any) => p.name === testProduct.name);

    if (!product) {
        console.error('Product not found.');
        return;
    }

    // 2. Place Order with COD
    console.log('Placing COD Order...');
    const codOrder = {
        items: [{ product_id: product.id, quantity: 1 }],
        buyer_name: 'Test Buyer COD',
        buyer_email: 'test@gmail.com',
        buyer_social_media: 'fb.com/test',
        payment_method: 'cod'
    };

    const orderRes = await fetch(`${BASE_URL}/place-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(codOrder)
    });

    if (orderRes.status !== 201) {
        console.error('COD Order failed:', await orderRes.text());
    } else {
        console.log('COD Order successful.');
    }

    // 3. Place Order with GCash
    console.log('Placing GCash Order...');
    const gcashOrder = {
        items: [{ product_id: product.id, quantity: 1 }],
        buyer_name: 'Test Buyer GCash',
        buyer_email: 'test@gmail.com',
        buyer_social_media: 'fb.com/test',
        payment_method: 'gcash'
    };

    const gcashRes = await fetch(`${BASE_URL}/place-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gcashOrder)
    });

    if (gcashRes.status !== 201) {
        console.error('GCash Order failed:', await gcashRes.text());
    } else {
        console.log('GCash Order successful.');
    }

    // 4. Verify in Database (via Admin API)
    console.log('Verifying Orders Record...');
    const ordersRes = await fetch(`${BASE_URL}/get-orders`, {
        headers: { 'x-admin-password': ADMIN_PASSWORD! }
    });
    const orders: any[] = await ordersRes.json();
    
    const lastCod = orders.find((o: any) => o.buyer_name === 'Test Buyer COD');
    const lastGcash = orders.find((o: any) => o.buyer_name === 'Test Buyer GCash');

    console.log('COD Order Method:', lastCod?.payment_method);
    console.log('GCash Order Method:', lastGcash?.payment_method);

    if (lastCod?.payment_method === 'cod' && lastGcash?.payment_method === 'gcash') {
        console.log('VERIFICATION SUCCESS: Payment methods stored correctly.');
    } else {
        console.error('VERIFICATION FAILED: Payment methods mismatch.');
    }

    // Cleanup
    await fetch(`${BASE_URL}/manage-product`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': ADMIN_PASSWORD! },
        body: JSON.stringify({ id: product.id })
    });
}

verifyPaymentFlow();
