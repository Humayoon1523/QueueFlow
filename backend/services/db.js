/**
 * QueueFlow AI Database Store & In-Memory Data Manager
 * Handles unified queue management for Online & Walk-in orders, Token generation,
 * Menu items, Staff records, and Historical reports.
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data.json');

// Initial seed menu
const DEFAULT_MENU = [
  { id: 'm1', name: 'Special Chapathi', category: 'Main', price: 15, available: true, image: '🫓', estPrepTimeMinutes: 2 },
  { id: 'm2', name: 'Spicy Chenna Gravy', category: 'Side', price: 30, available: true, image: '🥘', estPrepTimeMinutes: 3 },
  { id: 'm3', name: 'Chapathi & Chenna Combo (3+1)', category: 'Combo', price: 70, available: true, image: '🍱', estPrepTimeMinutes: 4 },
  { id: 'm4', name: 'Sweet Lassi', category: 'Beverage', price: 25, available: true, image: '🥛', estPrepTimeMinutes: 1 }
];

let state = {
  tokenCounter: 100, // Starts token numbers at #101
  users: [
    { id: 'u1', name: 'Demo Customer', phone: '9876543210', password: 'password123', role: 'customer' },
    { id: 'u2', name: 'Restaurant Manager', phone: '9000000000', password: 'admin', role: 'manager' },
    { id: 'u3', name: 'Packing & Delivery Lead', phone: '9111111111', password: 'staff', role: 'delivery' }
  ],
  menu: DEFAULT_MENU,
  orders: [
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
      orderStatus: 'READY', // PENDING -> PREPARING -> PACKING -> READY -> DELIVERED
      assignedStaff: 'Staff - Ramesh',
      createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60000).toISOString(),
      pickupTimeEst: new Date(Date.now() + 5 * 60000).toISOString(),
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
      orderStatus: 'PREPARING',
      assignedStaff: 'Staff - Suresh',
      createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 60000).toISOString(),
      pickupTimeEst: new Date(Date.now() + 8 * 60000).toISOString(),
      notifiedCustomer: false
    },
    {
      id: 'ord-103',
      token: 103,
      customerId: 'u1',
      customerName: 'Arun V.',
      customerPhone: '9776655443',
      orderType: 'ONLINE',
      chapathiQty: 4,
      chennaQty: 1,
      totalAmount: 90,
      paymentMode: 'CARD',
      paymentStatus: 'COMPLETED',
      orderStatus: 'PENDING',
      assignedStaff: 'Unassigned',
      createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60000).toISOString(),
      pickupTimeEst: new Date(Date.now() + 12 * 60000).toISOString(),
      notifiedCustomer: false
    }
  ],
  deliveryStaff: [
    { id: 'ds1', name: 'Ramesh (Station 1)', shift: 'Morning/Peak', ordersCompleted: 42 },
    { id: 'ds2', name: 'Suresh (Station 2)', shift: 'Evening Rush', ordersCompleted: 38 }
  ]
};

// Persistence helper
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const loaded = JSON.parse(raw);
      state = { ...state, ...loaded };
    }
  } catch (err) {
    console.error('Error reading data file, using defaults:', err.message);
  }
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving data file:', err.message);
  }
}

loadData();

module.exports = {
  getState: () => state,
  
  // User Auth
  findUserByPhone: (phone) => state.users.find(u => u.phone === phone),
  createUser: (user) => {
    const newUser = { id: `u_${Date.now()}`, role: 'customer', ...user };
    state.users.push(newUser);
    saveData();
    return newUser;
  },

  // Token Generation
  getNextToken: () => {
    state.tokenCounter += 1;
    saveData();
    return state.tokenCounter;
  },

  // Order Operations
  getOrders: () => state.orders,
  getOrderById: (id) => state.orders.find(o => o.id === id),
  
  createOrder: (orderData) => {
    state.tokenCounter += 1;
    const newToken = state.tokenCounter;
    
    // Total items calculation
    const chapathiQty = parseInt(orderData.chapathiQty || 0, 10);
    const chennaQty = parseInt(orderData.chennaQty || 0, 10);
    const totalAmount = (chapathiQty * 15) + (chennaQty * 30);

    const newOrder = {
      id: `ord-${newToken}`,
      token: newToken,
      customerId: orderData.customerId || null,
      customerName: orderData.customerName || (orderData.orderType === 'WALKIN' ? 'Walk-in Guest' : 'Online Customer'),
      customerPhone: orderData.customerPhone || 'N/A',
      orderType: orderData.orderType || 'ONLINE', // ONLINE or WALKIN
      chapathiQty,
      chennaQty,
      totalAmount: orderData.totalAmount || totalAmount,
      paymentMode: orderData.paymentMode || 'ONLINE_UPI',
      paymentStatus: 'COMPLETED',
      orderStatus: 'PENDING', // PENDING -> PREPARING -> PACKING -> READY -> DELIVERED
      assignedStaff: 'Delivery/Packing Lead',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pickupTimeEst: new Date(Date.now() + Math.max(5, (state.orders.filter(o => o.orderStatus !== 'DELIVERED').length + 1) * 3) * 60000).toISOString(),
      notifiedCustomer: false
    };

    state.orders.unshift(newOrder); // newest first in unified queue
    saveData();
    return newOrder;
  },

  updateOrderStatus: (orderId, status, extra = {}) => {
    const order = state.orders.find(o => o.id === orderId || o.token === parseInt(orderId, 10));
    if (!order) return null;

    order.orderStatus = status;
    order.updatedAt = new Date().toISOString();
    
    if (extra.notifiedCustomer !== undefined) {
      order.notifiedCustomer = extra.notifiedCustomer;
    }
    
    if (status === 'DELIVERED') {
      order.completedAt = new Date().toISOString();
    }
    
    saveData();
    return order;
  },

  // Menu Operations
  getMenu: () => state.menu,
  updateMenu: (newMenu) => {
    state.menu = newMenu;
    saveData();
    return state.menu;
  },

  // Reports & Analytics Data Engine
  getMetrics: () => {
    const activeOrders = state.orders.filter(o => o.orderStatus !== 'DELIVERED');
    const completedOrders = state.orders.filter(o => o.orderStatus === 'DELIVERED' || o.orderStatus === 'COMPLETED');
    const todayRevenue = state.orders
      .filter(o => o.paymentStatus === 'COMPLETED')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const onlineCount = state.orders.filter(o => o.orderType === 'ONLINE').length;
    const walkinCount = state.orders.filter(o => o.orderType === 'WALKIN').length;

    // Aggregated kitchen demand for cooks
    const totalChapathiPreparing = activeOrders.reduce((sum, o) => sum + (o.chapathiQty || 0), 0);
    const totalChennaPreparing = activeOrders.reduce((sum, o) => sum + (o.chennaQty || 0), 0);

    return {
      totalOrdersToday: state.orders.length,
      activeQueueLength: activeOrders.length,
      completedOrdersCount: completedOrders.length,
      todayRevenue,
      onlineOrdersCount: onlineCount,
      walkinOrdersCount: walkinCount,
      totalChapathiPreparing,
      totalChennaPreparing,
      avgWaitMinutes: Math.round(activeOrders.length * 2.5 + 4)
    };
  }
};
