import React, { useState } from 'react';
import { ShoppingBag, Clock, Sparkles, AlertCircle, CheckCircle2, History, ChevronRight, UserCheck, Utensils } from 'lucide-react';

export default function CustomerApp({ menu, onPlaceOrder, activeOrders, aiPrediction }) {
  const [activeTab, setActiveTab] = useState('order'); // 'order', 'track', 'history'
  const [customerName, setCustomerName] = useState('Anand S.');
  const [customerPhone, setCustomerPhone] = useState('9876543210');
  
  // Quantity states
  const [chapathiQty, setChapathiQty] = useState(4);
  const [chennaQty, setChennaQty] = useState(2);
  const [paymentMode, setPaymentMode] = useState('ONLINE_UPI');
  const [lastPlacedToken, setLastPlacedToken] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const chapathiPrice = 15;
  const chennaPrice = 30;
  const totalAmount = (chapathiQty * chapathiPrice) + (chennaQty * chennaPrice);

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (chapathiQty <= 0 && chennaQty <= 0) return;
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          chapathiQty,
          chennaQty,
          paymentMode
        })
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setLastPlacedToken(data.order.token);
        onPlaceOrder(data.order);
        setActiveTab('track');
      }
    } catch (err) {
      console.error('Failed to submit order:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Find customer active tracked order
  const trackedOrder = activeOrders.find(o => o.token === lastPlacedToken) || activeOrders[0];

  const eta = aiPrediction?.etaRecommendation || {
    estimatedPickupTime: '6:42 PM',
    suggestedArrivalTime: '6:37 PM',
    customerMessage: 'Please arrive 5 minutes before pickup time to prevent roadside traffic congestion.'
  };

  return (
    <div className="phone-frame">
      <div className="phone-notch"></div>
      
      {/* App Header Inside Mobile Shell */}
      <div style={{
        background: 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)',
        padding: '1.25rem 1.25rem 1rem 1.25rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="live-dot"></span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>TAKEAWAY HUB ACTIVE</span>
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
              QueueFlow Pre-Order
            </h2>
          </div>
          <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.4rem 0.6rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#a5b4fc' }}>
            <UserCheck size={14} />
            <span>{customerName}</span>
          </div>
        </div>

        {/* AI ETA Banner */}
        <div style={{
          marginTop: '0.85rem',
          background: 'rgba(6, 182, 212, 0.12)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          borderRadius: '12px',
          padding: '0.65rem 0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <Sparkles size={20} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              AI QUEUE ETA: ~{aiPrediction?.estimatedWaitMinutes || 8} MINS WAIT
            </div>
            <div style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: '0.1rem' }}>
              Arrive at <strong>{eta.suggestedArrivalTime}</strong> for seamless pickup!
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.9)', borderBottom: '1px solid var(--border-color)' }}>
        <button
          onClick={() => setActiveTab('order')}
          style={{
            flex: 1,
            padding: '0.65rem',
            background: activeTab === 'order' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'order' ? '2px solid var(--accent-indigo)' : '2px solid transparent',
            color: activeTab === 'order' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem'
          }}
        >
          <Utensils size={14} />
          Menu & Order
        </button>

        <button
          onClick={() => setActiveTab('track')}
          style={{
            flex: 1,
            padding: '0.65rem',
            background: activeTab === 'track' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'track' ? '2px solid var(--accent-indigo)' : '2px solid transparent',
            color: activeTab === 'track' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem'
          }}
        >
          <Clock size={14} />
          Track Token
          {trackedOrder && (
            <span style={{ background: '#10b981', color: '#fff', borderRadius: '9999px', width: '18px', height: '18px', fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              !
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          style={{
            flex: 1,
            padding: '0.65rem',
            background: activeTab === 'history' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'history' ? '2px solid var(--accent-indigo)' : '2px solid transparent',
            color: activeTab === 'history' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem'
          }}
        >
          <History size={14} />
          History
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ padding: '1rem', height: '540px', overflowY: 'auto' }}>
        
        {/* TAB 1: MENU & ORDER */}
        {activeTab === 'order' && (
          <form onSubmit={handleOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Customer Contact Details */}
            <div className="glass-panel" style={{ padding: '0.85rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                CUSTOMER INFORMATION
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Your Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
                <input
                  type="tel"
                  className="input-field"
                  placeholder="Mobile Phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Menu Items Counter */}
            <div className="glass-panel" style={{ padding: '0.85rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                SELECT TAKEAWAY QUANTITIES
              </div>
              
              {/* Chapathi Item Card */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                background: 'rgba(15, 23, 42, 0.5)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                marginBottom: '0.65rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.8rem' }}>🫓</span>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Special Hot Chapathi</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹15 per piece</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0f172a', padding: '0.25rem 0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <button
                    type="button"
                    onClick={() => setChapathiQty(Math.max(0, chapathiQty - 1))}
                    style={{ width: '28px', height: '28px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <span style={{ width: '24px', textAlign: 'center', fontWeight: 800, fontSize: '0.95rem' }}>{chapathiQty}</span>
                  <button
                    type="button"
                    onClick={() => setChapathiQty(chapathiQty + 1)}
                    style={{ width: '28px', height: '28px', background: 'var(--accent-indigo)', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Chenna Item Card */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                background: 'rgba(15, 23, 42, 0.5)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.8rem' }}>🥘</span>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Spicy Chenna Gravy</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹30 per container</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0f172a', padding: '0.25rem 0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <button
                    type="button"
                    onClick={() => setChennaQty(Math.max(0, chennaQty - 1))}
                    style={{ width: '28px', height: '28px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <span style={{ width: '24px', textAlign: 'center', fontWeight: 800, fontSize: '0.95rem' }}>{chennaQty}</span>
                  <button
                    type="button"
                    onClick={() => setChennaQty(chennaQty + 1)}
                    style={{ width: '28px', height: '28px', background: 'var(--accent-indigo)', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="glass-panel" style={{ padding: '0.85rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                ONLINE PAYMENT METHOD
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setPaymentMode('ONLINE_UPI')}
                  className={`btn ${paymentMode === 'ONLINE_UPI' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ fontSize: '0.75rem', padding: '0.5rem' }}
                >
                  ⚡ Instant UPI / GPay
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('CARD')}
                  className={`btn ${paymentMode === 'CARD' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ fontSize: '0.75rem', padding: '0.5rem' }}
                >
                  💳 Debit / Credit Card
                </button>
              </div>
            </div>

            {/* Order Total & Submit Action */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(6, 182, 212, 0.2))',
              border: '1px solid var(--accent-indigo)',
              borderRadius: '16px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL PAYABLE</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>₹{totalAmount}</div>
              </div>
              <button
                type="submit"
                disabled={submitting || (chapathiQty === 0 && chennaQty === 0)}
                className="btn btn-emerald"
                style={{ padding: '0.75rem 1.25rem', fontSize: '0.9rem' }}
              >
                <ShoppingBag size={18} />
                {submitting ? 'Generating Token...' : 'Pay & Pre-Order'}
              </button>
            </div>

          </form>
        )}

        {/* TAB 2: LIVE TOKEN TRACKER */}
        {activeTab === 'track' && (
          <div>
            {trackedOrder ? (
              <div className="glass-panel-glow" style={{ padding: '1.25rem', textAlign: 'center' }}>
                
                <span className="badge badge-ready" style={{ marginBottom: '0.5rem' }}>
                  <CheckCircle2 size={12} /> LIVE ORDER TRACKER
                </span>

                <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  YOUR CONFIRMED TOKEN NUMBER
                </h3>
                
                <div style={{
                  fontSize: '3.8rem',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #a5b4fc, #ffffff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: '0.2rem 0'
                }}>
                  #{trackedOrder.token}
                </div>

                {/* Status Badge */}
                <div style={{ margin: '0.75rem 0' }}>
                  <span className={`badge badge-${trackedOrder.orderStatus.toLowerCase()}`} style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                    STATUS: {trackedOrder.orderStatus}
                  </span>
                </div>

                {/* Dynamic Visual Progress Stepper */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  margin: '1.25rem 0',
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
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: isDone ? '#10b981' : '#334155',
                          color: '#fff',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 0.3rem auto',
                          boxShadow: isDone ? '0 0 10px rgba(16,185,129,0.5)' : 'none'
                        }}>
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: isDone ? '#ffffff' : '#64748b' }}>
                          {st}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* AI Pickup Advice */}
                <div style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px dashed var(--accent-indigo)',
                  borderRadius: '12px',
                  padding: '0.85rem',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a5b4fc', fontSize: '0.8rem', fontWeight: 700 }}>
                    <Clock size={16} />
                    <span>AI SMART PICKUP GUIDANCE</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#e2e8f0', marginTop: '0.35rem' }}>
                    {eta.customerMessage}
                  </p>
                </div>

                {/* Order Summary Details */}
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  background: 'rgba(15, 23, 42, 0.4)',
                  borderRadius: '10px',
                  textAlign: 'left',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)'
                }}>
                  <div><strong>Items:</strong> {trackedOrder.chapathiQty}x Chapathi, {trackedOrder.chennaQty}x Chenna</div>
                  <div><strong>Payment:</strong> ₹{trackedOrder.totalAmount} ({trackedOrder.paymentMode})</div>
                  <div><strong>Order Type:</strong> {trackedOrder.orderType} Pre-order</div>
                </div>

              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <AlertCircle size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem auto' }} />
                <p>No active order tracked yet.</p>
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
            {activeOrders.map(o => (
              <div key={o.id} className="glass-panel" style={{ padding: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ffffff' }}>Token #{o.token}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>{o.orderType}</span>
                  </div>
                  <span className={`badge badge-${o.orderStatus.toLowerCase()}`}>{o.orderStatus}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.4rem' }}>
                  {o.chapathiQty} Chapathi + {o.chennaQty} Chenna Gravy • ₹{o.totalAmount}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
