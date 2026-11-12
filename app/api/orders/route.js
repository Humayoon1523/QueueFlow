import { NextResponse } from 'next/server';
import { getOrders, createOrder, updateOrderStatus, cancelOrder } from '@/lib/db';
import { calculateAiPredictions } from '@/lib/aiPredictor';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'ALL';
    const search = searchParams.get('search') || '';
    const customerPhone = searchParams.get('phone') || '';

    const orders = getOrders({ status, search, customerPhone });
    return NextResponse.json(orders);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      customerName, 
      customerPhone, 
      customerId, 
      items, 
      notes, 
      paymentMode, 
      paymentDetails 
    } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Please select at least 1 item to place a takeaway order.' }, { status: 400 });
    }

    if (!customerPhone || customerPhone.replace(/\D/g, '').length !== 10) {
      return NextResponse.json({ error: 'A valid 10-digit mobile number is required for digital token & pickup SMS.' }, { status: 400 });
    }

    const order = createOrder({
      customerName: (customerName || 'Online Takeaway Guest').trim(),
      customerPhone: customerPhone.replace(/\D/g, ''),
      customerId,
      items,
      notes,
      paymentMode: paymentMode || 'UPI',
      paymentDetails
    });

    const aiPrediction = calculateAiPredictions();

    return NextResponse.json({
      message: `Online pre-order placed successfully! Token #${order.token}`,
      order,
      aiPrediction
    }, { status: 201 });
  } catch (err) {
    console.error('Order creation error:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { orderId, status, action, reason } = body;

    let targetStatus = status;
    const act = (action || '').toUpperCase();
    if (act === 'START' || act === 'PREPARE' || act === 'PREPARING') targetStatus = 'PREPARING';
    else if (act === 'PACK' || act === 'PACKING') targetStatus = 'PACKING';
    else if (act === 'READY') targetStatus = 'READY';
    else if (act === 'DELIVER' || act === 'DELIVERED' || act === 'COMPLETE' || act === 'COMPLETED') targetStatus = 'COMPLETED';
    else if (act === 'CANCEL' || act === 'CANCELLED') targetStatus = 'CANCELLED';

    if (!targetStatus) {
      return NextResponse.json({ error: 'Valid status or action parameter is required (e.g. PREPARE, PACK, READY, DELIVER)' }, { status: 400 });
    }

    const updated = updateOrderStatus(orderId, targetStatus, { reason });
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

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId') || searchParams.get('id');
    const reason = searchParams.get('reason') || 'Cancelled by manager';

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const cancelled = cancelOrder(orderId, reason);
    return NextResponse.json({
      message: `Order #${cancelled.token} cancelled`,
      order: cancelled
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
