'use client';

import React, { useState, useEffect } from 'react';
import CustomerApp from '@/components/CustomerApp';

export default function CustomerHome() {
  const [orders, setOrders] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [aiPrediction, setAiPrediction] = useState(null);

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
      console.error('Failed to fetch data from server:', err);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 3000);
    return () => clearInterval(interval);
  }, []);

  const handlePlaceOrder = (newOrder) => {
    fetchState();
  };

  return (
    <main style={{ minHeight: '100vh' }}>
      {/* 100% Dedicated Customer Pre-Order App */}
      <CustomerApp
        menu={metrics?.menu || []}
        onPlaceOrder={handlePlaceOrder}
        activeOrders={orders}
        aiPrediction={aiPrediction}
      />
    </main>
  );
}
