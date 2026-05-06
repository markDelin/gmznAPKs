import sql from './utils/db';

export default async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, x-seller-id', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS' } });
    }

    try {
        // GET orders (requires seller id)
        if (req.method === 'GET') {
            const sellerId = req.headers.get('x-seller-id');
            if (!sellerId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

            const orders = await sql`
                SELECT po.*, sp.name as product_name, sp.price as unit_price
                FROM product_orders po
                LEFT JOIN sellable_products sp ON po.product_id = sp.id
                WHERE po.seller_id = ${sellerId}
                ORDER BY po.created_at DESC
            `;
            return new Response(JSON.stringify(orders), { status: 200 });
        }

        // POST order (public storefront)
        if (req.method === 'POST') {
             const { product_id, seller_id, customer_name, quantity, total_price } = await req.json();
             
             if (!product_id || !seller_id || !customer_name || !quantity || !total_price) {
                  return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
             }

             const newOrder = await sql.begin(async (tx: any) => {
                  // Check stock
                  const [product] = await tx`SELECT stock FROM sellable_products WHERE id = ${product_id} FOR UPDATE`;
                  if (!product) throw new Error('Product not found');
                  if (product.stock < quantity) throw new Error('Insufficient Stock');

                  // Deduct stock
                  await tx`UPDATE sellable_products SET stock = stock - ${quantity} WHERE id = ${product_id}`;

                  // Insert order
                  const inserted = await tx`
                      INSERT INTO product_orders (product_id, seller_id, customer_name, quantity, total_price)
                      VALUES (${product_id}, ${seller_id}, ${customer_name}, ${quantity}, ${total_price})
                      RETURNING *
                  `;
                  return inserted[0];
             });

             return new Response(JSON.stringify(newOrder), { status: 201 });
        }

        // PUT status update (requires seller id)
        if (req.method === 'PUT') {
            const sellerId = req.headers.get('x-seller-id');
            if (!sellerId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

            const { id, status } = await req.json();
            if (!id || status === undefined) return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });

            // Verify order belongs to seller
            const order = await sql`SELECT id FROM product_orders WHERE id = ${id} AND seller_id = ${sellerId}`;
            if (order.length === 0) return new Response(JSON.stringify({ error: 'Not found or unauthorized' }), { status: 403 });

            const updated = await sql`UPDATE product_orders SET status = ${status} WHERE id = ${id} RETURNING *`;
            return new Response(JSON.stringify(updated[0]), { status: 200 });
        }
        
         // DELETE order (requires seller id)
        if (req.method === 'DELETE') {
            const sellerId = req.headers.get('x-seller-id');
            if (!sellerId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

            const { id } = await req.json();
            if (!id) return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });

            // Verify order belongs to seller
            const order = await sql`SELECT id FROM product_orders WHERE id = ${id} AND seller_id = ${sellerId}`;
            if (order.length === 0) return new Response(JSON.stringify({ error: 'Not found or unauthorized' }), { status: 403 });

            await sql`DELETE FROM product_orders WHERE id = ${id}`;
            return new Response(JSON.stringify({ success: true }), { status: 200 });
        }

        return new Response('Method Not Allowed', { status: 405 });

    } catch (e: unknown) {
        if (e instanceof Error && e.message === 'Insufficient Stock') {
             return new Response(JSON.stringify({ error: 'Not enough stock available' }), { status: 400 });
        }
        console.error('Orders error:', e);
        return new Response(JSON.stringify({ error: 'Server Error' }), { status: 500 });
    }
};
