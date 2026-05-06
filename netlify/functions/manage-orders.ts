import sql from './utils/db';

export default async (req: Request) => {
  try {
    // POST request: Create a new order
    if (req.method === 'POST') {
      const { name, quantity } = await req.json();

      if (!name || typeof quantity !== 'number' || quantity <= 0) {
        return new Response(JSON.stringify({ error: 'Valid Name and Quantity are required' }), { status: 400 });
      }

      try {
        const newOrder = await sql.begin(async (tx: any) => {
            // Check stock using row lock if it exists
            const [stockSetting] = await tx`
              SELECT value FROM system_settings WHERE key = 'rj45_stock' FOR UPDATE
            `;
            
            if (stockSetting) {
                const currentStock = parseInt(stockSetting.value, 10);
                if (currentStock < quantity) {
                    throw new Error('Insufficient Stock');
                }
                
                // Deduct stock
                await tx`
                    UPDATE system_settings
                    SET value = ${(currentStock - quantity).toString()}, updated_at = NOW()
                    WHERE key = 'rj45_stock'
                `;
            }

            const inserted = await tx`
              INSERT INTO rj45_orders (name, quantity)
              VALUES (${name}, ${quantity})
              RETURNING *
            `;
            return inserted[0];
        });

        return new Response(JSON.stringify(newOrder), { status: 201 });
      } catch (e: unknown) {
        if (e instanceof Error && e.message === 'Insufficient Stock') {
             return new Response(JSON.stringify({ error: 'Not enough stock available' }), { status: 400 });
        }
        throw e;
      }
    }

    // Auth check for GET and DELETE (Admin only)
    const adminPassword = req.headers.get('x-admin-password');
    const storedPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || adminPassword !== storedPassword) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // GET request: Fetch all orders for the dashboard
    if (req.method === 'GET') {
      try {
          await sql`ALTER TABLE rj45_orders ADD COLUMN IF NOT EXISTS status BOOLEAN DEFAULT false`;
          await sql`UPDATE rj45_orders SET status = false WHERE status IS NULL`;
      } catch (e) {
          console.error("DB alter error (safe to ignore if already applied):", e);
      }
      
      const orders = await sql`
        SELECT * FROM rj45_orders
        ORDER BY created_at DESC
      `;
      return new Response(JSON.stringify(orders), { status: 200 });
    }

    // PUT request: Update an order's status
    if (req.method === 'PUT') {
      const { id, status } = await req.json();

      if (!id || typeof status !== 'boolean') {
        return new Response(JSON.stringify({ error: 'Valid ID and Status are required' }), { status: 400 });
      }

      await sql`
        UPDATE rj45_orders
        SET status = ${status}
        WHERE id = ${id}
      `;
      
      return new Response(JSON.stringify({ message: 'Order status updated successfully' }), { status: 200 });
    }

    // DELETE request: Remove an order
    if (req.method === 'DELETE') {
      const { id } = await req.json();
      
      if (!id) {
        return new Response(JSON.stringify({ error: 'ID is required' }), { status: 400 });
      }

      await sql`
        DELETE FROM rj45_orders
        WHERE id = ${id}
      `;
      
      return new Response(JSON.stringify({ message: 'Order deleted successfully' }), { status: 200 });
    }

    return new Response('Method Not Allowed', { status: 405 });
  } catch (error) {
    console.error('Error in manage-orders:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
