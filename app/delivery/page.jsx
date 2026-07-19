'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import DeliveryDashboard from '@/components/DeliveryDashboard';
import StaffGuard from '@/components/StaffGuard';

export default function DeliveryPage() {
  const [orders, setOrders] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationAlert, setNotificationAlert] = useState(null);

  const fetchState = async () => {
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setMetrics(data.metrics || null);
      }
    } catch (err) {
      console.error('Failed to fetch delivery data:', err);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleChange = (role) => {
    if (role === 'manager') window.location.href = '/manager';
    else if (role === 'analytics') window.location.href = '/analytics';
  };

  const handleUpdateStatus = async (orderId, action) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action })
      });
      const data = await res.json();
      if (res.ok && data.order) {
        if (data.order.orderStatus === 'READY') {
          setNotificationAlert(`TOKEN #${data.order.token} IS READY!`);
          setTimeout(() => setNotificationAlert(null), 4000);
        }
        fetchState();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const activeQueueCount = orders.filter(o => o.orderStatus !== 'DELIVERED').length;

  return (
    <StaffGuard title="Delivery & Kitchen Station">
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 0.5rem' }}>
        <Navbar
          currentRole="delivery"
          setCurrentRole={handleRoleChange}
          activeQueueCount={activeQueueCount}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          notificationAlert={notificationAlert}
        />

        <DeliveryDashboard
          orders={orders}
          metrics={metrics}
          onUpdateStatus={handleUpdateStatus}
        />
      </main>
    </StaffGuard>
  );
}
