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
        // Fetch stock
        const { data: stockSetting } = await sql
            .from('system_settings')
            .select('value')
            .eq('key', 'rj45_stock')
            .single();
        
        if (stockSetting) {
            const currentStock = parseInt(stockSetting.value, 10);
            if (currentStock < quantity) {
                return new Response(JSON.stringify({ error: 'Not enough stock available' }), { status: 400 });
            }
            
            // Deduct stock
            await sql
                .from('system_settings')
                .update({ value: (currentStock - quantity).toString(), updated_at: new Date().toISOString() })
                .eq('key', 'rj45_stock');
        }

        const { data: newOrder, error: insertError } = await sql
          .from('rj45_orders')
          .insert({ name, quantity })
          .select()
          .single();
        
        if (insertError) throw insertError;

        return new Response(JSON.stringify(newOrder), { status: 201 });
      } catch (e: unknown) {
        console.error('Order creation error:', e);
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
      const { data: orders, error } = await sql
        .from('rj45_orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return new Response(JSON.stringify(orders), { status: 200 });
    }

    // PUT request: Update an order's status
    if (req.method === 'PUT') {
      const { id, status } = await req.json();

      if (!id || typeof status !== 'boolean') {
        return new Response(JSON.stringify({ error: 'Valid ID and Status are required' }), { status: 400 });
      }

      const { error } = await sql
        .from('rj45_orders')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      return new Response(JSON.stringify({ message: 'Order status updated successfully' }), { status: 200 });
    }

    // DELETE request: Remove an order
    if (req.method === 'DELETE') {
      const { id } = await req.json();
      
      if (!id) {
        return new Response(JSON.stringify({ error: 'ID is required' }), { status: 400 });
      }

      const { error } = await sql
        .from('rj45_orders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return new Response(JSON.stringify({ message: 'Order deleted successfully' }), { status: 200 });
    }

    return new Response('Method Not Allowed', { status: 405 });
  } catch (error) {
    console.error('Error in manage-orders:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
