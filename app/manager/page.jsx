'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ManagerDashboard from '@/components/ManagerDashboard';
import TokenReceiptModal from '@/components/TokenReceiptModal';
import StaffGuard from '@/components/StaffGuard';

export default function ManagerPage() {
  const [orders, setOrders] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationAlert, setNotificationAlert] = useState(null);
  const [printingOrder, setPrintingOrder] = useState(null);

  const fetchState = async () => {
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setMetrics(data.metrics || null);
        setAiPrediction(data.aiData || null);
      }
    } catch (err) {
      console.error('Failed to fetch manager data:', err);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleChange = (role) => {
    if (role === 'delivery') window.location.href = '/delivery';
    else if (role === 'analytics') window.location.href = '/analytics';
  };

  const handleWalkinOrder = (newOrder) => {
    setNotificationAlert(`Walk-in Token #${newOrder.token} Issued!`);
    setTimeout(() => setNotificationAlert(null), 4000);
    fetchState();
  };

  const handleNotifyCustomer = async (orderId) => {
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      const data = await res.json();
      if (res.ok) {
        setNotificationAlert(`Alert sent for Token #${data.order.token}`);
        setTimeout(() => setNotificationAlert(null), 4000);
        fetchState();
      }
    } catch (err) {
      console.error('Failed to notify customer:', err);
    }
  };

  const activeQueueCount = orders.filter(o => o.orderStatus !== 'DELIVERED').length;

  return (
    <StaffGuard title="Manager POS Portal">
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 0.5rem' }}>
        <Navbar
          currentRole="manager"
          setCurrentRole={handleRoleChange}
          activeQueueCount={activeQueueCount}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          notificationAlert={notificationAlert}
        />

        <ManagerDashboard
          orders={orders}
          metrics={metrics}
          aiPrediction={aiPrediction}
          onWalkinOrder={handleWalkinOrder}
          onNotifyCustomer={handleNotifyCustomer}
          onPrintReceipt={(ord) => setPrintingOrder(ord)}
        />

        {printingOrder && (
          <TokenReceiptModal
            order={printingOrder}
            onClose={() => setPrintingOrder(null)}
          />
        )}
      </main>
    </StaffGuard>
  );
}
