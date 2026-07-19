import { NextResponse } from 'next/server';
import { getMetrics, getOrders } from '@/lib/db';
import { calculateAiPredictions } from '@/lib/aiPredictor';

export const dynamic = 'force-dynamic';

export async function GET() {
  const metrics = getMetrics();
  const orders = getOrders();
  const aiData = calculateAiPredictions();

  return NextResponse.json({
    date: new Date().toISOString().split('T')[0],
    metrics,
    orders,
    aiData
  });
}
