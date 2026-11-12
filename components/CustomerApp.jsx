'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, Clock, Sparkles, AlertCircle, CheckCircle2, History, UserCheck, 
  Utensils, CheckCheck, ArrowRight, Download, CreditCard, Zap, Lock, 
  LogOut, MapPin, Printer, RotateCcw, Volume2, ShieldCheck, Flame, Search, 
  X, Filter, ChevronRight, XCircle
} from 'lucide-react';
import UpiPaymentModal from '@/components/UpiPaymentModal';
import CustomerLogin from '@/components/CustomerLogin';
import TokenReceiptModal from '@/components/TokenReceiptModal';

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const phi1 = lat1 * Math.PI/180;
  const phi2 = lat2 * Math.PI/180;
  const deltaPhi = (lat2-lat1) * Math.PI/180;
  const deltaLambda = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function playNotificationChime() {
  try {
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.65);
    osc.start();
    osc.stop(ctx.currentTime + 0.65);
  } catch (err) {
    console.warn('Audio chime error:', err);
  }
}

export default function CustomerApp({ 
  menu = [], 
  categories = [], 
  onPlaceOrder, 
  activeOrders = [], 
  aiPrediction, 
  systemConfig 
}) {
  const [activeTab, setActiveTab] = useState('order');
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState('ALL'); // 'ALL' | 'VEG' | 'NON_VEG'
  
  const [customerName, setCustomerName] = useState('Anand Sharma');
  const [customerPhone, setCustomerPhone] = useState('9876543210');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Cart state: map of itemId => quantity
  const [cartQuantities, setCartQuantities] = useState({});
  const [cookingNotes, setCookingNotes] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI'); // 'UPI' | 'CARD'
  
  const [restaurantUpiId, setRestaurantUpiId] = useState('9876543210@okicici');
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [viewingReceiptOrder, setViewingReceiptOrder] = useState(null);

  const [lastPlacedToken, setLastPlacedToken] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);

  // Proximity States
  const [useGps, setUseGps] = useState(false);
  const [simNear, setSimNear] = useState(false);
  const [gpsDistance, setGpsDistance] = useState(null);
  const [gpsError, setGpsError] = useState('');
  const [shopCoords, setShopCoords] = useState({ lat: 12.9716, lon: 77.5946 });

  const previousStatusRef = useRef(null);
  const hasInitialTabRouted = useRef(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('queueflow_customer_name');
      const storedPhone = localStorage.getItem('queueflow_customer_phone');
      if (storedName && storedPhone) {
        setCustomerName(storedName);
        setCustomerPhone(storedPhone);
        setIsLoggedIn(true);
      }
      
      const storedToken = localStorage.getItem('queueflow_last_placed_token');
      if (storedToken) {
        const tokenNum = parseInt(storedToken, 10);
        setLastPlacedToken(tokenNum);
        
        if (!hasInitialTabRouted.current && activeOrders.length > 0) {
          const matchingActive = activeOrders.some(o => o.token === tokenNum);
          if (matchingActive) {
            setActiveTab('track');
          }
          hasInitialTabRouted.current = true;
        }
      }
      setIsLoadingSession(false);
    }
  }, [activeOrders]);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleLogin = ({ name, phone }) => {
    localStorage.setItem('queueflow_customer_name', name);
    localStorage.setItem('queueflow_customer_phone', phone);
    setCustomerName(name);
    setCustomerPhone(phone);
    setIsLoggedIn(true);
    showToast(`Welcome ${name}! Takeaway ordering hub ready.`);
  };

  const handleLogout = () => {
    localStorage.removeItem('queueflow_customer_name');
    localStorage.removeItem('queueflow_customer_phone');
    localStorage.removeItem('queueflow_last_placed_token');
    setCustomerName('');
    setCustomerPhone('');
    setLastPlacedToken(null);
    setIsLoggedIn(false);
    setActiveTab('order');
  };

  // Find customer active tracked order
  const trackedOrder = activeOrders.find(o => o.token === lastPlacedToken) || activeOrders[0];

  // Sound chime when tracked order becomes READY
  useEffect(() => {
    if (trackedOrder && trackedOrder.orderStatus === 'READY' && previousStatusRef.current !== 'READY') {
      playNotificationChime();
      showToast(`🔔 Token #${trackedOrder.token} is READY for collection at counter!`);
    }
    if (trackedOrder) {
      previousStatusRef.current = trackedOrder.orderStatus;
    }
  }, [trackedOrder]);

  // Proximity notification reporting to server
  useEffect(() => {
    if (!lastPlacedToken || !trackedOrder || trackedOrder.orderStatus === 'COMPLETED') return;

    let watchId = null;

    const reportProximity = async (isNear, distanceStr) => {
      try {
        await fetch('/api/orders/proximity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: trackedOrder.id,
            isNear,
            distance: distanceStr
          })
        });
      } catch (err) {
        console.error('Failed to report proximity:', err);
      }
    };

    if (useGps) {
      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const dist = calculateDistance(latitude, longitude, shopCoords.lat, shopCoords.lon);
            setGpsDistance(dist);
            setGpsError('');

            const isNear = dist < 100;
            const distText = dist < 1000 ? `${Math.round(dist)}m` : `${(dist / 1000).toFixed(2)}km`;
            reportProximity(isNear, distText);
          },
          (err) => {
            console.error('GPS tracking error:', err);
            setGpsError('GPS permission denied or unavailable.');
            setUseGps(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        setGpsError('Geolocation not supported by browser.');
        setUseGps(false);
      }
    } else {
      const isNear = simNear;
      const distText = isNear ? '40m' : '2.4km';
      reportProximity(isNear, distText);
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [useGps, simNear, trackedOrder, shopCoords, lastPlacedToken]);

  // Cart operations
  const updateItemQty = (id, delta) => {
    setCartQuantities(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      const copy = { ...prev };
      if (next === 0) {
        delete copy[id];
      } else {
        copy[id] = next;
      }
      return copy;
    });
  };

  const totalItemsCount = Object.values(cartQuantities).reduce((sum, q) => sum + q, 0);

  // Compute bill breakdown
  const subtotal = menu.reduce((sum, item) => {
    const qty = cartQuantities[item.id] || 0;
    return sum + (qty * (item.price || 0));
  }, 0);

  const packagingFee = totalItemsCount > 0 ? (systemConfig?.packagingFee || 10) : 0;
  const tax = Math.round(subtotal * ((systemConfig?.taxRatePercent || 5) / 100));
  const finalTotalAmount = subtotal + packagingFee + tax;

  const buildItemsPayload = () => {
    return menu
      .filter(item => (cartQuantities[item.id] || 0) > 0)
      .map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: cartQuantities[item.id],
        image: item.image || '🍛',
        station: item.station || 'main_kitchen',
        prepDuration: item.prepDuration || 5
      }));
  };

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    if (totalItemsCount <= 0) {
      alert('Please select at least 1 item to proceed with online takeaway.');
      return;
    }
    setShowUpiModal(true);
  };

  const executeOrderSubmission = async (selectedPaymentMode, transactionId = null) => {
    setSubmitting(true);
    const itemsPayload = buildItemsPayload();

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          items: itemsPayload,
          notes: cookingNotes,
          paymentMode: selectedPaymentMode,
          paymentDetails: {
            transactionId: transactionId || `TXN_${Date.now()}`
          }
        })
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setLastPlacedToken(data.order.token);
        localStorage.setItem('queueflow_last_placed_token', data.order.token.toString());
        setCartQuantities({});
        setCookingNotes('');
        setShowUpiModal(false);
        setActiveTab('track');
        if (onPlaceOrder) onPlaceOrder(data.order);
        showToast(`🎉 Order confirmed! Token #${data.order.token}. In queue.`);
      } else {
        alert(data.error || 'Failed to place order.');
      }
    } catch (err) {
      console.error('Failed to submit order:', err);
      alert('Network error submitting order.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this takeaway order?')) return;
    try {
      const res = await fetch(`/api/orders?id=${orderId}&reason=Customer Cancelled`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Order cancelled successfully.');
        if (onPlaceOrder) onPlaceOrder(data.order);
      } else {
        alert(data.error || 'Cancellation failed');
      }
    } catch (err) {
      console.error('Cancel order error:', err);
    }
  };

  const handleReorder = (order) => {
    const newCart = {};
    if (Array.isArray(order.items)) {
      order.items.forEach(it => {
        newCart[it.id] = it.qty;
      });
    }
    setCartQuantities(newCart);
    setActiveTab('order');
    showToast(`Items from Token #${order.token} loaded into cart!`);
  };

  const handlePwaInstall = () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.then(() => setDeferredInstallPrompt(null));
    } else {
      alert('To install: In Chrome tap (⋮) -> "Install App", or in Safari tap Share (⎋) -> "Add to Home Screen".');
    }
  };

  // Filter menu items by category, search query, and dietary filter
  const filteredMenu = menu.filter(item => {
    const matchesCategory = selectedCategory === 'All Items' || item.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDietary = dietaryFilter === 'ALL' || item.foodType === dietaryFilter;
    const matchesAvailability = item.available;

    return matchesCategory && matchesSearch && matchesDietary && matchesAvailability;
  });

  const historyOrders = activeOrders.filter(o => o.orderStatus === 'COMPLETED' || o.orderStatus === 'CANCELLED');

  if (isLoadingSession) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', background: 'var(--bg-midnight)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span className="live-dot"></span>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.06em', color: 'var(--accent-cyan)' }}>
            INITIALIZING QUEUEFLOW TAKEAWAY HUB...
          </span>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <CustomerLogin onLogin={handleLogin} />;
  }

  return (
    <div style={{ width: '100%', maxWidth: '680px', margin: '0 auto', padding: '0 0 5rem 0' }}>
      
      {/* SAAS TOP BAR */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1rem', borderTop: '3px solid var(--accent-indigo)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span className="live-dot"></span>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--accent-emerald)', letterSpacing: '0.06em' }}>
                ONLINE TAKEAWAY PORTAL
              </span>
            </div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', marginTop: '0.1rem', letterSpacing: '-0.02em' }}>
              QueueFlow Takeaway
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '0.35rem 0.65rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
              <UserCheck size={13} />
              <span style={{ fontWeight: 700 }}>{customerName}</span>
            </div>
            
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-outline"
              style={{ padding: '0.38rem', fontSize: '0.72rem', color: 'var(--accent-rose)' }}
              title="Sign Out / Switch Profile"
            >
              <LogOut size={13} />
            </button>

            <button
              type="button"
              onClick={handlePwaInstall}
              className="btn btn-outline"
              style={{ fontSize: '0.72rem', padding: '0.38rem 0.65rem' }}
              title="Install Mobile PWA"
            >
              <Download size={13} /> PWA
            </button>

            <Link
              href="/manager"
              className="btn btn-outline"
              style={{ fontSize: '0.72rem', padding: '0.38rem 0.65rem', color: '#a5b4fc', borderColor: 'rgba(165, 180, 252, 0.3)' }}
              title="Staff Portal Access"
            >
              <Lock size={12} /> Staff
            </Link>
          </div>
        </div>

        {/* Live Smart ETA Banner */}
        <div style={{
          marginTop: '0.85rem',
          background: 'rgba(9, 14, 26, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '0.75rem 0.95rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <Sparkles size={18} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                SMART QUEUE ETA: ~{aiPrediction?.estimatedWaitMinutes || 8} MINS PREPARATION
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                🟢 {aiPrediction?.analytics?.queueCongestionScore || 'OPTIMAL'} FLOW
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              {aiPrediction?.etaRecommendation?.customerMessage || 'Piping hot food prepared to order.'}
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="nav-tabs" style={{ marginBottom: '1rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('order')}
          className={`btn ${activeTab === 'order' ? 'btn-primary' : 'btn-outline'}`}
          style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem', border: 'none' }}
        >
          <Utensils size={14} />
          Menu & Order
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('track')}
          className={`btn ${activeTab === 'track' ? 'btn-primary' : 'btn-outline'}`}
          style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem', border: 'none' }}
        >
          <Clock size={14} />
          Live Token
          {trackedOrder && trackedOrder.orderStatus !== 'COMPLETED' && (
            <span style={{
              background: 'var(--accent-emerald)',
              color: '#000',
              borderRadius: '9999px',
              padding: '0.05rem 0.35rem',
              fontSize: '0.62rem',
              fontWeight: 900,
              marginLeft: '0.25rem'
            }}>
              #{trackedOrder.token}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-outline'}`}
          style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem', border: 'none' }}
        >
          <History size={14} />
          History ({historyOrders.length})
        </button>
      </div>

      {/* TAB 1: MENU & ORDER */}
      {activeTab === 'order' && (
        <form onSubmit={handleOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          
          {/* Search & Dietary Filters */}
          <div className="glass-panel" style={{ padding: '0.85rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Search dishes, curries, biryani..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2.2rem', paddingRight: searchQuery ? '2rem' : '0.75rem' }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{ position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Dietary Toggle */}
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => setDietaryFilter('ALL')}
                  className={`btn ${dietaryFilter === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ fontSize: '0.72rem', padding: '0.45rem 0.65rem' }}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setDietaryFilter('VEG')}
                  className="btn"
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.45rem 0.65rem',
                    background: dietaryFilter === 'VEG' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    color: dietaryFilter === 'VEG' ? 'var(--accent-emerald)' : 'var(--text-secondary)',
                    border: dietaryFilter === 'VEG' ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)'
                  }}
                >
                  🌱 Veg
                </button>
                <button
                  type="button"
                  onClick={() => setDietaryFilter('NON_VEG')}
                  className="btn"
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.45rem 0.65rem',
                    background: dietaryFilter === 'NON_VEG' ? 'rgba(244, 63, 94, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    color: dietaryFilter === 'NON_VEG' ? 'var(--accent-rose)' : 'var(--text-secondary)',
                    border: dietaryFilter === 'NON_VEG' ? '1px solid var(--accent-rose)' : '1px solid var(--border-subtle)'
                  }}
                >
                  🍗 Non-Veg
                </button>
              </div>
            </div>

            {/* Category Pills */}
            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', marginTop: '0.75rem', paddingBottom: '0.2rem' }}>
              {['All Items', ...(categories.filter(c => c !== 'All Items'))].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Food Menu Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredMenu.length === 0 ? (
              <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Utensils size={36} style={{ margin: '0 auto 0.5rem auto', opacity: 0.5 }} />
                <p style={{ fontSize: '0.9rem' }}>No available dishes found matching your selection.</p>
                <button
                  type="button"
                  onClick={() => { setSelectedCategory('All Items'); setSearchQuery(''); setDietaryFilter('ALL'); }}
                  className="btn btn-outline"
                  style={{ marginTop: '0.75rem', fontSize: '0.75rem' }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredMenu.map(item => {
                const qty = cartQuantities[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className="glass-panel"
                    style={{
                      padding: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      borderLeft: item.foodType === 'NON_VEG' ? '3px solid var(--accent-rose)' : '3px solid var(--accent-emerald)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1 }}>
                      <div style={{
                        fontSize: '2rem',
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        background: 'rgba(6, 10, 18, 0.75)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--border-subtle)',
                        flexShrink: 0
                      }}>
                        {item.image || '🍛'}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                            {item.name}
                          </h3>
                          <span className={item.foodType === 'NON_VEG' ? 'badge-nonveg' : 'badge-veg'}>
                            {item.foodType === 'NON_VEG' ? 'NON-VEG' : '100% VEG'}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                          {item.description}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.25rem' }}>
                          <span style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>
                            ₹{item.price}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            ⏱️ ~{item.prepDuration || 5} mins
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stepper */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: 'rgba(6, 10, 18, 0.9)',
                      padding: '0.2rem 0.4rem',
                      borderRadius: '8px',
                      border: qty > 0 ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)'
                    }}>
                      <button
                        type="button"
                        onClick={() => updateItemQty(item.id, -1)}
                        style={{
                          width: '28px',
                          height: '28px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: 'none',
                          borderRadius: '6px',
                          color: '#fff',
                          fontWeight: 900,
                          fontSize: '1rem',
                          cursor: 'pointer'
                        }}
                      >
                        -
                      </button>
                      <span style={{ width: '22px', textAlign: 'center', fontWeight: 800, fontSize: '0.9rem', color: qty > 0 ? '#ffffff' : 'var(--text-muted)' }}>
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateItemQty(item.id, 1)}
                        style={{
                          width: '28px',
                          height: '28px',
                          background: 'var(--accent-indigo)',
                          border: 'none',
                          borderRadius: '6px',
                          color: '#fff',
                          fontWeight: 900,
                          fontSize: '1rem',
                          cursor: 'pointer'
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Cooking Instructions Input */}
          <div className="glass-panel" style={{ padding: '0.85rem' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              CHEF PREPARATION INSTRUCTIONS (OPTIONAL)
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Less spicy, pack mint raita separately, extra lime"
              value={cookingNotes}
              onChange={(e) => setCookingNotes(e.target.value)}
            />
          </div>

          {/* ONLINE CHECKOUT DRAWER */}
          <div className="glass-panel-glow" style={{ padding: '1.15rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.04em', marginBottom: '0.65rem' }}>
              ONLINE TAKEAWAY BILL BREAKDOWN
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Items Subtotal ({totalItemsCount} items)</span>
                <span>₹{subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Eco Thermal Packaging Fee</span>
                <span>₹{packagingFee}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>GST (5%)</span>
                <span>₹{tax}</span>
              </div>
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', marginTop: '0.45rem', paddingTop: '0.45rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 900, color: '#ffffff' }}>
                <span>Final Order Amount</span>
                <span style={{ color: 'var(--accent-cyan)' }}>₹{finalTotalAmount}</span>
              </div>
            </div>

            {/* Payment Mode Selector */}
            <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.45rem' }}>
                SELECT ONLINE PAYMENT METHOD
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setPaymentMode('UPI')}
                  className={`btn ${paymentMode === 'UPI' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ fontSize: '0.78rem', padding: '0.55rem' }}
                >
                  <Zap size={14} color="var(--accent-cyan)" /> Instant UPI (GPay/PhonePe)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('CARD')}
                  className={`btn ${paymentMode === 'CARD' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ fontSize: '0.78rem', padding: '0.55rem' }}
                >
                  <CreditCard size={14} /> Debit / Credit Card
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || totalItemsCount === 0}
              className="btn btn-emerald"
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', fontWeight: 800, marginTop: '1rem' }}
            >
              <ShoppingBag size={18} />
              {submitting ? 'Generating Digital Token...' : `Confirm & Pay ₹${finalTotalAmount}`}
            </button>
          </div>

        </form>
      )}

      {/* TAB 2: LIVE TOKEN TRACKER */}
      {activeTab === 'track' && (
        <div>
          {trackedOrder ? (
            <div className="glass-panel-glow" style={{ padding: '1.35rem', textAlign: 'center' }}>
              
              {trackedOrder.orderStatus === 'COMPLETED' ? (
                <div style={{ background: 'rgba(6, 182, 212, 0.12)', border: '1px solid var(--accent-cyan)', borderRadius: '14px', padding: '1rem', marginBottom: '1.15rem' }}>
                  <span className="badge badge-completed">
                    <CheckCheck size={14} /> ORDER HANDOVER COMPLETE
                  </span>
                  <h3 style={{ color: '#ffffff', fontSize: '1.15rem', fontWeight: 900, marginTop: '0.35rem' }}>
                    Food Handed Over & Enjoy your Meal!
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Completed at {new Date(trackedOrder.completedAt || trackedOrder.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <button
                    type="button"
                    onClick={() => setViewingReceiptOrder(trackedOrder)}
                    className="btn btn-outline"
                    style={{ marginTop: '0.65rem', fontSize: '0.75rem' }}
                  >
                    <Printer size={13} /> View Digital Receipt
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                  <span className={`badge badge-${trackedOrder.orderStatus.toLowerCase()}`}>
                    <CheckCircle2 size={13} /> STAGE: {trackedOrder.orderStatus}
                  </span>
                </div>
              )}

              <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                DIGITAL PICKUP TOKEN
              </h3>
              
              <div style={{
                fontSize: '4.5rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #a5b4fc 0%, #ffffff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.1,
                margin: '0.1rem 0'
              }}>
                #{trackedOrder.token}
              </div>

              {/* Queue Position Pill */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.12)', padding: '0.2rem 0.65rem', borderRadius: '9999px', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
                  Queue Position: #{trackedOrder.queuePosition || 1} ({trackedOrder.ordersAhead || 0} orders ahead)
                </span>
              </div>

              {/* 5-Step Pipeline */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                margin: '1.25rem 0',
                padding: '0.85rem 0.5rem',
                background: 'rgba(6, 10, 18, 0.65)',
                borderRadius: '14px',
                border: '1px solid var(--border-subtle)'
              }}>
                {['PENDING', 'PREPARING', 'PACKING', 'READY', 'COMPLETED'].map((st, idx) => {
                  const statusOrder = ['PENDING', 'PREPARING', 'PACKING', 'READY', 'COMPLETED'];
                  const currentIdx = statusOrder.indexOf(trackedOrder.orderStatus);
                  const isDone = currentIdx >= idx;
                  const isCurrent = currentIdx === idx;
                  return (
                    <div key={st} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                      <div style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: isDone ? 'var(--accent-emerald)' : 'rgba(255, 255, 255, 0.1)',
                        color: isDone ? '#000000' : '#ffffff',
                        fontSize: '0.75rem',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 0.35rem auto',
                        boxShadow: isCurrent ? '0 0 14px rgba(16, 185, 129, 0.8)' : 'none',
                        border: isCurrent ? '2px solid #ffffff' : 'none'
                      }}>
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span style={{ fontSize: '0.62rem', fontWeight: 800, color: isDone ? '#ffffff' : 'var(--text-muted)' }}>
                        {st}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Realistic Pickup Time Window */}
              <div style={{
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px dashed var(--accent-indigo)',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#a5b4fc', fontSize: '0.82rem', fontWeight: 800 }}>
                    <Clock size={15} />
                    <span>ESTIMATED PICKUP WINDOW</span>
                  </div>
                  <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#ffffff' }}>
                    {trackedOrder.estimatedPickupWindow || 'Calculating...'}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                  Estimated preparation time: <strong>~{trackedOrder.estimatedPrepDuration || 8} mins</strong>. Arrive at the counter during your pickup window to prevent roadside congestion.
                </p>
              </div>

              {/* Arrival Radar Widget */}
              <div style={{
                marginTop: '1rem',
                padding: '0.95rem',
                background: 'rgba(9, 14, 26, 0.85)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '14px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)', fontSize: '0.82rem', fontWeight: 800 }}>
                    <MapPin size={15} />
                    <span>GEOFENCE ARRIVAL RADAR</span>
                  </div>
                  <span className="badge badge-preparing" style={{ fontSize: '0.62rem', padding: '0.15rem 0.45rem' }}>
                    {useGps ? 'LIVE GPS' : 'SIMULATOR'}
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Distance to restaurant:{' '}
                  <strong style={{ color: '#ffffff' }}>
                    {useGps 
                      ? (gpsDistance !== null ? (gpsDistance < 1000 ? `${Math.round(gpsDistance)}m` : `${(gpsDistance / 1000).toFixed(2)}km`) : 'Locating...')
                      : (simNear ? '40m (Arrived Outside Counter)' : '2.4km (On the way)')
                    }
                  </strong>
                  {(simNear || (gpsDistance !== null && gpsDistance < 100)) && (
                    <span style={{ color: 'var(--accent-emerald)', marginLeft: '0.45rem', fontWeight: 800 }}>
                      ⚡ Packing staff alerted to hand over!
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setUseGps(!useGps)}
                    className={`btn ${useGps ? 'btn-primary' : 'btn-outline'}`}
                    style={{ fontSize: '0.7rem', padding: '0.35rem 0.65rem' }}
                  >
                    {useGps ? 'Switch to Simulator' : '🛰️ Use Live GPS'}
                  </button>

                  {!useGps ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setSimNear(true)}
                        className={`btn ${simNear ? 'btn-emerald' : 'btn-outline'}`}
                        style={{ fontSize: '0.7rem', padding: '0.35rem 0.65rem' }}
                      >
                        📍 Simulate Arrived (40m)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSimNear(false)}
                        className={`btn ${!simNear ? 'btn-primary' : 'btn-outline'}`}
                        style={{ fontSize: '0.7rem', padding: '0.35rem 0.65rem' }}
                      >
                        🚗 Simulate Far (2.4km)
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if ('geolocation' in navigator) {
                          navigator.geolocation.getCurrentPosition(
                            pos => {
                              setShopCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
                              alert('Shop coordinates pinned to current position!');
                            },
                            () => alert('GPS permission denied.')
                          );
                        }
                      }}
                      className="btn btn-outline"
                      style={{ fontSize: '0.7rem', padding: '0.35rem 0.65rem' }}
                    >
                      Pin Shop Here
                    </button>
                  )}
                </div>
              </div>

              {/* Items Summary & Customer Cancel Button */}
              <div style={{
                marginTop: '1rem',
                padding: '0.85rem',
                background: 'rgba(6, 10, 18, 0.6)',
                borderRadius: '12px',
                textAlign: 'left',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                  <strong style={{ fontSize: '0.82rem', color: '#ffffff' }}>Order Summary</strong>
                  <button
                    type="button"
                    onClick={() => setViewingReceiptOrder(trackedOrder)}
                    className="btn btn-outline"
                    style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}
                  >
                    <Printer size={11} /> Receipt Slip
                  </button>
                </div>
                {trackedOrder.items && trackedOrder.items.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', padding: '0.15rem 0' }}>
                    <span>{it.qty}x {it.name}</span>
                    <span>₹{it.qty * it.price}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', marginTop: '0.45rem', paddingTop: '0.45rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>
                  <span>Total Paid ({trackedOrder.paymentMode}):</span>
                  <span style={{ color: 'var(--accent-cyan)' }}>₹{trackedOrder.totalAmount}</span>
                </div>

                {trackedOrder.orderStatus === 'PENDING' && (
                  <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <button
                      type="button"
                      onClick={() => handleCancelOrder(trackedOrder.id)}
                      className="btn btn-outline"
                      style={{ width: '100%', fontSize: '0.75rem', borderColor: 'rgba(244, 63, 94, 0.4)', color: 'var(--accent-rose)' }}
                    >
                      <XCircle size={14} /> Cancel This Order (Before Prep Starts)
                    </button>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <AlertCircle size={40} color="var(--accent-indigo)" style={{ margin: '0 auto 0.75rem auto' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>No Active Order In Queue</h3>
              <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Select food items and confirm an online takeaway order to receive a live token.</p>
              <button
                type="button"
                onClick={() => setActiveTab('order')}
                className="btn btn-primary"
                style={{ marginTop: '1.25rem', fontSize: '0.85rem' }}
              >
                Browse Menu
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ORDER HISTORY */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              ORDER HISTORY ARCHIVE ({historyOrders.length})
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)' }}>
              Takeaway orders completed & handed over
            </span>
          </div>

          {historyOrders.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCheck size={40} color="var(--accent-cyan)" style={{ margin: '0 auto 0.75rem auto' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>No Completed Orders Yet</h4>
              <p style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>Your finished takeaway orders will be archived here for easy re-ordering.</p>
            </div>
          ) : (
            historyOrders.map(o => (
              <div key={o.id} className="glass-panel" style={{ padding: '1rem', borderLeft: o.orderStatus === 'CANCELLED' ? '4px solid var(--accent-rose)' : '4px solid var(--accent-cyan)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 900, fontSize: '1.05rem', color: '#ffffff' }}>Token #{o.token}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.45rem' }}>Online Takeaway</span>
                  </div>
                  <span className={`badge badge-${o.orderStatus.toLowerCase()}`} style={{ fontSize: '0.68rem' }}>
                    {o.orderStatus}
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.45rem' }}>
                  {o.items && o.items.map(it => `${it.qty}x ${it.name}`).join(' • ')}
                  {' • '}<strong>₹{o.totalAmount}</strong>
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.55rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.45rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <div>
                    Date: {new Date(o.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {o.paymentMode}
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => setViewingReceiptOrder(o)}
                      className="btn btn-outline"
                      style={{ fontSize: '0.7rem', padding: '0.25rem 0.55rem' }}
                    >
                      <Printer size={11} /> Receipt
                    </button>
                    {o.orderStatus !== 'CANCELLED' && (
                      <button
                        type="button"
                        onClick={() => handleReorder(o)}
                        className="btn btn-primary"
                        style={{ fontSize: '0.7rem', padding: '0.25rem 0.55rem' }}
                      >
                        <RotateCcw size={11} /> Re-Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* UPI CHECKOUT MODAL */}
      {showUpiModal && (
        <UpiPaymentModal
          amount={finalTotalAmount}
          customerName={customerName}
          customerPhone={customerPhone}
          itemsSummary={buildItemsPayload().map(i => `${i.qty}x ${i.name}`).join(', ')}
          upiId={restaurantUpiId}
          onPaymentSuccess={(paymentInfo) => executeOrderSubmission(paymentInfo.paymentMode, paymentInfo.transactionId)}
          onClose={() => setShowUpiModal(false)}
        />
      )}

      {/* RECEIPT MODAL */}
      {viewingReceiptOrder && (
        <TokenReceiptModal
          order={viewingReceiptOrder}
          onClose={() => setViewingReceiptOrder(null)}
        />
      )}

      {/* TOAST ALERT */}
      {toastMessage && (
        <div className="toast-notice">
          <Sparkles size={16} color="var(--accent-emerald)" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
