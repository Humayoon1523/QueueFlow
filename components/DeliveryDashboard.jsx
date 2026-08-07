'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PackageCheck, Volume2, Play, CheckCircle, ChefHat, Sparkles, Layers, MapPin } from 'lucide-react';

export default function DeliveryDashboard({ orders, metrics, onUpdateStatus }) {
  const announcedTokensRef = useRef(new Set());

  useEffect(() => {
    orders.forEach(order => {
      if (order.orderStatus !== 'DELIVERED' && order.isNearShop && !announcedTokensRef.current.has(order.token)) {
        announcedTokensRef.current.add(order.token);
        const text = `Attention delivery team! Customer for Token ${order.token}, ${order.customerName || 'Online customer'}, has arrived near the shop.`;
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const msg = new SpeechSynthesisUtterance(text);
          msg.rate = 0.95;
          window.speechSynthesis.speak(msg);
        } else {
          console.log('TTS Alert:', text);
        }
      }
      if (order.orderStatus === 'DELIVERED' && announcedTokensRef.current.has(order.token)) {
        announcedTokensRef.current.delete(order.token);
      }
    });
  }, [orders]);
  const [announcementText, setAnnouncementText] = useState('');

  const activeOrders = orders.filter(o => o.orderStatus !== 'DELIVERED');

  const totalChapathisToCook = activeOrders.reduce((sum, o) => sum + (o.chapathiQty || 0), 0);
  const totalChennaToCook = activeOrders.reduce((sum, o) => sum + (o.chennaQty || 0), 0);

  const announceToCooks = (text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      
      {/* KITCHEN QUANTITY SUMMARY BOARD */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(245, 158, 11, 0.25))',
        border: '2px solid var(--accent-amber)',
        borderRadius: '16px',
        padding: '1.1rem',
        boxShadow: '0 8px 24px rgba(245, 158, 11, 0.15)',
        width: '100%'
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--accent-amber)', padding: '0.6rem', borderRadius: '12px', color: '#fff', flexShrink: 0 }}>
              <ChefHat size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff' }}>
                  Kitchen Quantity Aggregator
                </h2>
                <span className="badge badge-preparing" style={{ fontSize: '0.6rem', padding: '0.15rem 0.45rem' }}>
                  <Sparkles size={10} /> 0 HANDS-ON DEVICE FOR COOKS
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.15rem' }}>
                Delivery staff announces or plays audio broadcast for the 3 cooks.
              </p>
            </div>
          </div>

          <button
            onClick={handleAnnounceBatch}
            className="btn btn-amber"
            style={{ padding: '0.65rem 1.15rem', fontSize: '0.9rem', fontWeight: 800, width: '100%', maxWidth: '320px' }}
          >
            <Volume2 size={18} />
            Announce Quantities to Cooks
          </button>

        </div>

        {announcementText && (
          <div style={{ marginTop: '0.65rem', background: 'rgba(245, 158, 11, 0.3)', padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', textAlign: 'center' }}>
            🔊 {announcementText}
          </div>
        )}

        {/* Aggregated Counters Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '0.75rem',
          marginTop: '1rem',
          width: '100%'
        }}>
          
          <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '0.75rem 0.5rem', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800 }}>CHAPATHIS NEEDED</span>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--accent-amber)', marginTop: '0.1rem' }}>
              🫓 {totalChapathisToCook}
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '0.75rem 0.5rem', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800 }}>CHENNA CONTAINERS</span>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--accent-cyan)', marginTop: '0.1rem' }}>
              🥘 {totalChennaToCook}
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '0.75rem 0.5rem', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800 }}>ACTIVE QUEUE</span>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--accent-emerald)', marginTop: '0.1rem' }}>
              📋 {activeOrders.length}
            </div>
          </div>

        </div>

      </div>

      {/* PACKING CARDS */}
      <div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Layers size={18} color="var(--accent-indigo)" />
          Active Staging Orders
        </h3>

        {activeOrders.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle size={42} color="var(--accent-emerald)" style={{ margin: '0 auto 0.5rem auto' }} />
            <h4 style={{ fontSize: '1rem', color: '#ffffff' }}>All Orders Packed & Delivered!</h4>
            <p style={{ fontSize: '0.78rem' }}>Waiting for new orders to arrive.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {activeOrders.map(order => (
              <div key={order.id} className="glass-panel" style={{ padding: '1rem', borderLeft: `5px solid ${getStatusColor(order.orderStatus)}` }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff' }}>
                    #{order.token}
                  </div>
                  <span className={`badge badge-${order.orderStatus.toLowerCase()}`} style={{ fontSize: '0.75rem' }}>
                    {order.orderStatus}
                  </span>
                </div>

                {order.isNearShop && (
                  <div style={{ 
                    marginTop: '0.45rem', 
                    background: 'rgba(244, 63, 94, 0.15)', 
                    border: '1px solid rgba(244, 63, 94, 0.4)', 
                    borderRadius: '8px', 
                    padding: '0.4rem 0.6rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#fda4af',
                    boxShadow: '0 0 12px rgba(244, 63, 94, 0.25)'
                  }}>
                    <span className="live-dot" style={{ background: 'var(--accent-rose)', width: '6px', height: '6px' }}></span>
                    <MapPin size={12} style={{ color: 'var(--accent-rose)' }} />
                    <span>CUSTOMER NEAR SHOP ({order.customerDistance || '50m'})</span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
                    {order.orderType}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customerName} ({order.customerPhone})</span>
                </div>

                <div style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  margin: '0.75rem 0',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', display: 'flex', justifyContent: 'space-between' }}>
                    <span>🫓 Chapathi</span>
                    <span style={{ color: 'var(--accent-amber)' }}>{order.chapathiQty} pcs</span>
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem' }}>
                    <span>🥘 Chenna Gravy</span>
                    <span style={{ color: 'var(--accent-cyan)' }}>{order.chennaQty} container</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  
                  {order.orderStatus === 'PENDING' && (
                    <button
                      onClick={() => {
                        onUpdateStatus(order.id, 'start');
                        announceToCooks(`Cooks start Token ${order.token}: ${order.chapathiQty} Chapathis, ${order.chennaQty} Chenna.`);
                      }}
                      className="btn btn-amber"
                      style={{ width: '100%', padding: '0.55rem', fontSize: '0.85rem' }}
                    >
                      <Play size={15} /> Start Preparing
                    </button>
                  )}

                  {order.orderStatus === 'PREPARING' && (
                    <button
                      onClick={() => onUpdateStatus(order.id, 'ready')}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '0.55rem', fontSize: '0.85rem' }}
                    >
                      <PackageCheck size={15} /> Pack & Mark Ready
                    </button>
                  )}

                  {order.orderStatus === 'READY' && (
                    <button
                      onClick={() => onUpdateStatus(order.id, 'delivered')}
                      className="btn btn-emerald"
                      style={{ width: '100%', padding: '0.55rem', fontSize: '0.85rem' }}
                    >
                      <CheckCircle size={15} /> Handover & Mark Delivered
                    </button>
                  )}

                  <button
                    onClick={() => announceToCooks(`Token ${order.token}: ${order.chapathiQty} Chapathi, ${order.chennaQty} Chenna.`)}
                    className="btn btn-outline"
                    style={{ fontSize: '0.72rem', padding: '0.3rem' }}
                  >
                    <Volume2 size={13} /> Announce Token #{order.token}
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
