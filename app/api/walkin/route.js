import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/db';
import { calculateAiPredictions } from '@/lib/aiPredictor';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    const { customerName, customerPhone, chapathiQty, chennaQty, paymentMode } = body;

    if ((!chapathiQty || chapathiQty <= 0) && (!chennaQty || chennaQty <= 0)) {
      return NextResponse.json({ error: 'Walk-in order must have at least 1 item.' }, { status: 400 });
    }

    const order = createOrder({
      customerName: customerName || 'Walk-in Guest',
      customerPhone: customerPhone || 'Counter',
      orderType: 'WALKIN',
      chapathiQty,
      chennaQty,
      paymentMode: paymentMode || 'CASH'
    });

    const aiPrediction = calculateAiPredictions();

    return NextResponse.json({
      message: 'Walk-in token generated successfully!',
      order,
      aiPrediction
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
