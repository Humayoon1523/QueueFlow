import { NextResponse } from 'next/server';
import { verifyPaymentSignature } from '@/lib/paymentGateway';
import { updateOrderStatus } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    const isValid = verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });

    if (isValid) {
      // Mark order payment status verified in DB
      const updatedOrder = updateOrderStatus(orderId, 'PAID_VERIFIED');
      return NextResponse.json({ success: true, verified: true, order: updatedOrder });
    } else {
      return NextResponse.json({ success: false, error: 'Payment signature verification failed' }, { status: 400 });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
