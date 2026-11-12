'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ManagerDashboard from '@/components/ManagerDashboard';
import TokenReceiptModal from '@/components/TokenReceiptModal';
import StaffGuard from '@/components/StaffGuard';

export default function ManagerPage() {
  const router = useRouter();
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
    if (role === 'delivery') router.push('/delivery');
    else if (role === 'analytics') router.push('/analytics');
  };

  const handleNotifyCustomer = async (orderId) => {
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setNotificationAlert(`Alert sent for Token #${data.order.token}`);
        setTimeout(() => setNotificationAlert(null), 4000);
        fetchState();
      }
    } catch (err) {
      console.error('Failed to notify customer:', err);
    }
  };

  const activeQueueCount = orders.filter(o => o.orderStatus !== 'COMPLETED' && o.orderStatus !== 'CANCELLED').length;

  return (
    <StaffGuard title="Manager Central Operations">
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
          onNotifyCustomer={handleNotifyCustomer}
          onPrintReceipt={(ord) => setPrintingOrder(ord)}
          onRefresh={fetchState}
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