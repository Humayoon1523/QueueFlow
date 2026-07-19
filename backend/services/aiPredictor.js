/**
 * Node.js AI Predictor Service
 * Calls Python script backend/ai/predict.py or fallback math model
 */

const { exec } = require('child_process');
const path = require('path');
const db = require('./db');

function predictQueueMetrics() {
  return new Promise((resolve) => {
    const orders = db.getOrders();
    const activeOrders = orders.filter(o => o.orderStatus !== 'DELIVERED');
    const completedOrders = orders.filter(o => o.orderStatus === 'DELIVERED');

    const inputData = JSON.stringify({ active_orders: activeOrders, completed_orders: completedOrders });
    const pyScript = path.join(__dirname, '../ai/predict.py');

    // Run python script with input data piped in stdin
    const child = exec(`python "${pyScript}"`, (error, stdout) => {
      if (!error && stdout) {
        try {
          const aiResult = JSON.parse(stdout);
          return resolve(aiResult);
        } catch (e) {
          // fall through to fallback
        }
      }
      
      // JavaScript Fallback Model
      const totalChapathis = activeOrders.reduce((sum, o) => sum + (o.chapathiQty || 0), 0);
      const totalChenna = activeOrders.reduce((sum, o) => sum + (o.chennaQty || 0), 0);
      const numOrders = activeOrders.length;

      const waitMinutes = Math.max(4, Math.ceil((totalChapathis * 0.4 + totalChenna * 0.6) / 3 + numOrders * 1.2));
      const pickupDate = new Date(Date.now() + waitMinutes * 60000);
      const arrivalDate = new Date(Date.now() + Math.max(1, waitMinutes - 3) * 60000);

      const formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      resolve({
        estimatedWaitMinutes: waitMinutes,
        rushHourPrediction: {
          peakStatus: numOrders > 6 ? "HIGH_RUSH" : "NORMAL",
          expectedOrders: 120,
          peakHourText: "6:45 PM",
          recommendation: "3 Cooks working at high efficiency. Dough batch prepped.",
          cookingLoadPercentage: Math.min(100, Math.ceil((totalChapathis / 40.0) * 100))
        },
        etaRecommendation: {
          estimatedPickupTime: formatTime(pickupDate),
          suggestedArrivalTime: formatTime(arrivalDate),
          customerMessage: `Estimated Pickup: ${formatTime(pickupDate)}. Please arrive around ${formatTime(arrivalDate)} to prevent traffic congestion.`
        },
        analytics: {
          avgPrepMinutes: 4.5,
          avgWaitMinutes: waitMinutes,
          throughputChapathiPerHr: 180,
          throughputChennaPerHr: 60,
          queueCongestionScore: numOrders < 4 ? "LOW" : (numOrders < 8 ? "MEDIUM" : "HIGH")
        }
      });
    });

    if (child.stdin) {
      child.stdin.write(inputData);
      child.stdin.end();
    }
  });
}

module.exports = {
  predictQueueMetrics
};
