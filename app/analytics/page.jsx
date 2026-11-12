'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AiAnalytics from '@/components/AiAnalytics';
import StaffGuard from '@/components/StaffGuard';

export default function AnalyticsPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

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
      console.error('Failed to fetch analytics data:', err);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleChange = (role) => {
    if (role === 'manager') router.push('/manager');
    else if (role === 'delivery') router.push('/delivery');
  };

  const activeQueueCount = orders.filter(o => o.orderStatus !== 'COMPLETED' && o.orderStatus !== 'CANCELLED').length;

  return (
    <StaffGuard title="AI Analytics & Demand Forecasting">
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 0.5rem' }}>
        <Navbar
          currentRole="analytics"
          setCurrentRole={handleRoleChange}
          activeQueueCount={activeQueueCount}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
        />

        <AiAnalytics
          aiPrediction={aiPrediction}
          metrics={metrics}
          orders={orders}
        />
      </main>
    </StaffGuard>
  );
}