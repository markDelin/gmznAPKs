
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
// import fetch from 'node-fetch'; // Native in Node 18+

dotenv.config();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const BASE_URL = 'http://localhost:8888/.netlify/functions';

async function verifyOrderDeletion() {
    console.log('\n--- Verifying Order Deletion & Stock Restoration ---');

    // 1. Create a Test Product
    const testProduct = {
        name: 'Delete Test ' + Date.now(),
        description: 'Test Desc',
        price: 100,
        image_url: 'http://example.com/img.png',
        category: 'Test',
        stock: 10,
        type: 'physical' 
    };

    console.log('Creating Product (Stock: 10)...');
    const addRes = await fetch(`${BASE_URL}/manage-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': ADMIN_PASSWORD! },
        body: JSON.stringify(testProduct)
    });
    
    if (!addRes.ok) throw new Error('Failed to create product');

    // Get Product ID
    const listRes = await fetch(`${BASE_URL}/get-products`);
    const products: any[] = await listRes.json();
    const product = products.find((p: any) => p.name === testProduct.name);

    if (!product) throw new Error('Product not found');
    console.log(`Product created. ID: ${product.id}`);

    // 2. Place Order (Qty: 3)
    console.log('Placing Order (Qty: 3)...');
    const orderPayload = {
        items: [{ product_id: product.id, quantity: 3 }],
        buyer_name: 'Test Buyer Delete',
        buyer_email: 'test@gmail.com',
        buyer_social_media: 'fb.com/test',
        payment_method: 'cod'
    };

    const orderRes = await fetch(`${BASE_URL}/place-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
    });

    if (!orderRes.ok) throw new Error('Failed to place order');
    console.log('Order placed.');

    // 3. Verify Stock Reduced
    const checkStockP1 = await fetch(`${BASE_URL}/get-products`);
    const productsAfterOrder: any[] = await checkStockP1.json();
    const pAfterOrder = productsAfterOrder.find((p: any) => p.id === product.id);
    console.log(`Stock after order: ${pAfterOrder.stock} (Expected: 7)`);

    if (pAfterOrder.stock !== 7) throw new Error('Stock deduction failed');

    // 4. Get Order ID
    const ordersRes = await fetch(`${BASE_URL}/get-orders`, { headers: { 'x-admin-password': ADMIN_PASSWORD! } });
    const orders: any[] = await ordersRes.json();
    const order = orders.find((o: any) => o.product_id === product.id && o.buyer_name === 'Test Buyer Delete');
    
    if (!order) throw new Error('Order not found');
    console.log(`Order found. ID: ${order.id}`);

    // 5. Delete Order & Verify Restoration
    console.log('Deleting Order...');
    const delRes = await fetch(`${BASE_URL}/manage-order`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': ADMIN_PASSWORD! },
        body: JSON.stringify({ id: order.id })
    });

    if (!delRes.ok) throw new Error('Failed to delete order');
    console.log('Order deleted.');

    // 6. Verify Stock Restored
    const checkStockP2 = await fetch(`${BASE_URL}/get-products`);
    const productsAfterDelete: any[] = await checkStockP2.json();
    const pAfterDelete = productsAfterDelete.find((p: any) => p.id === product.id);
    console.log(`Stock after delete: ${pAfterDelete.stock} (Expected: 10)`);

    if (pAfterDelete.stock !== 10) {
        console.error('VERIFICATION FAILED: Stock not restored correctly.');
    } else {
        console.log('VERIFICATION SUCCESS: Stock restored!');
    }

    // Cleanup
    await fetch(`${BASE_URL}/manage-product`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': ADMIN_PASSWORD! },
        body: JSON.stringify({ id: product.id })
    });
}

verifyOrderDeletion().catch(console.error);
