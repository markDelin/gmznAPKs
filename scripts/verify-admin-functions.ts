
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const BASE_URL = 'http://localhost:8888/.netlify/functions';

async function verifyApps() {
    console.log('\n--- Verifying App Management ---');
    
    // 1. Add App
    const newApp = {
        name: 'Test App ' + Date.now(),
        version: '1.0.0',
        size: '10MB',
        category: 'Test',
        download_url: 'http://example.com/app.apk',
        icon_url: 'http://example.com/icon.png',
        whats_new: 'Initial release',
        description: 'A test app',
        tags: ['Test'],
        previous_versions: [],
        is_pinned: false
    };

    console.log('Adding App...');
    const addRes = await fetch(`${BASE_URL}/manage-app`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': ADMIN_PASSWORD! },
        body: JSON.stringify(newApp)
    });

    if (addRes.status !== 201) {
        console.error('Failed to add app:', addRes.status, await addRes.text());
        return;
    }
    console.log('App added successfully.');

    // Get App ID (fetch all and find)
    const listRes = await fetch(`${BASE_URL}/get-apps`);
    const apps: any[] = await listRes.json();
    const createdApp = apps.find((a: any) => a.name === newApp.name);

    if (!createdApp) {
        console.error('Could not find created app in list.');
        return;
    }
    console.log(`App created with ID: ${createdApp.id}`);

    // 2. Edit App
    console.log('Editing App...');
    const updatePayload = {
        ...createdApp,
        name: createdApp.name + ' (Updated)',
        previous_versions: [{ version: '0.9', size: '5MB', download_url: 'http://example.com/old.apk' }]
    };

    const editRes = await fetch(`${BASE_URL}/manage-app`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': ADMIN_PASSWORD! },
        body: JSON.stringify(updatePayload)
    });

    if (editRes.status !== 200) {
        console.error('Failed to edit app:', editRes.status, await editRes.text());
        return;
    }
    console.log('App edited successfully.');

    // 3. Delete App
    console.log('Deleting App...');
    const delRes = await fetch(`${BASE_URL}/manage-app`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': ADMIN_PASSWORD! },
        body: JSON.stringify({ id: createdApp.id })
    });

    if (delRes.status !== 200) {
        console.error('Failed to delete app:', delRes.status, await delRes.text());
        return;
    }
    console.log('App deleted successfully.');
}

async function verifyProducts() {
    console.log('\n--- Verifying Product Management ---');

    // 1. Add Product
    const newProduct = {
        name: 'Test Product ' + Date.now(),
        description: 'Test Desc',
        price: 100,
        image_url: 'http://example.com/img.png',
        category: 'Test',
        stock: 10
    };

    console.log('Adding Product...');
    const addRes = await fetch(`${BASE_URL}/manage-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': ADMIN_PASSWORD! },
        body: JSON.stringify(newProduct)
    });

    if (addRes.status !== 201) {
        console.error('Failed to add product:', addRes.status, await addRes.text());
        return;
    }
    console.log('Product added successfully.');

    // Get ID
    const listRes = await fetch(`${BASE_URL}/get-products`);
    const products: any[] = await listRes.json();
    const createdProduct = products.find((p: any) => p.name === newProduct.name);

    if (!createdProduct) {
        console.error('Could not find created product.');
        return;
    }
    console.log(`Product created with ID: ${createdProduct.id}`);

    // 2. Edit Product
    console.log('Editing Product...');
    const updatePayload = {
        ...createdProduct,
        price: 200
    };

    const editRes = await fetch(`${BASE_URL}/manage-product`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': ADMIN_PASSWORD! },
        body: JSON.stringify(updatePayload)
    });

    if (editRes.status !== 200) {
        console.error('Failed to edit product:', editRes.status, await editRes.text());
        return;
    }
    console.log('Product edited successfully.');

    // 3. Delete Product
    console.log('Deleting Product...');
    const delRes = await fetch(`${BASE_URL}/manage-product`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': ADMIN_PASSWORD! },
        body: JSON.stringify({ id: createdProduct.id })
    });

    if (delRes.status !== 200) {
        console.error('Failed to delete product:', delRes.status, await delRes.text());
        return;
    }
    console.log('Product deleted successfully.');
}

async function main() {
    try {
        await verifyApps();
        await verifyProducts();
    } catch (e) {
        console.error(e);
    }
}

main();
