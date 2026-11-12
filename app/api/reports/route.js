import { NextResponse } from 'next/server';
import { 
  getMetrics, 
  getOrders, 
  getStations, 
  getSystemConfig, 
  getNotifications, 
  getAuditLogs 
} from '@/lib/db';
import { calculateAiPredictions } from '@/lib/aiPredictor';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const metrics = getMetrics();
    const orders = getOrders();
    const aiData = calculateAiPredictions();
    const stations = getStations();
    const systemConfig = getSystemConfig();
    const notifications = getNotifications();
    const auditLogs = getAuditLogs();

    return NextResponse.json({
      date: new Date().toISOString().split('T')[0],
      metrics,
      orders,
      aiData,
      stations,
      systemConfig,
      notifications,
      auditLogs
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
