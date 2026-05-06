import { Context } from "@netlify/functions";
import sql from './utils/db';

export default async (req: Request, context: Context) => {
  try {
    if (req.method !== 'GET') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // Fetch the 15 most recent orders
    const orders = await sql`
      SELECT id, name, quantity, created_at
      FROM rj45_orders
      ORDER BY created_at DESC
      LIMIT 15
    `;

    // Anonymize names
    const anonymizedOrders = orders.map(order => {
      const nameParts = order.name.trim().split(/\s+/);
      const anonymizedName = nameParts.map((part: string) => {
        if (part.length <= 1) return part;
        return part.charAt(0).toUpperCase() + '*'.repeat(part.length - 1);
      }).join(' ');

      return {
        id: order.id,
        name: anonymizedName,
        quantity: order.quantity,
        created_at: order.created_at
      };
    });

    return new Response(JSON.stringify(anonymizedOrders), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60' // Cache for 60 seconds to reduce DB load
      }
    });

  } catch (error) {
    console.error('Error in get-orders:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
