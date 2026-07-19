/**
 * Socket.IO Real-time Communication Manager for QueueFlow AI
 * Broadcasts order lifecycle events, kitchen alerts, and manager notifications
 */

let io = null;

function initSocket(serverInstance) {
  const { Server } = require('socket.io');
  io = new Server(serverInstance, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join room based on role or token (e.g. 'manager', 'delivery', 'token_101')
    socket.on('join_role', (role) => {
      socket.join(role);
      console.log(`[Socket.IO] ${socket.id} joined role room: ${role}`);
    });

    socket.on('join_token', (token) => {
      socket.join(`token_${token}`);
      console.log(`[Socket.IO] ${socket.id} subscribed to token_${token}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

function notifyOrderCreated(order) {
  if (!io) return;
  io.emit('ORDER_CREATED', order);
}

function notifyOrderStatusChanged(order) {
  if (!io) return;
  io.emit('ORDER_STATUS_CHANGED', order);
  io.to(`token_${order.token}`).emit('MY_ORDER_UPDATED', order);

  if (order.orderStatus === 'READY') {
    io.emit('NOTIFICATION_READY', {
      message: `Token #${order.token} for ${order.customerName} is READY for pickup!`,
      order
    });
  }
}

function broadcastAiMetrics(metrics) {
  if (!io) return;
  io.emit('AI_METRICS_UPDATED', metrics);
}

module.exports = {
  initSocket,
  notifyOrderCreated,
  notifyOrderStatusChanged,
  broadcastAiMetrics
};
