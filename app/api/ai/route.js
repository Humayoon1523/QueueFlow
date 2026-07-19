import { NextResponse } from 'next/server';
import { calculateAiPredictions } from '@/lib/aiPredictor';

export const dynamic = 'force-dynamic';

export async function GET() {
  const predictions = calculateAiPredictions();
  return NextResponse.json(predictions);
}
