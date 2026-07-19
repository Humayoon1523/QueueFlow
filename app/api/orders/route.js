import { NextResponse } from 'next/server';
import { getOrders, createOrder, updateOrderStatus } from '@/lib/db';
import { calculateAiPredictions } from '@/lib/aiPredictor';

export const dynamic = 'force-dynamic';

export async function GET() {
  const orders = getOrders();
  return NextResponse.json(orders);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { customerName, customerPhone, chapathiQty, chennaQty, paymentMode } = body;

    if ((!chapathiQty || chapathiQty <= 0) && (!chennaQty || chennaQty <= 0)) {
      return NextResponse.json({ error: 'Please select at least 1 Chapathi or 1 Chenna.' }, { status: 400 });
    }

    const order = createOrder({
      customerName,
      customerPhone,
      orderType: 'ONLINE',
      chapathiQty,
      chennaQty,
      paymentMode: paymentMode || 'ONLINE_UPI'
    });

    const aiPrediction = calculateAiPredictions();

    return NextResponse.json({
      message: 'Online pre-order placed successfully!',
      order,
      aiPrediction
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { orderId, status, action } = body;

    let targetStatus = status;
    if (action === 'start') targetStatus = 'PREPARING';
    if (action === 'ready') targetStatus = 'READY';
    if (action === 'delivered') targetStatus = 'DELIVERED';

    const updated = updateOrderStatus(orderId, targetStatus);
    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const aiPrediction = calculateAiPredictions();

    return NextResponse.json({
      message: `Order #${updated.token} status updated to ${updated.orderStatus}`,
      order: updated,
      aiPrediction
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
