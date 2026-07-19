import React, { useState } from 'react';
import { PackageCheck, Volume2, Play, CheckCircle, Send, ChefHat, Sparkles, Layers } from 'lucide-react';

export default function DeliveryDashboard({ orders, metrics, onUpdateStatus }) {
  const [announcementText, setAnnouncementText] = useState('');

  // Active uncollected orders
  const activeOrders = orders.filter(o => o.orderStatus !== 'DELIVERED');

  // Total required food quantities for kitchen cooks
  const totalChapathisToCook = activeOrders.reduce((sum, o) => sum + (o.chapathiQty || 0), 0);
  const totalChennaToCook = activeOrders.reduce((sum, o) => sum + (o.chennaQty || 0), 0);

  // Audio speech synthesis helper to announce to kitchen cooks
  const announceToCooks = (text) => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(text);
      msg.rate = 0.95;
      msg.pitch = 1.0;
      window.speechSynthesis.speak(msg);
      setAnnouncementText(`Announced: "${text}"`);
      setTimeout(() => setAnnouncementText(''), 4000);
    } else {
      alert(text);
    }
  };

  const handleAnnounceBatch = () => {
    announceToCooks(`Kitchen Alert! Prepare total ${totalChapathisToCook} Chapathis and ${totalChennaToCook} Chenna containers!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* KITCHEN QUANTITY SUMMARY BOARD (COOK HANDS-FREE BANNER) */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(245, 158, 11, 0.25))',
        border: '2px solid var(--accent-amber)',
        borderRadius: '20px',
        padding: '1.5rem',
        boxShadow: '0 10px 30px rgba(245, 158, 11, 0.2)'
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'var(--accent-amber)', padding: '0.8rem', borderRadius: '16px', color: '#fff' }}>
              <ChefHat size={32} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff' }}>
                  Kitchen Quantity Aggregator
                </h2>
                <span className="badge badge-preparing">
                  <Sparkles size={12} /> 0 SOFTWARE INTERACTION FOR COOKS
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                Delivery staff verbally announces or clicks audio broadcast for the 3 kitchen cooks.
              </p>
            </div>
          </div>

          {/* Audio Announcement Trigger */}
          <button
            onClick={handleAnnounceBatch}
            className="btn btn-amber"
            style={{ padding: '0.85rem 1.5rem', fontSize: '1rem', fontWeight: 800 }}
          >
            <Volume2 size={22} />
            Announce Quantities to Cooks
          </button>

        </div>

        {announcementText && (
          <div style={{ marginTop: '0.75rem', background: 'rgba(245, 158, 11, 0.3)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', textAlign: 'center' }}>
            🔊 {announcementText}
          </div>
        )}

        {/* Aggregated Counters */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1.25rem' }}>
          
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '1rem', borderRadius: '14px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL CHAPATHIS NEEDED</span>
            <div style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--accent-amber)' }}>
              🫓 {totalChapathisToCook}
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '1rem', borderRadius: '14px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL CHENNA CONTAINERS</span>
            <div style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>
              🥘 {totalChennaToCook}
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '1rem', borderRadius: '14px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>ACTIVE ORDERS IN QUEUE</span>
            <div style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--accent-emerald)' }}>
              📋 {activeOrders.length}
            </div>
          </div>

        </div>

      </div>

      {/* PACKING & STAGING CARDS */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={20} color="var(--accent-indigo)" />
          Active Staging Orders
        </h3>

        {activeOrders.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle size={48} color="var(--accent-emerald)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h4 style={{ fontSize: '1.1rem', color: '#ffffff' }}>All Orders Packed & Delivered!</h4>
            <p>Waiting for new online or walk-in orders to arrive.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {activeOrders.map(order => (
              <div key={order.id} className="glass-panel" style={{ padding: '1.25rem', borderLeft: `6px solid ${getStatusColor(order.orderStatus)}` }}>
                
                {/* Header Token & Type */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff' }}>
                    #{order.token}
                  </div>
                  <span className={`badge badge-${order.orderStatus.toLowerCase()}`} style={{ fontSize: '0.85rem' }}>
                    {order.orderStatus}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
                    {order.orderType}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.customerName} ({order.customerPhone})</span>
                </div>

                {/* Items Box */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  padding: '0.85rem',
                  borderRadius: '12px',
                  margin: '1rem 0',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', display: 'flex', justifyContent: 'space-between' }}>
                    <span>🫓 Chapathi</span>
                    <span style={{ color: 'var(--accent-amber)' }}>{order.chapathiQty} pcs</span>
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                    <span>🥘 Chenna Gravy</span>
                    <span style={{ color: 'var(--accent-cyan)' }}>{order.chennaQty} container</span>
                  </div>
                </div>

                {/* Status Progression Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  
                  {order.orderStatus === 'PENDING' && (
                    <button
                      onClick={() => {
                        onUpdateStatus(order.id, 'start');
                        announceToCooks(`Cooks start Token ${order.token}: ${order.chapathiQty} Chapathis, ${order.chennaQty} Chenna.`);
                      }}
                      className="btn btn-amber"
                      style={{ width: '100%', padding: '0.65rem' }}
                    >
                      <Play size={16} /> Start Preparing
                    </button>
                  )}

                  {order.orderStatus === 'PREPARING' && (
                    <button
                      onClick={() => onUpdateStatus(order.id, 'ready')}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '0.65rem' }}
                    >
                      <PackageCheck size={16} /> Pack & Mark Ready
                    </button>
                  )}

                  {order.orderStatus === 'READY' && (
                    <button
                      onClick={() => onUpdateStatus(order.id, 'delivered')}
                      className="btn btn-emerald"
                      style={{ width: '100%', padding: '0.65rem' }}
                    >
                      <CheckCircle size={16} /> Handover & Mark Delivered
                    </button>
                  )}

                  {/* Verbal repeat button */}
                  <button
                    onClick={() => announceToCooks(`Token ${order.token}: ${order.chapathiQty} Chapathi, ${order.chennaQty} Chenna.`)}
                    className="btn btn-outline"
                    style={{ fontSize: '0.75rem', padding: '0.35rem' }}
                  >
                    <Volume2 size={14} /> Announce Token #{order.token}
                  </button>

                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

function getStatusColor(status) {
  switch (status) {
    case 'PENDING': return '#94a3b8';
    case 'PREPARING': return '#f59e0b';
    case 'PACKING': return '#6366f1';
    case 'READY': return '#10b981';
    case 'DELIVERED': return '#06b6d4';
    default: return '#6366f1';
  }
}
