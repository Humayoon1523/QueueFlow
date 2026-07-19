const express = require('express');
const http = require('http');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const db = require('./services/db');
const socketService = require('./services/socketService');
const aiPredictor = require('./services/aiPredictor');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'queueflow_secret_key_2026';

app.use(cors());
app.use(express.json());

// Socket.IO setup
socketService.initSocket(server);

// --- AUTHENTICATION APIS ---
app.post('/api/register', (req, res) => {
  const { name, phone, password } = req.body;
  if (!name || !phone || !password) {
    return res.status(400).json({ error: 'Name, phone, and password are required.' });
  }
  const existing = db.findUserByPhone(phone);
  if (existing) {
    return res.status(400).json({ error: 'User with this phone number already exists.' });
  }
  const newUser = db.createUser({ name, phone, password });
  const token = jwt.sign({ id: newUser.id, role: newUser.role, phone: newUser.phone }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ message: 'Registration successful', token, user: newUser });
});

app.post('/api/login', (req, res) => {
  const { phone, password } = req.body;
  const user = db.findUserByPhone(phone);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid phone number or password.' });
  }
  const token = jwt.sign({ id: user.id, role: user.role, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ message: 'Login successful', token, user });
});

// --- MENU APIS ---
app.get('/api/menu', (req, res) => {
  res.json(db.getMenu());
});

app.put('/api/menu', (req, res) => {
  const newMenu = req.body;
  const updated = db.updateMenu(newMenu);
  res.json({ message: 'Menu updated successfully', menu: updated });
});

// --- CUSTOMER APIS ---
app.post('/api/order', async (req, res) => {
  const { customerId, customerName, customerPhone, chapathiQty, chennaQty, paymentMode } = req.body;
  
  if ((!chapathiQty || chapathiQty <= 0) && (!chennaQty || chennaQty <= 0)) {
    return res.status(400).json({ error: 'Please select at least 1 Chapathi or 1 Chenna.' });
  }

  const order = db.createOrder({
    customerId,
    customerName,
    customerPhone,
    orderType: 'ONLINE',
    chapathiQty: parseInt(chapathiQty || 0, 10),
    chennaQty: parseInt(chennaQty || 0, 10),
    paymentMode: paymentMode || 'ONLINE_UPI'
  });

  socketService.notifyOrderCreated(order);

  // Recalculate AI Predictions
  const aiData = await aiPredictor.predictQueueMetrics();
  socketService.broadcastAiMetrics(aiData);

  res.status(201).json({
    message: 'Online order placed successfully!',
    order,
    aiPrediction: aiData
  });
});

app.get('/api/track-order/:token', (req, res) => {
  const token = parseInt(req.params.token, 10);
  const order = db.getOrders().find(o => o.token === token);
  if (!order) {
    return res.status(404).json({ error: 'Order Token not found' });
  }
  res.json(order);
});

app.get('/api/history', (req, res) => {
  const { phone } = req.query;
  const orders = db.getOrders();
  if (phone) {
    return res.json(orders.filter(o => o.customerPhone === phone));
  }
  res.json(orders);
});

// --- MANAGER APIS ---
app.post('/api/walkin-order', async (req, res) => {
  const { customerName, customerPhone, chapathiQty, chennaQty, paymentMode } = req.body;
  
  if ((!chapathiQty || chapathiQty <= 0) && (!chennaQty || chennaQty <= 0)) {
    return res.status(400).json({ error: 'Walk-in order must have at least 1 Chapathi or Chenna.' });
  }

  const order = db.createOrder({
    customerName: customerName || 'Walk-in Guest',
    customerPhone: customerPhone || 'Counter',
    orderType: 'WALKIN',
    chapathiQty: parseInt(chapathiQty || 0, 10),
    chennaQty: parseInt(chennaQty || 0, 10),
    paymentMode: paymentMode || 'CASH'
  });

  socketService.notifyOrderCreated(order);

  const aiData = await aiPredictor.predictQueueMetrics();
  socketService.broadcastAiMetrics(aiData);

  res.status(201).json({
    message: 'Walk-in order registered & token generated!',
    order,
    aiPrediction: aiData
  });
});

app.get('/api/dashboard', async (req, res) => {
  const metrics = db.getMetrics();
  const orders = db.getOrders();
  const aiData = await aiPredictor.predictQueueMetrics();

  res.json({
    metrics,
    orders,
    aiData
  });
});

app.get('/api/orders', (req, res) => {
  res.json(db.getOrders());
});

app.post('/api/notify', (req, res) => {
  const { orderId } = req.body;
  const order = db.getOrderById(orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  db.updateOrderStatus(order.id, order.orderStatus, { notifiedCustomer: true });
  socketService.notifyOrderStatusChanged(order);

  res.json({ message: `Customer notified for Token #${order.token}`, order });
});

app.get('/api/reports', (req, res) => {
  const metrics = db.getMetrics();
  const orders = db.getOrders();

  res.json({
    date: new Date().toISOString().split('T')[0],
    totalOrders: metrics.totalOrdersToday,
    revenue: metrics.todayRevenue,
    averageWaitingTime: `${metrics.avgWaitMinutes} mins`,
    rushHourPeak: '6:45 PM - 8:30 PM',
    ordersBreakdown: {
      online: metrics.onlineOrdersCount,
      walkin: metrics.walkinOrdersCount,
      completed: metrics.completedOrdersCount,
      activeInQueue: metrics.activeQueueLength
    },
    ordersList: orders
  });
});

// --- DELIVERY & PACKING STAFF APIS ---
app.get('/api/assigned-orders', (req, res) => {
  const activeOrders = db.getOrders().filter(o => o.orderStatus !== 'DELIVERED');
  res.json(activeOrders);
});

app.put('/api/start/:id', async (req, res) => {
  const updated = db.updateOrderStatus(req.params.id, 'PREPARING');
  if (!updated) return res.status(404).json({ error: 'Order not found' });

  socketService.notifyOrderStatusChanged(updated);
  const aiData = await aiPredictor.predictQueueMetrics();
  socketService.broadcastAiMetrics(aiData);

  res.json({ message: `Order #${updated.token} status: PREPARING`, order: updated });
});

app.put('/api/ready/:id', async (req, res) => {
  const updated = db.updateOrderStatus(req.params.id, 'READY', { notifiedCustomer: true });
  if (!updated) return res.status(404).json({ error: 'Order not found' });

  socketService.notifyOrderStatusChanged(updated);
  const aiData = await aiPredictor.predictQueueMetrics();
  socketService.broadcastAiMetrics(aiData);

  res.json({ message: `Order #${updated.token} marked READY!`, order: updated });
});

app.put('/api/delivered/:id', async (req, res) => {
  const updated = db.updateOrderStatus(req.params.id, 'DELIVERED');
  if (!updated) return res.status(404).json({ error: 'Order not found' });

  socketService.notifyOrderStatusChanged(updated);
  const aiData = await aiPredictor.predictQueueMetrics();
  socketService.broadcastAiMetrics(aiData);

  res.json({ message: `Order #${updated.token} marked DELIVERED`, order: updated });
});

// --- AI PREDICTION APIS ---
app.get('/api/ai/predictions', async (req, res) => {
  const predictions = await aiPredictor.predictQueueMetrics();
  res.json(predictions);
});

server.listen(PORT, () => {
  console.log(`🚀 QueueFlow AI Backend running on http://localhost:${PORT}`);
});
