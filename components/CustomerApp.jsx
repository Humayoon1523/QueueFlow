'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, Sparkles, AlertCircle, CheckCircle2, History, UserCheck, Utensils, CheckCheck, ArrowRight, Download, Banknote, CreditCard, Zap, Lock } from 'lucide-react';
import UpiPaymentModal from '@/components/UpiPaymentModal';

export default function CustomerApp({ menu, onPlaceOrder, activeOrders, aiPrediction }) {
  const [activeTab, setActiveTab] = useState('order');
  const [customerName, setCustomerName] = useState('Anand S.');
  const [customerPhone, setCustomerPhone] = useState('9876543210');
  
  const [chapathiQty, setChapathiQty] = useState(4);
  const [chennaQty, setChennaQty] = useState(2);
  const [paymentMode, setPaymentMode] = useState('ONLINE_UPI'); // 'ONLINE_UPI', 'CARD', 'CASH_ON_PICKUP'
  
  const [restaurantUpiId, setRestaurantUpiId] = useState('9876543210@okicici');
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [pendingOrderPayload, setPendingOrderPayload] = useState(null);

  const [lastPlacedToken, setLastPlacedToken] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const chapathiPrice = 15;
  const chennaPrice = 30;
  const totalAmount = (chapathiQty * chapathiPrice) + (chennaQty * chennaPrice);

  const handleOrderClick = (e) => {
    e.preventDefault();
    if (chapathiQty <= 0 && chennaQty <= 0) return;

    if (paymentMode === 'CASH_ON_PICKUP') {
      // Direct Cash on Pickup submission
      executeOrderSubmission('CASH_ON_PICKUP');
    } else {
      // Launch Instant UPI Payment Gateway Modal!
      setPendingOrderPayload({
        customerName,
        customerPhone,
        chapathiQty,
        chennaQty,
        paymentMode
      });
      setShowUpiModal(true);
    }
  };

  const executeOrderSubmission = async (selectedPaymentMode, transactionId = null) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          chapathiQty,
          chennaQty,
          paymentMode: selectedPaymentMode,
          transactionId
        })
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setLastPlacedToken(data.order.token);
        onPlaceOrder(data.order);
        setShowUpiModal(false);
        setActiveTab('track');
      }
    } catch (err) {
      console.error('Failed to submit order:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePwaInstall = () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.then(() => {
        setDeferredInstallPrompt(null);
      });
    } else {
      alert(
        'PWA Installation Guide:\n\n' +
        '1. Android (Chrome): Tap Chrome Menu (⋮) -> "Install app" or "Add to Home screen".\n' +
        '2. iPhone (Safari): Tap Share (⎋) -> "Add to Home Screen".'
      );
    }
  };

  const trackedOrder = activeOrders.find(o => o.token === lastPlacedToken) || activeOrders[0];
  const historyOrders = activeOrders.filter(o => o.orderStatus === 'DELIVERED');

  const eta = aiPrediction?.etaRecommendation || {
    estimatedPickupTime: '6:42 PM',
    suggestedArrivalTime: '6:37 PM',
    customerMessage: 'Please arrive 5 minutes before pickup time to prevent roadside traffic congestion.'
  };

  return (
    <div style={{ width: '100%', maxWidth: '640px', margin: '0 auto', padding: '0 0 4rem 0' }}>
      
      {/* HEADER */}
      <div className="glass-panel" style={{ padding: '1.1rem', marginBottom: '0.85rem', borderTop: '4px solid var(--accent-indigo)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.65rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="live-dot"></span>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--accent-emerald)', letterSpacing: '0.05em' }}>
                TAKEAWAY PRE-ORDER HUB
              </span>
            </div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', marginTop: '0.15rem' }}>
              QueueFlow AI
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.35rem 0.65rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#a5b4fc' }}>
              <UserCheck size={14} />
              <span>{customerName}</span>
            </div>

            <button
              onClick={handlePwaInstall}
              className="btn btn-outline"
              style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem' }}
            >
              <Download size={13} /> Install App
            </button>

            <a
              href="/manager"
              className="btn btn-outline"
              style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem', color: '#a5b4fc', borderColor: 'rgba(165, 180, 252, 0.35)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Lock size={13} /> Staff Portal
            </a>
          </div>
        </div>

        {/* AI ETA Banner */}
        <div style={{
          marginTop: '0.75rem',
          background: 'rgba(6, 182, 212, 0.12)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          borderRadius: '10px',
          padding: '0.65rem 0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem'
        }}>
          <Sparkles size={18} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              AI QUEUE ETA: ~{aiPrediction?.estimatedWaitMinutes || 8} MINS WAIT
            </div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '0.1rem' }}>
              Suggested Arrival: <strong>{eta.suggestedArrivalTime}</strong> for fast pickup
            </div>
          </div>
        </div>

      </div>

      {/* TOP NAVIGATION TABS */}
      <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.8)', padding: '0.3rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '0.85rem' }}>
        <button
          onClick={() => setActiveTab('order')}
          className={`btn ${activeTab === 'order' ? 'btn-primary' : 'btn-outline'}`}
          style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem', border: 'none' }}
        >
          <Utensils size={15} />
          Menu & Order
        </button>

        <button
          onClick={() => setActiveTab('track')}
          className={`btn ${activeTab === 'track' ? 'btn-primary' : 'btn-outline'}`}
          style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem', border: 'none' }}
        >
          <Clock size={15} />
          Track Token
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-outline'}`}
          style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem', border: 'none' }}
        >
          <History size={15} />
          History ({historyOrders.length})
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div>
        
        {/* TAB 1: MENU & ORDER */}
        {activeTab === 'order' && (
          <form onSubmit={handleOrderClick} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            
            <div className="glass-panel" style={{ padding: '0.85rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                CUSTOMER INFORMATION
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div>
                  <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Your Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    style={{ padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Phone</label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="Mobile Phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    style={{ padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '0.85rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
                SELECT TAKEAWAY QUANTITIES
              </div>
              
              {/* Chapathi Card */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                marginBottom: '0.65rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.8rem' }}>🫓</span>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>Hot Chapathi</h3>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>₹15 per piece</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0f172a', padding: '0.25rem 0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <button
                    type="button"
                    onClick={() => setChapathiQty(Math.max(0, chapathiQty - 1))}
                    style={{ width: '30px', height: '30px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <span style={{ width: '24px', textAlign: 'center', fontWeight: 900, fontSize: '1rem', color: '#ffffff' }}>{chapathiQty}</span>
                  <button
                    type="button"
                    onClick={() => setChapathiQty(chapathiQty + 1)}
                    style={{ width: '30px', height: '30px', background: 'var(--accent-indigo)', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Chenna Card */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.8rem' }}>🥘</span>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>Spicy Chenna Gravy</h3>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>₹30 per container</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0f172a', padding: '0.25rem 0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <button
                    type="button"
                    onClick={() => setChennaQty(Math.max(0, chennaQty - 1))}
                    style={{ width: '30px', height: '30px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <span style={{ width: '24px', textAlign: 'center', fontWeight: 900, fontSize: '1rem', color: '#ffffff' }}>{chennaQty}</span>
                  <button
                    type="button"
                    onClick={() => setChennaQty(chennaQty + 1)}
                    style={{ width: '30px', height: '30px', background: 'var(--accent-indigo)', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* PAYMENT METHOD SELECTOR */}
            <div className="glass-panel" style={{ padding: '0.85rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                PAYMENT METHOD FOR TAKEOUT
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => setPaymentMode('ONLINE_UPI')}
                  className={`btn ${paymentMode === 'ONLINE_UPI' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.8rem', padding: '0.55rem 0.85rem' }}
                >
                  <Zap size={16} color="var(--accent-cyan)" /> ⚡ Instant GPay / PhonePe / Paytm UPI
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('CARD')}
                  className={`btn ${paymentMode === 'CARD' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.8rem', padding: '0.55rem 0.85rem' }}
                >
                  <CreditCard size={16} color="var(--accent-indigo)" /> Debit / Credit Card Online
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('CASH_ON_PICKUP')}
                  className={`btn ${paymentMode === 'CASH_ON_PICKUP' ? 'btn-emerald' : 'btn-outline'}`}
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.8rem', padding: '0.55rem 0.85rem' }}
                >
                  <Banknote size={16} color="var(--accent-emerald)" /> 💵 Pay Cash on Takeout / Pickup
                </button>
              </div>

              {/* Configure Restaurant UPI ID Field */}
              <div style={{ marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  RESTAURANT RECEIVING UPI ID (SET YOUR CUSTOM UPI ID)
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={restaurantUpiId}
                  onChange={(e) => setRestaurantUpiId(e.target.value)}
                  placeholder="e.g. 9876543210@okicici or queueflow@upi"
                  style={{ marginTop: '0.2rem', padding: '0.45rem 0.75rem', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}
                />
              </div>

            </div>

            {/* Checkout Footer Bar */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(6, 182, 212, 0.25))',
              border: '1px solid var(--accent-indigo)',
              borderRadius: '14px',
              padding: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)'
            }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL AMOUNT</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff' }}>₹{totalAmount}</div>
                <div style={{ fontSize: '0.68rem', color: paymentMode === 'CASH_ON_PICKUP' ? 'var(--accent-emerald)' : '#a5b4fc', fontWeight: 700 }}>
                  {paymentMode === 'CASH_ON_PICKUP' ? '💵 Cash on Pickup' : '⚡ Instant GPay / UPI'}
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting || (chapathiQty === 0 && chennaQty === 0)}
                className="btn btn-emerald"
                style={{ padding: '0.75rem 1.25rem', fontSize: '0.9rem', fontWeight: 800 }}
              >
                <ShoppingBag size={17} />
                {submitting ? 'Generating...' : (paymentMode === 'CASH_ON_PICKUP' ? 'Reserve & Get Token' : 'Proceed to Pay ₹' + totalAmount)}
              </button>
            </div>

          </form>
        )}

        {/* TAB 2: LIVE TOKEN TRACKER */}
        {activeTab === 'track' && (
          <div>
            {trackedOrder ? (
              <div className="glass-panel-glow" style={{ padding: '1.25rem', textAlign: 'center' }}>
                
                {trackedOrder.orderStatus === 'DELIVERED' ? (
                  <div style={{ background: 'rgba(6, 182, 212, 0.15)', border: '1px solid var(--accent-cyan)', borderRadius: '12px', padding: '0.85rem', marginBottom: '1rem' }}>
                    <span className="badge badge-delivered" style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>
                      <CheckCheck size={14} /> ORDER HANDOVER COMPLETE
                    </span>
                    <h3 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: 800, marginTop: '0.4rem' }}>
                      Food Handed Over & Moved to History!
                    </h3>
                    <p style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                      Completed at {new Date(trackedOrder.completedAt || trackedOrder.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <button
                      onClick={() => setActiveTab('history')}
                      className="btn btn-emerald"
                      style={{ marginTop: '0.65rem', fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                    >
                      View Order History <ArrowRight size={14} />
                    </button>
                  </div>
                ) : (
                  <span className="badge badge-ready" style={{ marginBottom: '0.5rem' }}>
                    <CheckCircle2 size={12} /> LIVE ORDER TRACKER
                  </span>
                )}

                <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  CONFIRMED TOKEN NUMBER
                </h3>
                
                <div style={{
                  fontSize: '4rem',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #a5b4fc, #ffffff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: '0.1rem 0'
                }}>
                  #{trackedOrder.token}
                </div>

                <div style={{ margin: '0.65rem 0' }}>
                  <span className={`badge badge-${trackedOrder.orderStatus.toLowerCase()}`} style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}>
                    STATUS: {trackedOrder.orderStatus}
                  </span>
                </div>

                {/* Stepper */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  margin: '1.1rem 0',
                  padding: '0.75rem 0.5rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  borderRadius: '12px'
                }}>
                  {['PENDING', 'PREPARING', 'PACKING', 'READY'].map((st, idx) => {
                    const statusOrder = ['PENDING', 'PREPARING', 'PACKING', 'READY', 'DELIVERED'];
                    const currentIdx = statusOrder.indexOf(trackedOrder.orderStatus);
                    const isDone = currentIdx >= idx;
                    return (
                      <div key={st} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                        <div style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: isDone ? '#10b981' : '#334155',
                          color: '#fff',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 0.3rem auto',
                          boxShadow: isDone ? '0 0 12px rgba(16,185,129,0.5)' : 'none'
                        }}>
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: isDone ? '#ffffff' : '#64748b' }}>
                          {st}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px dashed var(--accent-indigo)',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#a5b4fc', fontSize: '0.85rem', fontWeight: 700 }}>
                    <Clock size={15} />
                    <span>AI SMART PICKUP GUIDANCE</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#e2e8f0', marginTop: '0.3rem' }}>
                    {eta.customerMessage}
                  </p>
                </div>

                <div style={{
                  marginTop: '0.85rem',
                  padding: '0.75rem',
                  background: 'rgba(15, 23, 42, 0.4)',
                  borderRadius: '10px',
                  textAlign: 'left',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)'
                }}>
                  <div><strong>Items:</strong> {trackedOrder.chapathiQty}x Chapathi, {trackedOrder.chennaQty}x Chenna</div>
                  <div><strong>Payment Mode:</strong> {trackedOrder.paymentMode === 'CASH_ON_PICKUP' ? '💵 Pay Cash at Counter on Pickup' : `⚡ Online UPI (Verified)`} (₹{trackedOrder.totalAmount})</div>
                  <div><strong>Order Type:</strong> {trackedOrder.orderType} Pre-order</div>
                </div>

              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <AlertCircle size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem auto' }} />
                <p style={{ fontSize: '0.95rem' }}>No active order tracked yet.</p>
                <button onClick={() => setActiveTab('order')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  Place First Order
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ORDER HISTORY */}
        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.2rem', letterSpacing: '0.04em' }}>
              HANDOVERED ORDER HISTORY
            </div>

            {historyOrders.length === 0 ? (
              <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <CheckCheck size={40} color="var(--accent-cyan)" style={{ margin: '0 auto 0.5rem auto' }} />
                <p style={{ fontSize: '0.95rem' }}>No completed orders in history yet.</p>
                <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>When staff marks an order as DELIVERED, it moves here automatically.</p>
              </div>
            ) : (
              historyOrders.map(o => (
                <div key={o.id} className="glass-panel" style={{ padding: '0.85rem', borderLeft: '4px solid var(--accent-cyan)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 900, fontSize: '1rem', color: '#ffffff' }}>Token #{o.token}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>{o.orderType}</span>
                    </div>
                    <span className="badge badge-delivered" style={{ fontSize: '0.68rem' }}>
                      <CheckCheck size={10} /> HANDOVERED
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.35rem' }}>
                    🫓 {o.chapathiQty} Chapathi + 🥘 {o.chennaQty} Chenna • ₹{o.totalAmount}
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.35rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Customer: {o.customerName}</span>
                    <span>Payment: {o.paymentMode === 'CASH_ON_PICKUP' ? 'Cash on Pickup' : 'Online UPI'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      {/* INSTANT UPI PAYMENT MODAL */}
      {showUpiModal && (
        <UpiPaymentModal
          amount={totalAmount}
          customerName={customerName}
          customerPhone={customerPhone}
          itemsSummary={`🫓 ${chapathiQty} Chapathi, 🥘 ${chennaQty} Chenna Gravy`}
          upiId={restaurantUpiId}
          onPaymentSuccess={(paymentInfo) => executeOrderSubmission(paymentInfo.paymentMode, paymentInfo.transactionId)}
          onClose={() => setShowUpiModal(false)}
        />
      )}

    </div>
  );
}
