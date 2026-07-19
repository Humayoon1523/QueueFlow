/**
 * QueueFlow AI Server-Side Data Manager & Queue Engine (Next.js)
 * Manages central unified queue for online pre-orders and walk-in counter orders.
 * Completed/Handed-over orders are automatically moved to Order History.
 */

let globalState = globalThis.__queueFlowState;

if (!globalState) {
  globalState = {
    tokenCounter: 100,
    menu: [
      { id: 'm1', name: 'Special Hot Chapathi', category: 'Main', price: 15, available: true, image: '🫓' },
      { id: 'm2', name: 'Spicy Chenna Gravy', category: 'Side', price: 30, available: true, image: '🥘' },
      { id: 'm3', name: 'Chapathi & Chenna Combo (3+1)', category: 'Combo', price: 70, available: true, image: '🍱' },
      { id: 'm4', name: 'Sweet Lassi', category: 'Beverage', price: 25, available: true, image: '🥛' }
    ],
    orders: [
      {
        id: 'ord-100',
        token: 100,
        customerId: 'u0',
        customerName: 'Sanjay M.',
        customerPhone: '9123456789',
        orderType: 'ONLINE',
        chapathiQty: 5,
        chennaQty: 2,
        totalAmount: 135,
        paymentMode: 'ONLINE_UPI',
        paymentStatus: 'COMPLETED',
        orderStatus: 'DELIVERED', // Completed and moved to history
        assignedStaff: 'Delivery/Packing Lead',
        createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 25 * 60000).toISOString(),
        completedAt: new Date(Date.now() - 25 * 60000).toISOString(),
        notifiedCustomer: true
      },
      {
        id: 'ord-101',
        token: 101,
        customerId: 'u1',
        customerName: 'Rahul Kumar',
        customerPhone: '9876543210',
        orderType: 'ONLINE',
        chapathiQty: 6,
        chennaQty: 2,
        totalAmount: 150,
        paymentMode: 'ONLINE_UPI',
        paymentStatus: 'COMPLETED',
        orderStatus: 'READY', // Active
        assignedStaff: 'Delivery/Packing Lead',
        createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60000).toISOString(),
        notifiedCustomer: true
      },
      {
        id: 'ord-102',
        token: 102,
        customerId: null,
        customerName: 'Walk-in (Priya)',
        customerPhone: '9988776655',
        orderType: 'WALKIN',
        chapathiQty: 10,
        chennaQty: 3,
        totalAmount: 240,
        paymentMode: 'CASH',
        paymentStatus: 'COMPLETED',
        orderStatus: 'PREPARING', // Active
        assignedStaff: 'Delivery/Packing Lead',
        createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 8 * 60000).toISOString(),
        notifiedCustomer: false
      },
      {
        id: 'ord-103',
        token: 103,
        customerId: 'u2',
        customerName: 'Arun V.',
        customerPhone: '9776655443',
        orderType: 'ONLINE',
        chapathiQty: 4,
        chennaQty: 1,
        totalAmount: 90,
        paymentMode: 'CARD',
        paymentStatus: 'COMPLETED',
        orderStatus: 'PENDING', // Active
        assignedStaff: 'Delivery/Packing Lead',
        createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60000).toISOString(),
        notifiedCustomer: false
      }
    ]
  };
  globalThis.__queueFlowState = globalState;
}

export function getOrders() {
  return globalState.orders;
}

export function getOrderById(id) {
  return globalState.orders.find(o => o.id === id || o.token === parseInt(id, 10));
}

export function getMenu() {
  return globalState.menu;
}

export function createOrder({ customerName, customerPhone, orderType, chapathiQty, chennaQty, paymentMode }) {
  globalState.tokenCounter += 1;
  const newToken = globalState.tokenCounter;
  
  const cQty = parseInt(chapathiQty || 0, 10);
  const chQty = parseInt(chennaQty || 0, 10);
  const totalAmount = (cQty * 15) + (chQty * 30);

  const newOrder = {
    id: `ord-${newToken}`,
    token: newToken,
    customerName: customerName || (orderType === 'WALKIN' ? 'Walk-in Guest' : 'Online Customer'),
    customerPhone: customerPhone || 'Counter',
    orderType: orderType || 'ONLINE',
    chapathiQty: cQty,
    chennaQty: chQty,
    totalAmount,
    paymentMode: paymentMode || 'ONLINE_UPI',
    paymentStatus: 'COMPLETED',
    orderStatus: 'PENDING',
    assignedStaff: 'Delivery/Packing Staff',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notifiedCustomer: false
  };

  globalState.orders.unshift(newOrder);
  return newOrder;
}

export function updateOrderStatus(id, status, extra = {}) {
  const order = getOrderById(id);
  if (!order) return null;

  order.orderStatus = status;
  order.updatedAt = new Date().toISOString();
  if (extra.notifiedCustomer !== undefined) {
    order.notifiedCustomer = extra.notifiedCustomer;
  }
  if (status === 'DELIVERED') {
    order.completedAt = new Date().toISOString();
  }
  return order;
}

export function getMetrics() {
  const activeOrders = globalState.orders.filter(o => o.orderStatus !== 'DELIVERED');
  const completedOrders = globalState.orders.filter(o => o.orderStatus === 'DELIVERED');
  const todayRevenue = globalState.orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const onlineCount = globalState.orders.filter(o => o.orderType === 'ONLINE').length;
  const walkinCount = globalState.orders.filter(o => o.orderType === 'WALKIN').length;

  const totalChapathiPreparing = activeOrders.reduce((sum, o) => sum + (o.chapathiQty || 0), 0);
  const totalChennaPreparing = activeOrders.reduce((sum, o) => sum + (o.chennaQty || 0), 0);

  return {
    totalOrdersToday: globalState.orders.length,
    activeQueueLength: activeOrders.length,
    completedOrdersCount: completedOrders.length,
    todayRevenue,
    onlineOrdersCount: onlineCount,
    walkinOrdersCount: walkinCount,
    totalChapathiPreparing,
    totalChennaPreparing,
    avgWaitMinutes: Math.max(4, Math.round(activeOrders.length * 2.5 + 3))
  };
}
