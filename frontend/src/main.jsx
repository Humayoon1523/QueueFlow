import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import Navbar from './components/Navbar.jsx';
import CustomerApp from './components/CustomerApp.jsx';
import ManagerDashboard from './components/ManagerDashboard.jsx';
import DeliveryDashboard from './components/DeliveryDashboard.jsx';
import AiAnalytics from './components/AiAnalytics.jsx';
import { socket } from './socket.js';

function App() {
  const [currentRole, setCurrentRole] = useState('customer');
  const [activeQueueCount, setActiveQueueCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationAlert, setNotificationAlert] = useState(null);

  const showNotification = useCallback((msg) => {
    setNotificationAlert(msg);
    setTimeout(() => setNotificationAlert(null), 4000);
  }, []);

  useEffect(() => {
    socket.on('order:created', (order) => {
      setActiveQueueCount(prev => prev + 1);
      showNotification(`New order #${order.token} placed!`);
    });

    socket.on('order:status_changed', (order) => {
      if (order.orderStatus === 'DELIVERED') {
        setActiveQueueCount(prev => Math.max(0, prev - 1));
      }
      if (order.orderStatus === 'READY') {
        showNotification(`Token #${order.token} is READY for pickup!`);
      }
    });

    socket.on('connect', () => {
      fetch('/api/orders')
        .then(r => r.json())
        .then(orders => {
          const active = orders.filter(o => o.orderStatus !== 'DELIVERED').length;
          setActiveQueueCount(active);
        })
        .catch(() => {});
    });

    return () => {
      socket.off('order:created');
      socket.off('order:status_changed');
      socket.off('connect');
    };
  }, [showNotification]);

  const renderView = () => {
    switch (currentRole) {
      case 'customer':   return <CustomerApp soundEnabled={soundEnabled} />;
      case 'manager':    return <ManagerDashboard soundEnabled={soundEnabled} />;
      case 'delivery':   return <DeliveryDashboard soundEnabled={soundEnabled} />;
      case 'analytics':  return <AiAnalytics />;
      default:           return <CustomerApp soundEnabled={soundEnabled} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '1rem' }}>
      <Navbar
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        activeQueueCount={activeQueueCount}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        notificationAlert={notificationAlert}
      />
      <main>
        {renderView()}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
