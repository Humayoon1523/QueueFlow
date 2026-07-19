import { NextResponse } from 'next/server';
import { updateOrderStatus, getOrderById } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { orderId } = await req.json();
    const order = getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updated = updateOrderStatus(order.id, order.orderStatus, { notifiedCustomer: true });
    return NextResponse.json({
      message: `Customer notified for Token #${order.token}`,
      order: updated
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
