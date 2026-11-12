import fs from 'fs';
import path from 'path';
import { 
  DEFAULT_STATIONS, 
  DEFAULT_SYSTEM_CONFIG, 
  simulateKitchenQueue, 
  formatPickupWindow 
} from './smartEtaEngine';

/**
 * QueueFlow Intelligent Database & Order Queue State Manager
 * Strictly online takeaway platform with dynamic menu, kitchen stations,
 * real-time FIFO queue scheduling, and automated ETA calculation.
 */

const STORE_PATH = path.join(process.cwd(), 'lib', 'db_store.json');

export const INITIAL_CATEGORIES = [
  'All Items',
  'Biryani & Rice',
  'Mains & Curries',
  'Tawa Breads',
  'Starters',
  'Combos & Meals',
  'Beverages & Desserts'
];

export const INITIAL_MENU = [
  {
    id: 'item-101',
    name: 'Hyderabadi Dum Chicken Biryani',
    category: 'Biryani & Rice',
    price: 180,
    available: true,
    foodType: 'NON_VEG',
    image: '🍗',
    description: 'Long-grain aged basmati rice layered with succulent spiced chicken, saffron, and caramelised onions',
    prepDuration: 6,
    station: 'biryani_station',
    batchCapacity: 3,
    prepInstructions: 'Serve with fresh mint raita and mirchi ka salan'
  },
  {
    id: 'item-102',
    name: 'Paneer Dum Biryani (Royal Veg)',
    category: 'Biryani & Rice',
    price: 150,
    available: true,
    foodType: 'VEG',
    image: '🍚',
    description: 'Aromatic basmati rice cooked on dum with marinated malai paneer cubes, whole spices, and herbs',
    prepDuration: 6,
    station: 'biryani_station',
    batchCapacity: 3,
    prepInstructions: 'Garnish with fried cashews & brown onions'
  },
  {
    id: 'item-103',
    name: 'Special Hot Chapathi (Set of 2)',
    category: 'Tawa Breads',
    price: 30,
    available: true,
    foodType: 'VEG',
    image: '🫓',
    description: 'Tawa-fresh, 100% whole wheat soft layered hot chapathis lightly brushed with pure ghee',
    prepDuration: 4,
    station: 'tawa_station',
    batchCapacity: 4,
    prepInstructions: 'Keep hot in foil wrap'
  },
  {
    id: 'item-104',
    name: 'Butter Garlic Naan',
    category: 'Tawa Breads',
    price: 45,
    available: true,
    foodType: 'VEG',
    image: '🥖',
    description: 'Hand-stretched tawa naan infused with minced garlic and topped with melting Amul butter',
    prepDuration: 5,
    station: 'tawa_station',
    batchCapacity: 2,
    prepInstructions: 'Crisp bottom, soft airy top'
  },
  {
    id: 'item-105',
    name: 'Paneer Butter Masala',
    category: 'Mains & Curries',
    price: 140,
    available: true,
    foodType: 'VEG',
    image: '🥘',
    description: 'Cottage cheese simmered in a velvety rich tomato-cashew satin gravy with kasuri methi',
    prepDuration: 7,
    station: 'main_kitchen',
    batchCapacity: 3,
    prepInstructions: 'Medium spice, swirl of fresh cream'
  },
  {
    id: 'item-106',
    name: 'Authentic Punjabi Chenna Masala',
    category: 'Mains & Curries',
    price: 80,
    available: true,
    foodType: 'VEG',
    image: '🍲',
    description: 'Slow-simmered dark spiced chickpeas tempered with carom seeds, ginger juliennes, and amchur',
    prepDuration: 5,
    station: 'main_kitchen',
    batchCapacity: 4,
    prepInstructions: 'Includes raw onion rings & lemon wedge'
  },
  {
    id: 'item-107',
    name: 'Crispy Paneer 65',
    category: 'Starters',
    price: 130,
    available: true,
    foodType: 'VEG',
    image: '🧆',
    description: 'Crispy batter-fried paneer tossed with curry leaves, crushed pepper, and tangy South-Indian masala',
    prepDuration: 7,
    station: 'fryer_station',
    batchCapacity: 2,
    prepInstructions: 'Serve hot with spicy dip'
  },
  {
    id: 'item-108',
    name: 'Chapathi & Curry Feast Combo',
    category: 'Combos & Meals',
    price: 120,
    available: true,
    foodType: 'VEG',
    image: '🍱',
    description: '4 Hot Chapathis + 1 Container Punjabi Chenna Gravy + Gulab Jamun + Onions & Lemon',
    prepDuration: 6,
    station: 'tawa_station',
    batchCapacity: 2,
    prepInstructions: 'Pack in 3-compartment takeaway box'
  },
  {
    id: 'item-109',
    name: 'Sweet Punjabi Lassi',
    category: 'Beverages & Desserts',
    price: 40,
    available: true,
    foodType: 'VEG',
    image: '🥛',
    description: 'Thick hand-churned fresh yoghurt lassi flavoured with cardamom, rose water, and pistachios',
    prepDuration: 2,
    station: 'beverage_station',
    batchCapacity: 4,
    prepInstructions: 'Serve thoroughly chilled'
  },
  {
    id: 'item-110',
    name: 'Warm Gulab Jamun (2 pcs)',
    category: 'Beverages & Desserts',
    price: 45,
    available: true,
    foodType: 'VEG',
    image: '🍯',
    description: 'Golden fried khoya dumplings soaked in fragrant cardamom & saffron sugar syrup',
    prepDuration: 2,
    station: 'beverage_station',
    batchCapacity: 4,
    prepInstructions: 'Seal container tightly to prevent syrup leakage'
  }
];

function getSampleOrders() {
  const now = Date.now();
  return [
    {
      id: 'ord-101',
      token: 101,
      customerId: 'cust-01',
      customerName: 'Anand Sharma',
      customerPhone: '9876543210',
      orderType: 'ONLINE',
      items: [
        { id: 'item-101', name: 'Hyderabadi Dum Chicken Biryani', price: 180, qty: 1, image: '🍗', station: 'biryani_station', prepDuration: 6 },
        { id: 'item-109', name: 'Sweet Punjabi Lassi', price: 40, qty: 1, image: '🥛', station: 'beverage_station', prepDuration: 2 }
      ],
      notes: 'Make it extra spicy, please',
      subtotal: 220,
      packagingFee: 10,
      tax: 11,
      totalAmount: 241,
      paymentMode: 'UPI',
      paymentStatus: 'COMPLETED',
      paymentDetails: {
        transactionId: 'UPI_TXN_98765432',
        provider: 'Razorpay / UPI',
        paidAt: new Date(now - 12 * 60000).toISOString()
      },
      orderStatus: 'READY',
      assignedStaff: 'Packing Lead (Counter 1)',
      createdAt: new Date(now - 12 * 60000).toISOString(),
      updatedAt: new Date(now - 2 * 60000).toISOString(),
      prepStartedAt: new Date(now - 10 * 60000).toISOString(),
      packingStartedAt: new Date(now - 4 * 60000).toISOString(),
      readyAt: new Date(now - 2 * 60000).toISOString(),
      completedAt: null,
      cancelledAt: null,
      notifiedCustomer: true,
      estimatedPrepDuration: 8,
      estimatedWaitMinutes: 2,
      estimatedPickupTime: new Date(now + 2 * 60000).toISOString(),
      estimatedPickupWindow: formatPickupWindow(new Date(now + 2 * 60000), 2),
      isNearShop: true,
      customerDistance: '40m'
    },
    {
      id: 'ord-102',
      token: 102,
      customerId: 'cust-02',
      customerName: 'Priya Sundaram',
      customerPhone: '9845123456',
      orderType: 'ONLINE',
      items: [
        { id: 'item-108', name: 'Chapathi & Curry Feast Combo', price: 120, qty: 2, image: '🍱', station: 'tawa_station', prepDuration: 6 }
      ],
      notes: 'Less oil on chapathis',
      subtotal: 240,
      packagingFee: 10,
      tax: 12,
      totalAmount: 262,
      paymentMode: 'CARD',
      paymentStatus: 'COMPLETED',
      paymentDetails: {
        transactionId: 'CARD_TXN_881234',
        provider: 'Stripe Online',
        paidAt: new Date(now - 7 * 60000).toISOString()
      },
      orderStatus: 'PACKING',
      assignedStaff: 'Packing Lead (Counter 1)',
      createdAt: new Date(now - 7 * 60000).toISOString(),
      updatedAt: new Date(now - 1 * 60000).toISOString(),
      prepStartedAt: new Date(now - 6 * 60000).toISOString(),
      packingStartedAt: new Date(now - 1 * 60000).toISOString(),
      readyAt: null,
      completedAt: null,
      cancelledAt: null,
      notifiedCustomer: false,
      estimatedPrepDuration: 6,
      estimatedWaitMinutes: 4,
      estimatedPickupTime: new Date(now + 4 * 60000).toISOString(),
      estimatedPickupWindow: formatPickupWindow(new Date(now + 4 * 60000), 2),
      isNearShop: false,
      customerDistance: '850m'
    },
    {
      id: 'ord-103',
      token: 103,
      customerId: 'cust-03',
      customerName: 'Karthik Raja',
      customerPhone: '9789012345',
      orderType: 'ONLINE',
      items: [
        { id: 'item-103', name: 'Special Hot Chapathi (Set of 2)', price: 30, qty: 3, image: '🫓', station: 'tawa_station', prepDuration: 4 },
        { id: 'item-105', name: 'Paneer Butter Masala', price: 140, qty: 1, image: '🥘', station: 'main_kitchen', prepDuration: 7 },
        { id: 'item-107', name: 'Crispy Paneer 65', price: 130, qty: 1, image: '🧆', station: 'fryer_station', prepDuration: 7 }
      ],
      notes: 'Pack curries separately with tight seal',
      subtotal: 360,
      packagingFee: 10,
      tax: 18,
      totalAmount: 388,
      paymentMode: 'UPI',
      paymentStatus: 'COMPLETED',
      paymentDetails: {
        transactionId: 'UPI_TXN_774123',
        provider: 'PhonePe UPI',
        paidAt: new Date(now - 3 * 60000).toISOString()
      },
      orderStatus: 'PREPARING',
      assignedStaff: 'Station Cook Coordinator',
      createdAt: new Date(now - 3 * 60000).toISOString(),
      updatedAt: new Date(now - 2 * 60000).toISOString(),
      prepStartedAt: new Date(now - 2 * 60000).toISOString(),
      packingStartedAt: null,
      readyAt: null,
      completedAt: null,
      cancelledAt: null,
      notifiedCustomer: false,
      estimatedPrepDuration: 9,
      estimatedWaitMinutes: 9,
      estimatedPickupTime: new Date(now + 9 * 60000).toISOString(),
      estimatedPickupWindow: formatPickupWindow(new Date(now + 9 * 60000), 2),
      isNearShop: false,
      customerDistance: '2.4km'
    },
    {
      id: 'ord-100',
      token: 100,
      customerId: 'cust-00',
      customerName: 'Meera Krishnan',
      customerPhone: '9123456789',
      orderType: 'ONLINE',
      items: [
        { id: 'item-102', name: 'Paneer Dum Biryani (Royal Veg)', price: 150, qty: 2, image: '🍚', station: 'biryani_station', prepDuration: 6 },
        { id: 'item-110', name: 'Warm Gulab Jamun (2 pcs)', price: 45, qty: 2, image: '🍯', station: 'beverage_station', prepDuration: 2 }
      ],
      notes: '',
      subtotal: 390,
      packagingFee: 10,
      tax: 20,
      totalAmount: 420,
      paymentMode: 'UPI',
      paymentStatus: 'COMPLETED',
      paymentDetails: {
        transactionId: 'UPI_TXN_665432',
        provider: 'Google Pay',
        paidAt: new Date(now - 45 * 60000).toISOString()
      },
      orderStatus: 'COMPLETED',
      assignedStaff: 'Packing Lead (Counter 1)',
      createdAt: new Date(now - 45 * 60000).toISOString(),
      updatedAt: new Date(now - 20 * 60000).toISOString(),
      prepStartedAt: new Date(now - 43 * 60000).toISOString(),
      packingStartedAt: new Date(now - 35 * 60000).toISOString(),
      readyAt: new Date(now - 32 * 60000).toISOString(),
      completedAt: new Date(now - 20 * 60000).toISOString(),
      cancelledAt: null,
      notifiedCustomer: true
    }
  ];
}

function saveState(state) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save state to db_store.json:', err);
  }
}

function loadState() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const data = fs.readFileSync(STORE_PATH, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed && Array.isArray(parsed.orders)) {
        // Safe migration: eliminate any legacy WALKIN order types and ensure ONLINE exclusivity
        let migrated = false;
        parsed.orders.forEach(o => {
          if (o.orderType === 'WALKIN' || !o.orderType) {
            o.orderType = 'ONLINE';
            migrated = true;
          }
          if (o.orderStatus === 'DELIVERED') {
            o.orderStatus = 'COMPLETED';
            migrated = true;
          }
          if (!o.items || !Array.isArray(o.items) || o.items.length === 0) {
            o.items = [
              o.chapathiQty > 0 ? { id: 'item-103', name: 'Special Hot Chapathi', price: 15, qty: o.chapathiQty, image: '🫓' } : null,
              o.chennaQty > 0 ? { id: 'item-106', name: 'Authentic Punjabi Chenna Masala', price: 30, qty: o.chennaQty, image: '🍲' } : null
            ].filter(Boolean);
            migrated = true;
          }
        });

        // Ensure modern dynamic menu is loaded
        if (!parsed.menu || parsed.menu.length < INITIAL_MENU.length || !parsed.menu[0].prepDuration) {
          parsed.menu = INITIAL_MENU;
          migrated = true;
        }

        // Ensure kitchen stations & system config are present
        if (!parsed.stations || !Array.isArray(parsed.stations)) {
          parsed.stations = DEFAULT_STATIONS;
          migrated = true;
        }
        if (!parsed.systemConfig) {
          parsed.systemConfig = DEFAULT_SYSTEM_CONFIG;
          migrated = true;
        }
        if (!parsed.categories || !Array.isArray(parsed.categories)) {
          parsed.categories = INITIAL_CATEGORIES;
          migrated = true;
        }
        if (!parsed.notifications || !Array.isArray(parsed.notifications)) {
          parsed.notifications = [];
          migrated = true;
        }
        if (!parsed.auditLogs || !Array.isArray(parsed.auditLogs)) {
          parsed.auditLogs = [];
          migrated = true;
        }

        if (migrated) {
          saveState(parsed);
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load state from db_store.json:', err);
  }

  // Fallback defaults
  const defaultState = {
    tokenCounter: 103,
    categories: INITIAL_CATEGORIES,
    menu: INITIAL_MENU,
    stations: DEFAULT_STATIONS,
    systemConfig: DEFAULT_SYSTEM_CONFIG,
    orders: getSampleOrders(),
    notifications: [],
    auditLogs: []
  };
  saveState(defaultState);
  return defaultState;
}

let globalState = globalThis.__queueFlowState;

if (!globalState) {
  globalState = loadState();
  globalThis.__queueFlowState = globalState;
}

/**
 * Trigger queue-wide Smart ETA re-calculation for all active orders
 */
export function recalculateQueueEtas() {
  const activeOrders = globalState.orders.filter(o => 
    o.orderStatus === 'PENDING' || o.orderStatus === 'PREPARING' || o.orderStatus === 'PACKING'
  );

  const simulationMap = simulateKitchenQueue(
    activeOrders, 
    globalState.stations || DEFAULT_STATIONS, 
    globalState.menu || INITIAL_MENU, 
    globalState.systemConfig || DEFAULT_SYSTEM_CONFIG
  );

  let updatedAny = false;
  activeOrders.forEach(o => {
    const sim = simulationMap.get(o.id);
    if (sim) {
      o.queuePosition = sim.queuePosition;
      o.ordersAhead = sim.ordersAhead;
      o.estimatedWaitMinutes = sim.estimatedWaitMinutes;
      o.estimatedPrepDuration = sim.estimatedPrepDuration;
      o.estimatedPickupTime = sim.estimatedPickupTime;
      o.estimatedPickupWindow = sim.estimatedPickupWindow;
      o.isDelayed = sim.isDelayed;
      o.delayMinutes = sim.delayMinutes;
      updatedAny = true;
    }
  });

  if (updatedAny) {
    saveState(globalState);
  }
  return simulationMap;
}

// -------------------------------------------------------------
// MENU & CATEGORIES CRUD (MANAGER CONTROLLED)
// -------------------------------------------------------------

export function getMenu() {
  return globalState.menu || INITIAL_MENU;
}

export function getMenuItemById(id) {
  return (globalState.menu || []).find(m => m.id === id);
}

export function createMenuItem(itemData) {
  const newId = `item-${Date.now().toString().slice(-4)}`;
  const newItem = {
    id: newId,
    name: itemData.name || 'New Special Dish',
    category: itemData.category || 'Mains & Curries',
    price: Math.max(1, Number(itemData.price) || 50),
    available: itemData.available !== undefined ? !!itemData.available : true,
    foodType: itemData.foodType === 'NON_VEG' ? 'NON_VEG' : 'VEG',
    image: itemData.image || '🍛',
    description: itemData.description || 'Freshly prepared specialty dish',
    prepDuration: Math.max(1, Number(itemData.prepDuration) || 5),
    station: itemData.station || 'main_kitchen',
    batchCapacity: Math.max(1, Number(itemData.batchCapacity) || 4),
    prepInstructions: itemData.prepInstructions || ''
  };

  globalState.menu.push(newItem);
  addAuditLog('MENU_ITEM_CREATED', `Manager added dish "${newItem.name}" (₹${newItem.price})`);
  saveState(globalState);
  return newItem;
}

export function updateMenuItem(id, updates) {
  const item = getMenuItemById(id);
  if (!item) return null;

  if (updates.name !== undefined) item.name = updates.name;
  if (updates.category !== undefined) item.category = updates.category;
  if (updates.price !== undefined) item.price = Math.max(1, Number(updates.price));
  if (updates.available !== undefined) item.available = !!updates.available;
  if (updates.foodType !== undefined) item.foodType = updates.foodType;
  if (updates.image !== undefined) item.image = updates.image;
  if (updates.description !== undefined) item.description = updates.description;
  if (updates.prepDuration !== undefined) item.prepDuration = Math.max(1, Number(updates.prepDuration));
  if (updates.station !== undefined) item.station = updates.station;
  if (updates.batchCapacity !== undefined) item.batchCapacity = Math.max(1, Number(updates.batchCapacity));
  if (updates.prepInstructions !== undefined) item.prepInstructions = updates.prepInstructions;

  addAuditLog('MENU_ITEM_UPDATED', `Manager updated dish "${item.name}"`);
  saveState(globalState);
  recalculateQueueEtas();
  return item;
}

export function deleteMenuItem(id) {
  const idx = (globalState.menu || []).findIndex(m => m.id === id);
  if (idx === -1) return false;
  const deleted = globalState.menu.splice(idx, 1)[0];
  addAuditLog('MENU_ITEM_DELETED', `Manager removed dish "${deleted.name}"`);
  saveState(globalState);
  return true;
}

export function getCategories() {
  return globalState.categories || INITIAL_CATEGORIES;
}

export function addCategory(categoryName) {
  const trimmed = (categoryName || '').trim();
  if (!trimmed || globalState.categories.includes(trimmed)) return false;
  globalState.categories.push(trimmed);
  saveState(globalState);
  return true;
}

// -------------------------------------------------------------
// KITCHEN STATIONS & SYSTEM CONFIG (MANAGER CONTROLLED)
// -------------------------------------------------------------

export function getStations() {
  return globalState.stations || DEFAULT_STATIONS;
}

export function updateStation(stationId, updates) {
  const station = (globalState.stations || []).find(s => s.id === stationId);
  if (!station) return null;
  if (updates.capacity !== undefined) {
    station.capacity = Math.max(1, Number(updates.capacity));
  }
  if (updates.name !== undefined) station.name = updates.name;
  saveState(globalState);
  recalculateQueueEtas();
  return station;
}

export function getSystemConfig() {
  return globalState.systemConfig || DEFAULT_SYSTEM_CONFIG;
}

export function updateSystemConfig(updates) {
  globalState.systemConfig = {
    ...globalState.systemConfig,
    ...updates
  };
  saveState(globalState);
  recalculateQueueEtas();
  return globalState.systemConfig;
}

// -------------------------------------------------------------
// ONLINE TAKEAWAY ORDERS (STRICTLY ONLINE WORKFLOW)
// -------------------------------------------------------------

export function getOrders(filter = {}) {
  let list = globalState.orders || [];

  if (filter.customerPhone) {
    list = list.filter(o => o.customerPhone === filter.customerPhone);
  }
  if (filter.status && filter.status !== 'ALL') {
    list = list.filter(o => o.orderStatus === filter.status);
  }
  if (filter.search) {
    const q = filter.search.toLowerCase();
    list = list.filter(o => 
      o.token.toString().includes(q) ||
      (o.customerName || '').toLowerCase().includes(q) ||
      (o.customerPhone || '').includes(q)
    );
  }

  return list;
}

export function getOrderById(id) {
  return (globalState.orders || []).find(o => o.id === id || o.token === parseInt(id, 10));
}

/**
 * Create a new Online Takeaway Order
 * Performs server-side price & availability verification against the menu database.
 */
export function createOrder({
  customerName,
  customerPhone,
  customerId,
  items = [],
  notes = '',
  paymentMode = 'UPI',
  paymentDetails = {}
}) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Order must contain at least one food item.');
  }

  const menuMap = new Map();
  (globalState.menu || []).forEach(m => menuMap.set(m.id, m));

  // Server-side item validation and price lookup
  const validatedItems = [];
  let subtotal = 0;

  for (const item of items) {
    const menuItem = menuMap.get(item.id);
    if (!menuItem) {
      throw new Error(`Menu item "${item.name || item.id}" no longer exists in our catalog.`);
    }
    if (!menuItem.available) {
      throw new Error(`"${menuItem.name}" is currently sold out and unavailable.`);
    }

    const qty = Math.max(1, parseInt(item.qty, 10) || 1);
    const itemPrice = Number(menuItem.price);
    subtotal += itemPrice * qty;

    validatedItems.push({
      id: menuItem.id,
      name: menuItem.name,
      price: itemPrice,
      qty,
      image: menuItem.image || '🍛',
      station: menuItem.station || 'main_kitchen',
      prepDuration: menuItem.prepDuration || 5,
      batchCapacity: menuItem.batchCapacity || 4
    });
  }

  const cfg = globalState.systemConfig || DEFAULT_SYSTEM_CONFIG;
  const packagingFee = Number(cfg.packagingFee || 10);
  const tax = Math.round(subtotal * (Number(cfg.taxRatePercent || 5) / 100));
  const totalAmount = subtotal + packagingFee + tax;

  globalState.tokenCounter = (globalState.tokenCounter || 100) + 1;
  const newToken = globalState.tokenCounter;
  const now = new Date();

  const newOrder = {
    id: `ord-${newToken}`,
    token: newToken,
    customerId: customerId || `cust-${Date.now().toString().slice(-4)}`,
    customerName: customerName || 'Online Takeaway Guest',
    customerPhone: customerPhone || '9876543210',
    orderType: 'ONLINE',
    items: validatedItems,
    notes: (notes || '').trim(),
    subtotal,
    packagingFee,
    tax,
    totalAmount,
    paymentMode: paymentMode || 'UPI',
    paymentStatus: 'COMPLETED',
    paymentDetails: {
      transactionId: paymentDetails.transactionId || `PAY_${Date.now().toString().slice(-8)}`,
      provider: paymentMode === 'CARD' ? 'Card Checkout' : 'Online UPI',
      paidAt: now.toISOString()
    },
    orderStatus: 'PENDING',
    assignedStaff: 'Kitchen & Packing Lead',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    prepStartedAt: null,
    packingStartedAt: null,
    readyAt: null,
    completedAt: null,
    cancelledAt: null,
    notifiedCustomer: false,
    isNearShop: false,
    customerDistance: 'Unknown',
    queuePosition: (globalState.orders.filter(o => o.orderStatus === 'PENDING' || o.orderStatus === 'PREPARING' || o.orderStatus === 'PACKING').length) + 1,
    ordersAhead: (globalState.orders.filter(o => o.orderStatus === 'PENDING' || o.orderStatus === 'PREPARING' || o.orderStatus === 'PACKING').length)
  };

  globalState.orders.unshift(newOrder);

  // Recalculate queue-wide smart ETAs
  recalculateQueueEtas();

  // Trigger Manager Notification
  addNotification({
    type: 'NEW_ORDER',
    title: `New Online Order #${newOrder.token}`,
    message: `${newOrder.customerName} placed order for ₹${newOrder.totalAmount} (${newOrder.items.length} items)`,
    orderId: newOrder.id,
    token: newOrder.token
  });

  addAuditLog('ORDER_CREATED', `Online takeaway order #${newOrder.token} confirmed for ₹${newOrder.totalAmount}`);
  saveState(globalState);
  return newOrder;
}

/**
 * Update order status with timestamp recording and valid lifecycle transitions:
 * PENDING -> PREPARING -> PACKING -> READY -> COMPLETED (or CANCELLED)
 */
export function updateOrderStatus(id, status, extra = {}) {
  const order = getOrderById(id);
  if (!order) return null;

  const prevStatus = order.orderStatus;
  const now = new Date().toISOString();

  order.orderStatus = status;
  order.updatedAt = now;

  if (status === 'PREPARING' && !order.prepStartedAt) {
    order.prepStartedAt = now;
  }
  if (status === 'PACKING' && !order.packingStartedAt) {
    order.packingStartedAt = now;
  }
  if (status === 'READY') {
    if (!order.readyAt) order.readyAt = now;
    // Notify Manager & Customer
    addNotification({
      type: 'ORDER_READY',
      title: `Token #${order.token} is READY for Handover!`,
      message: `Food packed & bagged for ${order.customerName}. Ready for customer pickup.`,
      orderId: order.id,
      token: order.token
    });
    if (extra.notifiedCustomer !== undefined) {
      order.notifiedCustomer = extra.notifiedCustomer;
    }
  }
  if (status === 'COMPLETED' || status === 'DELIVERED') {
    order.orderStatus = 'COMPLETED';
    order.completedAt = now;
    addAuditLog('ORDER_COMPLETED', `Token #${order.token} handed over to ${order.customerName}`);
  }
  if (status === 'CANCELLED') {
    order.cancelledAt = now;
    order.cancellationReason = extra.reason || 'Cancelled by manager/customer';
    addAuditLog('ORDER_CANCELLED', `Token #${order.token} cancelled: ${order.cancellationReason}`);
  }

  if (extra.notifiedCustomer !== undefined) {
    order.notifiedCustomer = extra.notifiedCustomer;
  }

  saveState(globalState);
  recalculateQueueEtas();
  return order;
}

/**
 * Cancel an order
 */
export function cancelOrder(id, reason = 'Customer requested cancellation') {
  const order = getOrderById(id);
  if (!order) return null;

  if (order.orderStatus === 'COMPLETED') {
    throw new Error('Cannot cancel an order that has already been completed.');
  }

  return updateOrderStatus(id, 'CANCELLED', { reason });
}

export function updateOrderProximity(id, isNear, distance) {
  const order = getOrderById(id);
  if (!order) return null;

  order.isNearShop = !!isNear;
  order.customerDistance = distance || (isNear ? '45m' : '2.5km');
  order.updatedAt = new Date().toISOString();

  if (isNear) {
    addNotification({
      type: 'CUSTOMER_ARRIVED',
      title: `Customer at Counter: Token #${order.token}`,
      message: `${order.customerName} has arrived near the shop (${order.customerDistance}). Have food ready!`,
      orderId: order.id,
      token: order.token
    });
  }

  saveState(globalState);
  return order;
}

// -------------------------------------------------------------
// NOTIFICATIONS & AUDIT LOGS
// -------------------------------------------------------------

export function getNotifications() {
  return globalState.notifications || [];
}

export function addNotification({ type, title, message, orderId, token }) {
  const notif = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type: type || 'INFO',
    title,
    message,
    orderId,
    token,
    read: false,
    createdAt: new Date().toISOString()
  };
  globalState.notifications.unshift(notif);
  // Keep last 40 notifications
  if (globalState.notifications.length > 40) {
    globalState.notifications.pop();
  }
  saveState(globalState);
  return notif;
}

export function markNotificationRead(id) {
  const n = (globalState.notifications || []).find(notif => notif.id === id);
  if (n) {
    n.read = true;
    saveState(globalState);
  }
  return n;
}

export function getAuditLogs() {
  return globalState.auditLogs || [];
}

export function addAuditLog(action, details) {
  const log = {
    id: `log-${Date.now()}`,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  globalState.auditLogs.unshift(log);
  if (globalState.auditLogs.length > 50) {
    globalState.auditLogs.pop();
  }
  saveState(globalState);
  return log;
}

// -------------------------------------------------------------
// METRICS & ANALYTICS REPORTING
// -------------------------------------------------------------

export function getMetrics() {
  const orders = globalState.orders || [];
  const activeOrders = orders.filter(o => 
    o.orderStatus === 'PENDING' || o.orderStatus === 'PREPARING' || o.orderStatus === 'PACKING'
  );
  const completedOrders = orders.filter(o => o.orderStatus === 'COMPLETED');
  const cancelledOrders = orders.filter(o => o.orderStatus === 'CANCELLED');
  const readyOrders = orders.filter(o => o.orderStatus === 'READY');

  const todayRevenue = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) +
                       readyOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Compute average prep time in minutes for completed orders
  let totalPrepMinutes = 0;
  let countWithPrepTime = 0;
  completedOrders.forEach(o => {
    if (o.prepStartedAt && o.readyAt) {
      const diff = (new Date(o.readyAt).getTime() - new Date(o.prepStartedAt).getTime()) / 60000;
      if (diff > 0 && diff < 120) {
        totalPrepMinutes += diff;
        countWithPrepTime++;
      }
    }
  });

  const avgPrepTimeMinutes = countWithPrepTime > 0 
    ? (totalPrepMinutes / countWithPrepTime).toFixed(1) 
    : '4.2';

  // Compute average pickup delay in minutes
  let totalDelayMinutes = 0;
  let countWithDelay = 0;
  completedOrders.forEach(o => {
    if (o.completedAt && o.estimatedPickupTime) {
      const diff = (new Date(o.completedAt).getTime() - new Date(o.estimatedPickupTime).getTime()) / 60000;
      totalDelayMinutes += diff;
      countWithDelay++;
    }
  });
  const avgPickupDelayMinutes = countWithDelay > 0 
    ? (totalDelayMinutes / countWithDelay).toFixed(1) 
    : '1.2';

  // Delayed orders count
  const now = Date.now();
  const delayedOrdersCount = activeOrders.filter(o => 
    o.estimatedPickupTime && new Date(o.estimatedPickupTime).getTime() < now
  ).length;

  return {
    totalOrdersToday: orders.length,
    activeQueueLength: activeOrders.length,
    ordersInPrep: orders.filter(o => o.orderStatus === 'PREPARING').length,
    ordersInPacking: orders.filter(o => o.orderStatus === 'PACKING').length,
    ordersReady: readyOrders.length,
    completedOrdersCount: completedOrders.length,
    cancelledOrdersCount: cancelledOrders.length,
    todayRevenue,
    avgPrepTimeMinutes,
    avgPickupDelayMinutes,
    delayedOrdersCount,
    menu: getMenu(),
    categories: getCategories(),
    stations: getStations(),
    systemConfig: getSystemConfig()
  };
}
