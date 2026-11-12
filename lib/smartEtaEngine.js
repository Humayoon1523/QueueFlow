/**
 * QueueFlow Smart ETA & Kitchen Workload Scheduling Engine
 * Real, deterministic, resource-aware kitchen scheduling engine.
 *
 * Models station concurrency, item batch capacities, parallel preparation across
 * independent kitchen stations, packing station queueing, and uncertainty buffers.
 */

/**
 * Default kitchen stations configuration
 */
export const DEFAULT_STATIONS = [
  {
    id: 'main_kitchen',
    name: 'Main Kitchen (Curries & Gravies)',
    capacity: 2, // 2 concurrent cooking burners / slots
    color: '#6366f1'
  },
  {
    id: 'tawa_station',
    name: 'Tawa & Bread Station',
    capacity: 3, // 3 concurrent tawa plates
    color: '#f59e0b'
  },
  {
    id: 'biryani_station',
    name: 'Biryani & Rice Station',
    capacity: 2, // 2 portioning / heating slots
    color: '#ec4899'
  },
  {
    id: 'fryer_station',
    name: 'Fryer & Starters Station',
    capacity: 2, // 2 frying vats
    color: '#f97316'
  },
  {
    id: 'beverage_station',
    name: 'Beverage & Dessert Counter',
    capacity: 2, // 2 dispensing points
    color: '#06b6d4'
  }
];

export const DEFAULT_SYSTEM_CONFIG = {
  packingDurationMinutes: 1.5, // Time for packing staff to collect, bag, and seal order
  bufferMinutes: 2.0,          // Uncertainty buffer for unexpected kitchen variances
  maxActiveQueueWarning: 15,   // Threshold for high-load alert
  taxRatePercent: 5,           // 5% GST
  packagingFee: 10             // Eco-friendly takeaway container fee (INR)
};

/**
 * Calculate preparation workload for an individual order across kitchen stations
 * @param {Array} items - Array of order items with { id, qty, prepDuration, batchCapacity, station }
 * @param {Array} menuCatalog - Full menu catalog with preparation profiles
 * @returns {Object} Workload breakdown by station ID
 */
export function calculateOrderWorkload(items, menuCatalog = []) {
  const stationWork = {};

  if (!Array.isArray(items) || items.length === 0) {
    return stationWork;
  }

  const menuMap = new Map();
  menuCatalog.forEach(m => menuMap.set(m.id, m));

  for (const item of items) {
    const menuItem = menuMap.get(item.id) || item;
    const stationId = menuItem.station || 'main_kitchen';
    const prepDuration = Number(menuItem.prepDuration) || 5; // minutes per batch
    const batchCapacity = Math.max(1, Number(menuItem.batchCapacity) || 4); // items cooked together
    const qty = Math.max(1, Number(item.qty) || 1);

    const batches = Math.ceil(qty / batchCapacity);
    const itemTotalMinutes = batches * prepDuration;

    if (!stationWork[stationId]) {
      stationWork[stationId] = {
        stationId,
        stationName: menuItem.stationName || stationId,
        totalMinutes: 0,
        items: []
      };
    }

    stationWork[stationId].totalMinutes += itemTotalMinutes;
    stationWork[stationId].items.push({
      id: item.id,
      name: item.name || menuItem.name,
      qty,
      batches,
      prepDuration,
      batchCapacity,
      itemTotalMinutes
    });
  }

  return stationWork;
}

/**
 * Format a Date object into 12-hour time string (e.g., "7:25 PM")
 */
export function formatTime12(date) {
  if (!date || isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Format a pickup time window (e.g. "7:20 PM – 7:25 PM")
 */
export function formatPickupWindow(pickupDate, bufferMinutes = 2) {
  if (!pickupDate || isNaN(pickupDate.getTime())) return '--:--';
  const startWindow = new Date(pickupDate.getTime() - Math.max(1, bufferMinutes - 1) * 60000);
  const endWindow = new Date(pickupDate.getTime() + Math.max(2, bufferMinutes) * 60000);
  return `${formatTime12(startWindow)} – ${formatTime12(endWindow)}`;
}

/**
 * Resource-Aware Queue Simulation & ETA Engine
 * Simulates station slot releases and packing queue for all active orders in FIFO order.
 *
 * @param {Array} activeOrders - List of active orders (PENDING, PREPARING, PACKING)
 * @param {Array} stations - Kitchen stations configuration with capacities
 * @param {Array} menuCatalog - Full menu with preparation profiles
 * @param {Object} systemConfig - Packing duration, buffer, etc.
 * @returns {Map} Map of orderId => calculated ETA details
 */
export function simulateKitchenQueue(activeOrders = [], stations = DEFAULT_STATIONS, menuCatalog = [], systemConfig = DEFAULT_SYSTEM_CONFIG) {
  const now = Date.now();
  const results = new Map();

  const stationMap = new Map();
  stations.forEach(st => {
    stationMap.set(st.id, {
      ...st,
      // Array of release timestamps for each concurrent slot
      slotAvailableAt: new Array(Math.max(1, st.capacity || 1)).fill(now)
    });
  });

  // Packing station timeline (can pack up to 2 orders concurrently)
  const packingSlots = [now, now];
  const packingDurationMs = (systemConfig.packingDurationMinutes || 1.5) * 60000;
  const bufferMs = (systemConfig.bufferMinutes || 2.0) * 60000;

  // Filter to active orders in FIFO sequence
  const validActiveOrders = activeOrders.filter(o => 
    o.orderStatus === 'PENDING' || o.orderStatus === 'PREPARING' || o.orderStatus === 'PACKING'
  ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  validActiveOrders.forEach((order, queueIndex) => {
    const orderCreatedAt = new Date(order.createdAt).getTime() || now;
    const baseTime = Math.max(now, orderCreatedAt);

    // If order is already in PACKING stage, food prep is finished
    if (order.orderStatus === 'PACKING') {
      const earliestPackingSlot = Math.min(...packingSlots);
      const slotIndex = packingSlots.indexOf(earliestPackingSlot);
      const packingStart = Math.max(baseTime, earliestPackingSlot);
      const packingEnd = packingStart + packingDurationMs;
      packingSlots[slotIndex] = packingEnd;

      const completionTime = new Date(packingEnd + bufferMs);
      const totalWaitMinutes = Math.max(1, Math.round((completionTime.getTime() - now) / 60000));

      results.set(order.id, {
        queuePosition: queueIndex + 1,
        ordersAhead: queueIndex,
        estimatedPrepDuration: 2,
        estimatedWaitMinutes: totalWaitMinutes,
        estimatedPickupTime: completionTime.toISOString(),
        estimatedPickupWindow: formatPickupWindow(completionTime, systemConfig.bufferMinutes),
        isDelayed: completionTime.getTime() < now && order.orderStatus !== 'READY',
        delayMinutes: completionTime.getTime() < now ? Math.round((now - completionTime.getTime()) / 60000) : 0,
        stationBreakdown: {}
      });
      return;
    }

    // Calculate workload across stations
    const workload = calculateOrderWorkload(order.items || [], menuCatalog);
    const stationCompletionTimes = [];

    // Schedule each required station
    Object.keys(workload).forEach(stationId => {
      const work = workload[stationId];
      let stationConfig = stationMap.get(stationId);
      if (!stationConfig) {
        // Fallback default station
        stationConfig = {
          id: stationId,
          name: stationId,
          capacity: 2,
          slotAvailableAt: [now, now]
        };
        stationMap.set(stationId, stationConfig);
      }

      const totalWorkMinutes = work.totalMinutes;
      const workMs = totalWorkMinutes * 60000;

      // Find earliest available slot on this station
      const earliestSlotTime = Math.min(...stationConfig.slotAvailableAt);
      const slotIndex = stationConfig.slotAvailableAt.indexOf(earliestSlotTime);

      // Start cooking when the slot is free and after order arrived / current time
      // If order is already PREPARING, remaining work is adjusted
      let actualStartTime = Math.max(baseTime, earliestSlotTime);
      let remainingWorkMs = workMs;

      if (order.orderStatus === 'PREPARING' && order.prepStartedAt) {
        const prepStart = new Date(order.prepStartedAt).getTime();
        const elapsedMs = Math.max(0, now - prepStart);
        remainingWorkMs = Math.max(30000, workMs - elapsedMs);
        actualStartTime = now;
      }

      const finishTime = actualStartTime + remainingWorkMs;
      stationConfig.slotAvailableAt[slotIndex] = finishTime;
      stationCompletionTimes.push(finishTime);
    });

    // Food prep finishes when the slowest station finishes
    const foodReadyTime = stationCompletionTimes.length > 0 
      ? Math.max(...stationCompletionTimes)
      : baseTime + 3 * 60000;

    // Schedule Packing Station after food prep is done
    const earliestPackingSlot = Math.min(...packingSlots);
    const packingSlotIndex = packingSlots.indexOf(earliestPackingSlot);
    const packingStart = Math.max(foodReadyTime, earliestPackingSlot);
    const packingEnd = packingStart + packingDurationMs;
    packingSlots[packingSlotIndex] = packingEnd;

    // Final pickup time = packing completion + uncertainty buffer
    const completionTime = new Date(packingEnd + bufferMs);
    const estimatedPrepDuration = Math.max(3, Math.round((foodReadyTime - baseTime) / 60000));
    const totalWaitMinutes = Math.max(3, Math.round((completionTime.getTime() - now) / 60000));

    const isDelayed = order.estimatedPickupTime && new Date(order.estimatedPickupTime).getTime() < now && order.orderStatus !== 'READY';
    const delayMinutes = isDelayed ? Math.round((now - new Date(order.estimatedPickupTime).getTime()) / 60000) : 0;

    results.set(order.id, {
      queuePosition: queueIndex + 1,
      ordersAhead: queueIndex,
      estimatedPrepDuration,
      estimatedWaitMinutes: totalWaitMinutes,
      estimatedPickupTime: completionTime.toISOString(),
      estimatedPickupWindow: formatPickupWindow(completionTime, systemConfig.bufferMinutes),
      isDelayed,
      delayMinutes,
      stationBreakdown: workload
    });
  });

  return results;
}

/**
 * Calculate single order instant ETA estimate (for pre-checkout estimates)
 */
export function calculateInstantEstimate(items = [], activeOrders = [], stations = DEFAULT_STATIONS, menuCatalog = [], systemConfig = DEFAULT_SYSTEM_CONFIG) {
  const fakeOrder = {
    id: 'instant-calc-preview',
    orderStatus: 'PENDING',
    createdAt: new Date().toISOString(),
    items: items
  };

  const queueWithNewOrder = [...activeOrders, fakeOrder];
  const simulation = simulateKitchenQueue(queueWithNewOrder, stations, menuCatalog, systemConfig);
  const estimate = simulation.get('instant-calc-preview');

  if (!estimate) {
    const now = new Date();
    const fallbackPickup = new Date(now.getTime() + 15 * 60000);
    return {
      estimatedWaitMinutes: 15,
      estimatedPrepDuration: 12,
      estimatedPickupTime: fallbackPickup.toISOString(),
      estimatedPickupWindow: formatPickupWindow(fallbackPickup, 2),
      queuePosition: activeOrders.length + 1,
      ordersAhead: activeOrders.length
    };
  }

  return estimate;
}

/**
 * Calculate the total estimated time required to complete ALL orders currently in queue.
 * @param {Array} activeOrders - Array of active orders
 * @param {Array} stations - Kitchen stations configuration
 * @param {Array} menuCatalog - Full menu catalog
 * @param {Object} systemConfig - System configuration parameters
 * @returns {Object} Total clearance time in minutes, formatted string, and target completion time
 */
export function calculateTotalQueueClearanceTime(activeOrders = [], stations = DEFAULT_STATIONS, menuCatalog = [], systemConfig = DEFAULT_SYSTEM_CONFIG) {
  const validActiveOrders = activeOrders.filter(o => 
    o.orderStatus === 'PENDING' || o.orderStatus === 'PREPARING' || o.orderStatus === 'PACKING'
  );

  if (validActiveOrders.length === 0) {
    return {
      totalClearanceMinutes: 0,
      totalClearanceFormatted: '0 mins',
      completionTargetTime: 'All Orders Completed',
      activeOrderCount: 0
    };
  }

  const simulation = simulateKitchenQueue(validActiveOrders, stations, menuCatalog, systemConfig);
  let maxCompletionMs = Date.now();
  let found = false;

  simulation.forEach(est => {
    if (est.estimatedPickupTime) {
      const ms = new Date(est.estimatedPickupTime).getTime();
      if (ms > maxCompletionMs) {
        maxCompletionMs = ms;
        found = true;
      }
    }
  });

  const now = Date.now();
  const diffMinutes = found 
    ? Math.max(1, Math.round((maxCompletionMs - now) / 60000))
    : Math.max(2, validActiveOrders.length * 4);

  const completionDate = new Date(maxCompletionMs);
  const timeFormatted = completionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    totalClearanceMinutes: diffMinutes,
    totalClearanceFormatted: `${diffMinutes} mins`,
    completionTargetTime: timeFormatted,
    activeOrderCount: validActiveOrders.length
  };
}

