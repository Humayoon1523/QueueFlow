import { NextResponse } from 'next/server';
import { updateOrderProximity } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { orderId, isNear, distance } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const updated = updateOrderProximity(orderId, isNear, distance);
    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: `Proximity updated for order ${orderId}`,
      order: updated
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
