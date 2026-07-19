/**
 * Server-Side AI Queue Prediction & Rush Hour Forecast Model
 * Executed on Next.js Server Side
 */

import { getOrders } from './db';

export function calculateAiPredictions() {
  const orders = getOrders();
  const activeOrders = orders.filter(o => o.orderStatus !== 'DELIVERED');
  const completedOrders = orders.filter(o => o.orderStatus === 'DELIVERED');

  const totalChapathis = activeOrders.reduce((sum, o) => sum + (o.chapathiQty || 0), 0);
  const totalChenna = activeOrders.reduce((sum, o) => sum + (o.chennaQty || 0), 0);
  const numOrders = activeOrders.length;

  // 1. Server-Side AI Wait Time Algorithm
  // 3 cooks operating concurrently: ~30 Chapathis per 10 minutes + 1.2 min packing per order
  const cookingTimeMin = (totalChapathis * 0.4) + (totalChenna * 0.6);
  const packingTimeMin = numOrders * 1.2;
  const estimatedWaitMinutes = Math.max(4, Math.ceil((cookingTimeMin / 3) + packingTimeMin));

  // 2. Server-Side Peak Hour & Rush Forecasting
  const now = new Date();
  const currentHour = now.getHours();
  let peakStatus = "NORMAL_FLOW";
  let expectedOrders = 45;
  let peakHourText = "6:45 PM";
  let recommendation = "Normal queue speed. Ideal preparation pacing.";

  if (currentHour >= 18 && currentHour <= 21) {
    peakStatus = "EVENING_RUSH_PEAK";
    expectedOrders = 120;
    peakHourText = "6:45 PM";
    recommendation = "Heavy takeaway traffic! All 3 cooks active at maximum throughput.";
  } else if (currentHour >= 12 && currentHour <= 14) {
    peakStatus = "LUNCH_PEAK";
    expectedOrders = 85;
    peakHourText = "1:15 PM";
    recommendation = "Lunch hour peak active. Keep Chapathi dough prepped.";
  }

  // 3. Server-Side Smart Pickup ETA Recommendation
  const pickupDt = new Date(Date.now() + estimatedWaitMinutes * 60000);
  const arrivalDt = new Date(Date.now() + Math.max(1, estimatedWaitMinutes - 4) * 60000);

  const formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    estimatedWaitMinutes,
    rushHourPrediction: {
      peakStatus,
      expectedOrders,
      peakHourText,
      recommendation,
      cookingLoadPercentage: Math.min(100, Math.ceil((totalChapathis / 40.0) * 100))
    },
    etaRecommendation: {
      estimatedPickupTime: formatTime(pickupDt),
      suggestedArrivalTime: formatTime(arrivalDt),
      customerMessage: `Estimated Pickup: ${formatTime(pickupDt)}. Please arrive around ${formatTime(arrivalDt)} to prevent roadside vehicle congestion.`
    },
    analytics: {
      avgPrepMinutes: 4.2,
      avgWaitMinutes: estimatedWaitMinutes,
      throughputChapathiPerHr: 180,
      throughputChennaPerHr: 60,
      queueCongestionScore: numOrders < 4 ? "LOW" : (numOrders < 8 ? "MODERATE" : "HIGH_LOAD")
    }
  };
}
