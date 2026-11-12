'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  PackageCheck, Volume2, Play, CheckCircle, ChefHat, Sparkles, Layers,
  MapPin, Clock, Flame, CheckCheck, AlertCircle, Bell, Utensils,
  ChevronDown, ChevronUp, Eye, EyeOff, Radio
} from 'lucide-react';
import VisualQueue3D from './VisualQueue3D';

export default function DeliveryDashboard({ orders = [], metrics, onUpdateStatus }) {
  const announcedTokensRef = useRef(new Set());
  const [announcementText, setAnnouncementText] = useState('');
  const [ticketFilter, setTicketFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'PREPARING' | 'PACKING' | 'READY'
  const [show3DVisualizer, setShow3DVisualizer] = useState(true);

  const activeOrders = orders.filter(o => o.orderStatus !== 'COMPLETED' && o.orderStatus !== 'CANCELLED');

  // Customer Proximity Audio Alert for packing counter
  useEffect(() => {
    activeOrders.forEach(order => {
      if (order.isNearShop && !announcedTokensRef.current.has(order.token)) {
        announcedTokensRef.current.add(order.token);
        const text = `Attention packing desk! Customer for Token ${order.token}, ${order.customerName || 'Takeaway customer'}, has arrived near the shop.`;
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const msg = new SpeechSynthesisUtterance(text);
          msg.rate = 0.95;
          window.speechSynthesis.speak(msg);
        }
      }
      if (order.orderStatus === 'COMPLETED' && announcedTokensRef.current.has(order.token)) {
        announcedTokensRef.current.delete(order.token);
      }
    });
  }, [activeOrders]);

  // Aggregate quantities across stations and items
  const stationAggregates = {
    tawa: { label: 'Tawa Station', icon: '🫓', total: 0, items: {} },
    main_kitchen: { label: 'Main Kitchen Stove', icon: '🍲', total: 0, items: {} },
    biryani: { label: 'Biryani Handi', icon: '🍚', total: 0, items: {} },
    fryer: { label: 'Deep Fryer', icon: '🥟', total: 0, items: {} },
    beverage: { label: 'Beverage Counter', icon: '🥤', total: 0, items: {} }
  };

  // Tally items
  activeOrders.forEach(o => {
    // Only tally items that are PENDING, PREPARING, or PACKING
    if (o.orderStatus === 'PENDING' || o.orderStatus === 'PREPARING' || o.orderStatus === 'PACKING') {
      (o.items || []).forEach(it => {
        const stationKey = it.station || (it.category === 'BEVERAGES' ? 'beverage' : it.category === 'BIRYANI' ? 'biryani' : it.category === 'BREADS' ? 'tawa' : 'main_kitchen');
        const st = stationAggregates[stationKey] || stationAggregates.main_kitchen;
        st.total += it.qty || 1;
        st.items[it.name] = (st.items[it.name] || 0) + (it.qty || 1);
      });

      // Backward compatibility with legacy chapathiQty/chennaQty
      if ((!o.items || o.items.length === 0) && (o.chapathiQty || o.chennaQty)) {
        if (o.chapathiQty) {
          stationAggregates.tawa.total += o.chapathiQty;
          stationAggregates.tawa.items['Hot Chapathi'] = (stationAggregates.tawa.items['Hot Chapathi'] || 0) + o.chapathiQty;
        }
        if (o.chennaQty) {
          stationAggregates.main_kitchen.total += o.chennaQty;
          stationAggregates.main_kitchen.items['Spicy Chenna Gravy'] = (stationAggregates.main_kitchen.items['Spicy Chenna Gravy'] || 0) + o.chennaQty;
        }
      }
    }
  });

  // Total time to complete all orders (minutes)
  const totalClearanceMinutes = activeOrders.length > 0
    ? Math.max(
        Math.ceil((stationAggregates.tawa.total || 0) / 4) * 4,
        Math.ceil((stationAggregates.main_kitchen.total || 0) / 2) * 6,
        Math.ceil((stationAggregates.biryani.total || 0) / 2) * 5,
        Math.ceil((stationAggregates.fryer.total || 0) / 2) * 5,
        Math.ceil((stationAggregates.beverage.total || 0) / 2) * 2
      ) + Math.round(activeOrders.length * 1.5) + 2
    : 0;

  const announceToCooks = (text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      msg.rate = 0.95;
      msg.pitch = 1.0;
      window.speechSynthesis.speak(msg);
      setAnnouncementText(`🔊 Broadcast: "${text}"`);
      setTimeout(() => setAnnouncementText(''), 6000);
    } else {
      alert(text);
    }
  };

  // Announce dynamic batch to cooks
  const handleAnnounceBatch = () => {
    const parts = [];
    if (stationAggregates.tawa.total > 0) {
      parts.push(`Tawa station ${stationAggregates.tawa.total} breads`);
    }
    if (stationAggregates.main_kitchen.total > 0) {
      parts.push(`Main kitchen ${stationAggregates.main_kitchen.total} curries`);
    }
    if (stationAggregates.biryani.total > 0) {
      parts.push(`Biryani station ${stationAggregates.biryani.total} portions`);
    }
    if (stationAggregates.fryer.total > 0) {
      parts.push(`Fryer ${stationAggregates.fryer.total} items`);
    }
    if (stationAggregates.beverage.total > 0) {
      parts.push(`Beverage counter ${stationAggregates.beverage.total} drinks`);
    }

    if (parts.length === 0) {
      announceToCooks('Kitchen update: All stations are currently clear of active cooking orders.');
    } else {
      announceToCooks(`Kitchen Alert! Urgent quantities needed: ${parts.join('. ')}.`);
    }
  };

  // Announce Next Pending Order
  const handleAnnounceNextOrder = () => {
    const nextPending = activeOrders.find(o => o.orderStatus === 'PENDING') || activeOrders[0];
    if (!nextPending) {
      announceToCooks('No pending orders in queue right now.');
      return;
    }
    const itemSummary = (nextPending.items || []).map(i => `${i.qty} ${i.name}`).join(', ');
    announceToCooks(`Next order Token ${nextPending.token}: prepare ${itemSummary || 'takeaway batch'}.`);
  };

  const filteredTickets = ticketFilter === 'ALL'
    ? activeOrders
    : activeOrders.filter(o => o.orderStatus === ticketFilter);

  const pendingCount = activeOrders.filter(o => o.orderStatus === 'PENDING').length;
  const preparingCount = activeOrders.filter(o => o.orderStatus === 'PREPARING').length;
  const packingCount = activeOrders.filter(o => o.orderStatus === 'PACKING').length;
  const readyCount = activeOrders.filter(o => o.orderStatus === 'READY').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', paddingBottom: '3rem' }}>

      {/* 3D KITCHEN CONCURRENCY & FLOW VISUALIZER */}
      <div className="glass-panel" style={{ padding: '0.85rem 1rem', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: show3DVisualizer ? '0.75rem' : '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Radio size={16} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>
              Kitchen Station Throughput & Queue Flow
            </span>
            <span className="badge badge-ready" style={{ fontSize: '0.62rem', padding: '0.1rem 0.4rem' }}>
              LIVE SIMULATION
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShow3DVisualizer(!show3DVisualizer)}
            className="btn btn-outline"
            style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
          >
            {show3DVisualizer ? (
              <><EyeOff size={12} /> Hide Visualizer</>
            ) : (
              <><Eye size={12} /> Show Visualizer</>
            )}
          </button>
        </div>

        {show3DVisualizer && (
          <VisualQueue3D activeOrders={activeOrders} stations={metrics?.stations} activeCount={activeOrders.length} />
        )}
      </div>

      {/* KITCHEN QUANTITY AGGREGATOR BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(245, 158, 11, 0.2))',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        borderRadius: '16px',
        padding: '1.25rem',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--accent-amber), #d97706)',
              padding: '0.75rem',
              borderRadius: '14px',
              color: '#fff',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
              flexShrink: 0
            }}>
              <ChefHat size={30} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>
                  Kitchen Quantity Aggregator
                </h2>
                <span className="badge badge-preparing" style={{ fontSize: '0.62rem', padding: '0.15rem 0.45rem' }}>
                  <Sparkles size={10} /> VERBAL BRIDGE FOR COOKS
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '0.15rem' }}>
                Cooks prepare food without screens. Packing staff announces combined batch counts to kitchen stations.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                <span className="badge badge-preparing" style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', background: 'rgba(245, 158, 11, 0.25)', border: '1px solid var(--accent-amber)', color: '#fff' }}>
                  ⏱️ Total Time to Complete All Orders: <strong style={{ color: 'var(--accent-amber)', marginLeft: '0.25rem' }}>{activeOrders.length > 0 ? `~${totalClearanceMinutes} mins` : 'Queue Clear (0m)'}</strong>
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  ({activeOrders.length} active orders pending)
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleAnnounceBatch}
              className="btn btn-primary"
              style={{
                padding: '0.55rem 1rem',
                fontSize: '0.82rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, var(--accent-amber), #d97706)',
                border: 'none',
                color: '#fff'
              }}
            >
              <Volume2 size={16} />
              Broadcast All Quantities to Cooks
            </button>

            <button
              type="button"
              onClick={handleAnnounceNextOrder}
              className="btn btn-outline"
              style={{ padding: '0.55rem 0.85rem', fontSize: '0.82rem' }}
            >
              <Volume2 size={14} /> Announce Next Order
            </button>
          </div>

        </div>

        {announcementText && (
          <div style={{
            marginTop: '0.85rem',
            background: 'rgba(245, 158, 11, 0.25)',
            border: '1px solid var(--accent-amber)',
            padding: '0.5rem 1rem',
            borderRadius: '10px',
            fontSize: '0.82rem',
            fontWeight: 800,
            color: '#ffffff',
            textAlign: 'center'
          }}>
            {announcementText}
          </div>
        )}

        {/* Aggregated Stations Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '0.75rem',
          marginTop: '1.1rem',
          width: '100%'
        }}>
          {Object.entries(stationAggregates).map(([key, st]) => (
            <div
              key={key}
              style={{
                background: 'rgba(15, 23, 42, 0.75)',
                padding: '0.75rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
                    {st.label}
                  </span>
                  <span style={{ fontSize: '1.2rem' }}>{st.icon}</span>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: st.total > 0 ? 'var(--accent-amber)' : 'var(--text-muted)', marginTop: '0.2rem', lineHeight: 1.1 }}>
                  {st.total}
                </div>
              </div>

              <div style={{ marginTop: '0.4rem', borderTop: '1px dashed rgba(255, 255, 255, 0.08)', paddingTop: '0.35rem', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {Object.keys(st.items).length === 0 ? (
                  <span>Station idle</span>
                ) : (
                  Object.entries(st.items).map(([name, qty]) => (
                    <div key={name} style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '110px' }}>{name}</span>
                      <strong style={{ color: '#fff' }}>x{qty}</strong>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* STAGING & PACKING TICKETS */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.6rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#ffffff' }}>
            <Layers size={18} color="var(--accent-indigo)" />
            Takeaway Staging & Packing Pipeline ({activeOrders.length})
          </h3>

          {/* Ticket Filter Pills */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All Active', count: activeOrders.length },
              { id: 'PENDING', label: 'Queued', count: pendingCount },
              { id: 'PREPARING', label: 'In Kitchen', count: preparingCount },
              { id: 'PACKING', label: 'Packing', count: packingCount },
              { id: 'READY', label: 'Ready', count: readyCount }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTicketFilter(tab.id)}
                className={`btn ${ticketFilter === tab.id ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  fontSize: '0.72rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '8px'
                }}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span style={{
                    background: ticketFilter === tab.id ? '#ffffff' : 'rgba(255, 255, 255, 0.15)',
                    color: ticketFilter === tab.id ? '#0d1527' : '#ffffff',
                    borderRadius: '9999px',
                    padding: '0.05rem 0.35rem',
                    marginLeft: '0.25rem',
                    fontSize: '0.62rem',
                    fontWeight: 900
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle size={48} color="var(--accent-emerald)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>All Packing Tickets Dispatched!</h4>
            <p style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>The takeaway staging shelf is clear. Awaiting new orders.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
            {filteredTickets.map(order => {
              const isUrgent = order.isNearShop;
              const isReady = order.orderStatus === 'READY';
              const isPacking = order.orderStatus === 'PACKING';
              const isPrep = order.orderStatus === 'PREPARING';
              const isPending = order.orderStatus === 'PENDING';

              return (
                <div
                  key={order.id}
                  className="glass-panel"
                  style={{
                    padding: '1.1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    borderLeft: `5px solid ${isReady ? 'var(--accent-emerald)' :
                        isPacking ? 'var(--accent-amber)' :
                          isPrep ? 'var(--accent-cyan)' : 'var(--accent-indigo)'
                      }`,
                    borderTop: isUrgent ? '2px solid #f43f5e' : '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: isUrgent ? '0 0 25px rgba(244, 63, 94, 0.3)' : '0 10px 25px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <div>
                    {/* Header: Large Token & Customer Info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.1 }}>
                          #{order.token}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.1rem 0.35rem', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-indigo)' }}>
                            TAKEAWAY
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 700 }}>
                            {order.customerName}
                          </span>
                        </div>
                      </div>

                      <span className={`badge badge-${order.orderStatus.toLowerCase()}`} style={{ fontSize: '0.72rem' }}>
                        {order.orderStatus}
                      </span>
                    </div>

                    {/* Proximity Radar Banner */}
                    {order.isNearShop && (
                      <div style={{
                        marginTop: '0.65rem',
                        background: 'rgba(244, 63, 94, 0.2)',
                        border: '1px solid #f43f5e',
                        borderRadius: '8px',
                        padding: '0.4rem 0.65rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: '#ffffff',
                        animation: 'float-badge 1.5s infinite alternate'
                      }}>
                        <MapPin size={13} color="#f43f5e" />
                        <span>CUSTOMER NEAR SHOP ({order.customerDistance || '35m'})</span>
                      </div>
                    )}

                    {/* Itemized Food List */}
                    <div style={{
                      background: 'rgba(15, 23, 42, 0.85)',
                      padding: '0.75rem',
                      borderRadius: '10px',
                      margin: '0.75rem 0',
                      border: '1px solid rgba(255, 255, 255, 0.06)'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {(order.items || []).map((it, idx) => (
                          <div key={idx} style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{it.image || '🍱'} {it.name}</span>
                            <span style={{ color: 'var(--accent-cyan)' }}>x{it.qty}</span>
                          </div>
                        ))}
                      </div>

                      {order.cookingNotes && (
                        <div style={{ marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', fontSize: '0.7rem', color: 'var(--accent-amber)' }}>
                          <strong>Notes:</strong> &quot;{order.cookingNotes}&quot;
                        </div>
                      )}
                    </div>

                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                      Target Pickup: <strong style={{ color: 'var(--accent-emerald)' }}>{order.smartEta?.pickupWindow || order.estimatedPickupTime}</strong>
                    </div>
                  </div>

                  {/* Tactile Workflow Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateStatus(order.id, 'PREPARE');
                          announceToCooks(`Cooks start Token ${order.token}`);
                        }}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem', fontWeight: 800 }}
                      >
                        <Play size={15} /> 1. Call Cooks & Start Prep
                      </button>
                    )}

                    {isPrep && (
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateStatus(order.id, 'PACK');
                          announceToCooks(`Token ${order.token} ready for packing.`);
                        }}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--accent-amber), #d97706)' }}
                      >
                        <PackageCheck size={15} /> 2. Collect from Kitchen & Pack
                      </button>
                    )}

                    {isPacking && (
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateStatus(order.id, 'READY');
                          announceToCooks(`Token ${order.token} is packed and ready for pickup!`);
                        }}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--accent-emerald), #059669)' }}
                      >
                        <CheckCheck size={15} /> 3. Mark Order Ready
                      </button>
                    )}

                    {isReady && (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(order.id, 'DELIVER')}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--accent-cyan), #0284c7)' }}
                      >
                        <CheckCircle size={15} /> 4. Hand Over to Customer
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        const itemsTxt = (order.items || []).map(i => `${i.qty} ${i.name}`).join(', ');
                        announceToCooks(`Token ${order.token}: ${itemsTxt}`);
                      }}
                      className="btn btn-outline"
                      style={{ fontSize: '0.72rem', padding: '0.3rem' }}
                    >
                      <Volume2 size={13} /> Speak Token #{order.token}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}