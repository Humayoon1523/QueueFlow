import { NextResponse } from 'next/server';
import { createPaymentOrder } from '@/lib/paymentGateway';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId, amount, customerName, customerPhone } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid order amount' }, { status: 400 });
    }

    const gatewayOrder = await createPaymentOrder({
      orderId,
      amount,
      customerName,
      customerPhone
    });

    return NextResponse.json(gatewayOrder);
  } catch (error) {
    console.error('Payment order creation error:', error);
    return NextResponse.json({ error: 'Payment gateway creation failed' }, { status: 500 });
  }
}
