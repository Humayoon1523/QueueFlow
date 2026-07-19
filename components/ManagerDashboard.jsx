'use client';

import React, { useState } from 'react';
import { Store, DollarSign, Clock, Users, Send, Printer, CheckCircle2, History, ListFilter, Banknote } from 'lucide-react';

export default function ManagerDashboard({ orders, metrics, aiPrediction, onWalkinOrder, onNotifyCustomer, onPrintReceipt }) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [chapathiQty, setChapathiQty] = useState(4);
  const [chennaQty, setChennaQty] = useState(2);
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [submitting, setSubmitting] = useState(false);
  const [queueTab, setQueueTab] = useState('active');

  const chapathiPrice = 15;
  const chennaPrice = 30;
  const totalAmount = (chapathiQty * chapathiPrice) + (chennaQty * chennaPrice);

  const handleWalkinSubmit = async (e) => {
    e.preventDefault();
    if (chapathiQty <= 0 && chennaQty <= 0) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/walkin', {
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

  const activeOrders = orders.filter(o => o.orderStatus !== 'DELIVERED');
  const historyOrders = orders.filter(o => o.orderStatus === 'DELIVERED');

  const preparingCount = orders.filter(o => o.orderStatus === 'PREPARING').length;
  const readyCount = orders.filter(o => o.orderStatus === 'READY').length;
  const completedCount = historyOrders.length;

  const displayOrders = queueTab === 'active' ? activeOrders : historyOrders;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      
      {/* 4 Metric Cards */}
      <div className="metrics-grid">
        
        <div className="glass-panel" style={{ padding: '0.75rem 0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>TODAY'S REVENUE</span>
            <DollarSign size={15} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', marginTop: '0.15rem' }}>
            ₹{metrics?.todayRevenue || 0}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--accent-emerald)', marginTop: '0.1rem' }}>
            {orders.length} orders
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '0.75rem 0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>ACTIVE QUEUE</span>
            <Users size={15} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', marginTop: '0.15rem' }}>
            {activeOrders.length} Orders
          </div>
          <div style={{ fontSize: '0.65rem', color: '#cbd5e1', marginTop: '0.1rem' }}>
            {preparingCount} Prep • {readyCount} Ready
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '0.75rem 0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>AVG WAIT TIME</span>
            <Clock size={15} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', marginTop: '0.15rem' }}>
            {aiPrediction?.estimatedWaitMinutes || metrics?.avgWaitMinutes || 8} Mins
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)', marginTop: '0.1rem' }}>
            AI Model Optimized
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '0.75rem 0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>COMPLETED</span>
            <CheckCircle2 size={15} color="var(--accent-indigo)" />
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', marginTop: '0.15rem' }}>
            {completedCount} Orders
          </div>
          <div style={{ fontSize: '0.65rem', color: '#a5b4fc', marginTop: '0.1rem' }}>
            Archived in History
          </div>
        </div>

      </div>

      {/* Main POS vs Queue Grid */}
      <div className="main-pos-grid">
        
        {/* WALK-IN POS FORM */}
        <div className="glass-panel" style={{ padding: '0.85rem', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <Store size={18} color="var(--accent-indigo)" />
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Walk-in Counter POS</h3>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Instant Token Generation</p>
            </div>
          </div>

          <form onSubmit={handleWalkinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            
            <div>
              <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>CUSTOMER NAME (OPTIONAL)</label>
              <input
                type="text"
                className="input-field"
                placeholder="Walk-in Guest Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{ marginTop: '0.15rem', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>MOBILE NUMBER (FOR SMS/ALERT)</label>
              <input
                type="tel"
                className="input-field"
                placeholder="Customer Phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                style={{ marginTop: '0.15rem', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.65rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>🫓 Chapathi (₹15)</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <button type="button" onClick={() => setChapathiQty(Math.max(0, chapathiQty - 1))} className="btn btn-outline" style={{ padding: '0.1rem 0.4rem', fontSize: '0.85rem' }}>-</button>
                  <span style={{ fontWeight: 800, width: '18px', textAlign: 'center', fontSize: '0.85rem' }}>{chapathiQty}</span>
                  <button type="button" onClick={() => setChapathiQty(chapathiQty + 1)} className="btn btn-primary" style={{ padding: '0.1rem 0.4rem', fontSize: '0.85rem' }}>+</button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>🥘 Chenna Gravy (₹30)</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <button type="button" onClick={() => setChennaQty(Math.max(0, chennaQty - 1))} className="btn btn-outline" style={{ padding: '0.1rem 0.4rem', fontSize: '0.85rem' }}>-</button>
                  <span style={{ fontWeight: 800, width: '18px', textAlign: 'center', fontSize: '0.85rem' }}>{chennaQty}</span>
                  <button type="button" onClick={() => setChennaQty(chennaQty + 1)} className="btn btn-primary" style={{ padding: '0.1rem 0.4rem', fontSize: '0.85rem' }}>+</button>
                </div>
              </div>

            </div>

            <div>
              <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>PAYMENT MODE</label>
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.15rem' }}>
                <button
                  type="button"
                  onClick={() => setPaymentMode('CASH')}
                  className={`btn ${paymentMode === 'CASH' ? 'btn-emerald' : 'btn-outline'}`}
                  style={{ flex: 1, fontSize: '0.72rem', padding: '0.4rem' }}
                >
                  💵 Cash
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('UPI')}
                  className={`btn ${paymentMode === 'UPI' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ flex: 1, fontSize: '0.72rem', padding: '0.4rem' }}
                >
                  ⚡ Counter UPI
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
              <div>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>TOTAL</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--accent-emerald)' }}>₹{totalAmount}</div>
              </div>
              <button
                type="submit"
                disabled={submitting || (chapathiQty === 0 && chennaQty === 0)}
                className="btn btn-primary"
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem' }}
              >
                <Printer size={14} />
                {submitting ? 'Generating...' : 'Issue Token'}
              </button>
            </div>

          </form>
        </div>

        {/* UNIFIED QUEUE BOARD */}
        <div className="glass-panel" style={{ padding: '0.85rem', width: '100%', overflow: 'hidden' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', flexWrap: 'wrap', gap: '0.35rem' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Central Order Queue</h3>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {queueTab === 'active' ? 'Active Orders In Queue' : 'Handovered Order History'}
              </p>
            </div>

            <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.6)', padding: '0.15rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setQueueTab('active')}
                className={`btn ${queueTab === 'active' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.3rem 0.5rem', fontSize: '0.7rem' }}
              >
                <ListFilter size={12} /> Active ({activeOrders.length})
              </button>
              <button
                onClick={() => setQueueTab('history')}
                className={`btn ${queueTab === 'history' ? 'btn-emerald' : 'btn-outline'}`}
                style={{ padding: '0.3rem 0.5rem', fontSize: '0.7rem' }}
              >
                <History size={12} /> History ({historyOrders.length})
              </button>
            </div>

          </div>

          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem', minWidth: '450px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.45rem 0.35rem' }}>TOKEN</th>
                  <th style={{ padding: '0.45rem 0.35rem' }}>TYPE</th>
                  <th style={{ padding: '0.45rem 0.35rem' }}>CUSTOMER</th>
                  <th style={{ padding: '0.45rem 0.35rem' }}>ITEMS</th>
                  <th style={{ padding: '0.45rem 0.35rem' }}>PAYMENT</th>
                  <th style={{ padding: '0.45rem 0.35rem' }}>STATUS</th>
                  <th style={{ padding: '0.45rem 0.35rem' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {displayOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                      {queueTab === 'active' 
                        ? 'No active orders in queue.' 
                        : 'No completed orders in history.'}
                    </td>
                  </tr>
                ) : (
                  displayOrders.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      
                      <td style={{ padding: '0.5rem 0.35rem', fontWeight: 900, fontSize: '0.95rem', color: '#ffffff' }}>
                        #{o.token}
                      </td>

                      <td style={{ padding: '0.5rem 0.35rem' }}>
                        <span style={{
                          padding: '0.1rem 0.35rem',
                          borderRadius: '4px',
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          background: o.orderType === 'ONLINE' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: o.orderType === 'ONLINE' ? 'var(--accent-cyan)' : 'var(--accent-amber)'
                        }}>
                          {o.orderType}
                        </span>
                      </td>

                      <td style={{ padding: '0.5rem 0.35rem' }}>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>{o.customerName}</div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{o.customerPhone}</div>
                      </td>

                      <td style={{ padding: '0.5rem 0.35rem', fontWeight: 700 }}>
                        🫓 {o.chapathiQty} • 🥘 {o.chennaQty}
                        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>₹{o.totalAmount}</div>
                      </td>

                      <td style={{ padding: '0.5rem 0.35rem' }}>
                        {o.paymentMode === 'CASH_ON_PICKUP' ? (
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.15)', padding: '0.15rem 0.4rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            <Banknote size={11} /> CASH AT PICKUP
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.65rem', color: '#a5b4fc' }}>
                            {o.paymentMode}
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '0.5rem 0.35rem' }}>
                        <span className={`badge badge-${o.orderStatus.toLowerCase()}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                          {o.orderStatus}
                        </span>
                      </td>

                      <td style={{ padding: '0.5rem 0.35rem' }}>
                        {o.orderStatus === 'DELIVERED' ? (
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            {new Date(o.completedAt || o.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : (
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button
                              onClick={() => onPrintReceipt(o)}
                              className="btn btn-outline"
                              style={{ padding: '0.2rem 0.35rem', fontSize: '0.68rem' }}
                            >
                              <Printer size={11} />
                            </button>
                            
                            {o.orderStatus === 'READY' && (
                              <button
                                onClick={() => onNotifyCustomer(o.id)}
                                className="btn btn-emerald"
                                style={{ padding: '0.2rem 0.35rem', fontSize: '0.68rem' }}
                              >
                                <Send size={11} /> Alert
                              </button>
                            )}
                          </div>
                        )}
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
