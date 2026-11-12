import { NextResponse } from 'next/server';
import { updateOrderStatus, getOrderById, addNotification, markNotificationRead } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    const { orderId, notificationId, action } = body;

    if (action === 'mark_read' && notificationId) {
      const updated = markNotificationRead(notificationId);
      return NextResponse.json({ success: true, notification: updated });
    }

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const order = getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updated = updateOrderStatus(order.id, order.orderStatus, { notifiedCustomer: true });

    addNotification({
      type: 'CUSTOMER_ALERT_SENT',
      title: `SMS & Push Dispatched: Token #${order.token}`,
      message: `Pickup ready alert sent to ${order.customerName} (${order.customerPhone})`,
      orderId: order.id,
      token: order.token
    });

    return NextResponse.json({
      message: `Customer alert dispatched for Token #${order.token}`,
      order: updated
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
