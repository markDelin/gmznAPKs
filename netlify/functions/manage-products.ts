// manage-products.ts - For Sellers to manage their products
import postgres from 'postgres';

export default async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, x-seller-id', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS' } });
    }

    const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

    try {
        // GET can be public (for the storefront) or filtered by seller
        if (req.method === 'GET') {
            const url = new URL(req.url);
            const sellerId = url.searchParams.get('sellerId');
            
            if (sellerId) {
                const products = await sql`
                    SELECT sp.*, s.username as seller_name 
                    FROM sellable_products sp 
                    JOIN sellers s ON sp.seller_id = s.id 
                    WHERE sp.seller_id = ${sellerId}
                    ORDER BY sp.created_at DESC
                `;
                return new Response(JSON.stringify(products), { status: 200 });
            } else {
                const products = await sql`
                    SELECT sp.*, s.username as seller_name 
                    FROM sellable_products sp 
                    JOIN sellers s ON sp.seller_id = s.id 
                    ORDER BY sp.created_at DESC
                `;
                return new Response(JSON.stringify(products), { status: 200 });
            }
        }

        // All other methods require Seller ID header
        const sellerId = req.headers.get('x-seller-id');
        if (!sellerId) return new Response(JSON.stringify({ error: 'Unauthorized Seller' }), { status: 401 });

        if (req.method === 'POST') {
            const { name, description, price, stock, category, image_url } = await req.json();
            if (!name || price === undefined || stock === undefined) return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });

            const newProduct = await sql`
                INSERT INTO sellable_products (seller_id, name, description, price, stock, category, image_url)
                VALUES (${sellerId}, ${name}, ${description}, ${price}, ${stock}, ${category}, ${image_url})
                RETURNING *
            `;
            return new Response(JSON.stringify(newProduct[0]), { status: 201 });
        }

        if (req.method === 'PUT') {
             const { id, name, description, price, stock, category, image_url } = await req.json();
             if (!id) return new Response(JSON.stringify({ error: 'Product ID required' }), { status: 400 });
             
             // Ensure seller owns product
             const product = await sql`SELECT id FROM sellable_products WHERE id = ${id} AND seller_id = ${sellerId}`;
             if (product.length === 0) return new Response(JSON.stringify({ error: 'Unauthorized or not found' }), { status: 403 });

             const updated = await sql`
                UPDATE sellable_products
                SET name = ${name}, description = ${description}, price = ${price}, stock = ${stock}, category = ${category}, image_url = ${image_url}
                WHERE id = ${id}
                RETURNING *
             `;
             return new Response(JSON.stringify(updated[0]), { status: 200 });
        }

        if (req.method === 'DELETE') {
             const { id } = await req.json();
             if (!id) return new Response(JSON.stringify({ error: 'Product ID required' }), { status: 400 });
             
             const product = await sql`SELECT id FROM sellable_products WHERE id = ${id} AND seller_id = ${sellerId}`;
             if (product.length === 0) return new Response(JSON.stringify({ error: 'Unauthorized or not found' }), { status: 403 });

             await sql`DELETE FROM sellable_products WHERE id = ${id}`;
             return new Response(JSON.stringify({ success: true }), { status: 200 });
        }

        return new Response('Method Not Allowed', { status: 405 });

    } catch (e: unknown) {
        console.error('Products error:', e);
        return new Response(JSON.stringify({ error: 'Server Error' }), { status: 500 });
    } finally {
        await sql.end();
    }
};
