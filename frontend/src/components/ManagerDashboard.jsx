import React, { useState } from 'react';
import { Store, UserPlus, DollarSign, Clock, Users, Send, Printer, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

export default function ManagerDashboard({ orders, metrics, aiPrediction, onWalkinOrder, onNotifyCustomer, onPrintReceipt }) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [chapathiQty, setChapathiQty] = useState(4);
  const [chennaQty, setChennaQty] = useState(2);
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [submitting, setSubmitting] = useState(false);

  const chapathiPrice = 15;
  const chennaPrice = 30;
  const totalAmount = (chapathiQty * chapathiPrice) + (chennaQty * chennaPrice);

  const handleWalkinSubmit = async (e) => {
    e.preventDefault();
    if (chapathiQty <= 0 && chennaQty <= 0) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/walkin-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName || 'Walk-in Counter Guest',
          customerPhone: customerPhone || 'Counter',
          chapathiQty,
          chennaQty,
          paymentMode
        })
      });
      const data = await res.json();
      if (res.ok && data.order) {
        onWalkinOrder(data.order);
        onPrintReceipt(data.order);
        setCustomerName('');
        setCustomerPhone('');
        setChapathiQty(4);
        setChennaQty(2);
      }
    } catch (err) {
      console.error('Walk-in POS submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const preparingCount = orders.filter(o => o.orderStatus === 'PREPARING').length;
  const readyCount = orders.filter(o => o.orderStatus === 'READY').length;
  const completedCount = orders.filter(o => o.orderStatus === 'DELIVERED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        <div className="glass-panel" style={{ padding: '1.1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TODAY'S REVENUE</span>
            <DollarSign size={20} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginTop: '0.3rem' }}>
            ₹{metrics?.todayRevenue || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <TrendingUp size={12} /> {orders.length} total orders recorded
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>ACTIVE QUEUE</span>
            <Users size={20} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginTop: '0.3rem' }}>
            {orders.filter(o => o.orderStatus !== 'DELIVERED').length} Orders
          </div>
          <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
            {preparingCount} Preparing • {readyCount} Ready
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>AVG WAIT TIME</span>
            <Clock size={20} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginTop: '0.3rem' }}>
            {aiPrediction?.estimatedWaitMinutes || metrics?.avgWaitMinutes || 8} Mins
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>
            AI Real-time optimized
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>COMPLETED TODAY</span>
            <CheckCircle2 size={20} color="var(--accent-indigo)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginTop: '0.3rem' }}>
            {completedCount} Orders
          </div>
          <div style={{ fontSize: '0.75rem', color: '#a5b4fc', marginTop: '0.2rem' }}>
            100% token dispatch accuracy
          </div>
        </div>

      </div>

      {/* Main Grid: Walk-in POS vs Unified Queue Board */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem' }}>
        
        {/* MODULE 2: WALK-IN POS ORDERING PANEL */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <Store size={22} color="var(--accent-indigo)" />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Walk-in Counter POS</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Instant Token Generation</p>
            </div>
          </div>

          <form onSubmit={handleWalkinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>CUSTOMER NAME (OPTIONAL)</label>
              <input
                type="text"
                className="input-field"
                placeholder="Walk-in Guest Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{ marginTop: '0.25rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>MOBILE NUMBER (FOR SMS/ALERT)</label>
              <input
                type="tel"
                className="input-field"
                placeholder="Customer Phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                style={{ marginTop: '0.25rem' }}
              />
            </div>

            {/* Quantity Selector */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>🫓 Chapathi (₹15)</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button type="button" onClick={() => setChapathiQty(Math.max(0, chapathiQty - 1))} className="btn btn-outline" style={{ padding: '0.2rem 0.5rem' }}>-</button>
                  <span style={{ fontWeight: 800, width: '20px', textAlign: 'center' }}>{chapathiQty}</span>
                  <button type="button" onClick={() => setChapathiQty(chapathiQty + 1)} className="btn btn-primary" style={{ padding: '0.2rem 0.5rem' }}>+</button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>🥘 Chenna Gravy (₹30)</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button type="button" onClick={() => setChennaQty(Math.max(0, chennaQty - 1))} className="btn btn-outline" style={{ padding: '0.2rem 0.5rem' }}>-</button>
                  <span style={{ fontWeight: 800, width: '20px', textAlign: 'center' }}>{chennaQty}</span>
                  <button type="button" onClick={() => setChennaQty(chennaQty + 1)} className="btn btn-primary" style={{ padding: '0.2rem 0.5rem' }}>+</button>
                </div>
              </div>

            </div>

            {/* Payment Mode */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>PAYMENT MODE</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => setPaymentMode('CASH')}
                  className={`btn ${paymentMode === 'CASH' ? 'btn-emerald' : 'btn-outline'}`}
                  style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}
                >
                  💵 Cash
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('UPI')}
                  className={`btn ${paymentMode === 'UPI' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}
                >
                  ⚡ Counter UPI
                </button>
              </div>
            </div>

            {/* Total Amount & Token Submit */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TOTAL</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>₹{totalAmount}</div>
              </div>
              <button
                type="submit"
                disabled={submitting || (chapathiQty === 0 && chennaQty === 0)}
                className="btn btn-primary"
                style={{ padding: '0.7rem 1rem' }}
              >
                <Printer size={16} />
                {submitting ? 'Generating...' : 'Issue Token'}
              </button>
            </div>

          </form>
        </div>

        {/* UNIFIED QUEUE MANAGEMENT BOARD */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Central Unified Queue</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Syncs Walk-in & Online Pre-orders automatically</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className="badge badge-pending">Online & Walk-in Queue</span>
            </div>
          </div>

          {/* Queue List Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.65rem' }}>TOKEN</th>
                  <th style={{ padding: '0.65rem' }}>TYPE</th>
                  <th style={{ padding: '0.65rem' }}>CUSTOMER</th>
                  <th style={{ padding: '0.65rem' }}>QUANTITY</th>
                  <th style={{ padding: '0.65rem' }}>STATUS</th>
                  <th style={{ padding: '0.65rem' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No orders currently in the queue.
                    </td>
                  </tr>
                ) : (
                  orders.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: o.orderStatus === 'READY' ? 'rgba(16, 185, 129, 0.05)' : 'transparent' }}>
                      
                      <td style={{ padding: '0.75rem', fontWeight: 900, fontSize: '1.1rem', color: '#ffffff' }}>
                        #{o.token}
                      </td>

                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: o.orderType === 'ONLINE' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: o.orderType === 'ONLINE' ? 'var(--accent-cyan)' : 'var(--accent-amber)'
                        }}>
                          {o.orderType}
                        </span>
                      </td>

                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>{o.customerName}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{o.customerPhone}</div>
                      </td>

                      <td style={{ padding: '0.75rem', fontWeight: 700 }}>
                        🫓 {o.chapathiQty} • 🥘 {o.chennaQty}
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>₹{o.totalAmount}</div>
                      </td>

                      <td style={{ padding: '0.75rem' }}>
                        <span className={`badge badge-${o.orderStatus.toLowerCase()}`}>
                          {o.orderStatus}
                        </span>
                      </td>

                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => onPrintReceipt(o)}
                            className="btn btn-outline"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                            title="Print Token Receipt"
                          >
                            <Printer size={14} /> Print
                          </button>
                          
                          {o.orderStatus === 'READY' && (
                            <button
                              onClick={() => onNotifyCustomer(o.id)}
                              className="btn btn-emerald"
                              style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                              title="Call / Alert Customer"
                            >
                              <Send size={14} /> {o.notifiedCustomer ? 'Notified' : 'Alert'}
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  );
}
