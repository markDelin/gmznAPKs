import sql from './utils/db';

export default async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, x-seller-id', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS' } });
    }

    try {
        // GET can be public (for the storefront) or filtered by seller
        if (req.method === 'GET') {
            const url = new URL(req.url);
            const sellerId = url.searchParams.get('sellerId');
            
            let query = sql
                .from('sellable_products')
                .select(`
                    *,
                    seller_name:sellers(username)
                `)
                .order('created_at', { ascending: false });

            if (sellerId) {
                query = query.eq('seller_id', sellerId);
            }

            const { data: products, error } = await query;
            if (error) throw error;

            // Flatten seller_name from join result
            const flattenedProducts = products.map((p: any) => ({
                ...p,
                seller_name: p.seller_name?.username
            }));

            return new Response(JSON.stringify(flattenedProducts), { status: 200 });
        }

        // All other methods require Seller ID header
        const sellerId = req.headers.get('x-seller-id');
        if (!sellerId) return new Response(JSON.stringify({ error: 'Unauthorized Seller' }), { status: 401 });

        if (req.method === 'POST') {
            const { name, description, price, stock, category, image_url } = await req.json();
            if (!name || price === undefined || stock === undefined) return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });

            const { data: newProduct, error } = await sql
                .from('sellable_products')
                .insert({ seller_id: sellerId, name, description, price, stock, category, image_url })
                .select()
                .single();
            
            if (error) throw error;
            return new Response(JSON.stringify(newProduct), { status: 201 });
        }

        if (req.method === 'PUT') {
             const { id, name, description, price, stock, category, image_url } = await req.json();
             if (!id) return new Response(JSON.stringify({ error: 'Product ID required' }), { status: 400 });
             
             // Ensure seller owns product
             const { data: product, error: fetchError } = await sql
                .from('sellable_products')
                .select('id')
                .eq('id', id)
                .eq('seller_id', sellerId)
                .single();

             if (fetchError || !product) return new Response(JSON.stringify({ error: 'Unauthorized or not found' }), { status: 403 });

             const { data: updated, error: updateError } = await sql
                .from('sellable_products')
                .update({ name, description, price, stock, category, image_url })
                .eq('id', id)
                .select()
                .single();

             if (updateError) throw updateError;
             return new Response(JSON.stringify(updated), { status: 200 });
        }

        if (req.method === 'DELETE') {
             const { id } = await req.json();
             if (!id) return new Response(JSON.stringify({ error: 'Product ID required' }), { status: 400 });
             
             const { data: product, error: fetchError } = await sql
                .from('sellable_products')
                .select('id')
                .eq('id', id)
                .eq('seller_id', sellerId)
                .single();

             if (fetchError || !product) return new Response(JSON.stringify({ error: 'Unauthorized or not found' }), { status: 403 });

             const { error: deleteError } = await sql.from('sellable_products').delete().eq('id', id);
             if (deleteError) throw deleteError;
             
             return new Response(JSON.stringify({ success: true }), { status: 200 });
        }

        return new Response('Method Not Allowed', { status: 405 });

    } catch (e: unknown) {
        console.error('Products error:', e);
        return new Response(JSON.stringify({ error: 'Server Error' }), { status: 500 });
    }
};
