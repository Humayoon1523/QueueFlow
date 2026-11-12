'use client';

import React, { useState, useEffect } from 'react';
import { 
  Store, DollarSign, Clock, Users, Send, Printer, CheckCircle2, History, 
  ListFilter, Search, MessageSquare, Play, PackageCheck, CheckCheck, 
  Sparkles, Plus, Trash2, ArrowUpRight, Flame, MapPin, X, Edit2, Sliders,
  ChefHat, AlertTriangle, ShieldCheck, RefreshCw, Smartphone, Eye, Timer
} from 'lucide-react';

export default function ManagerDashboard({ 
  orders = [], 
  metrics, 
  aiPrediction, 
  onNotifyCustomer, 
  onPrintReceipt, 
  onRefresh 
}) {
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'menu' | 'stations' | 'audit'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Menu Management State
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [menuForm, setMenuForm] = useState({
    name: '',
    category: 'MAIN_COURSE',
    price: 50,
    isVeg: true,
    prepDurationMinutes: 4,
    station: 'main_kitchen',
    batchCapacity: 1,
    description: '',
    image: '🍲',
    isAvailable: true
  });

  // Station & Engine Settings State
  const [stationsConfig, setStationsConfig] = useState({
    tawa: { name: 'Tawa Station', capacitySlots: 2, defaultBatchCapacity: 8 },
    main_kitchen: { name: 'Main Kitchen Stove', capacitySlots: 3, defaultBatchCapacity: 1 },
    biryani: { name: 'Biryani Handi Counter', capacitySlots: 1, defaultBatchCapacity: 1 },
    fryer: { name: 'Deep Fryer Station', capacitySlots: 2, defaultBatchCapacity: 4 },
    beverage: { name: 'Beverage & Cold Counter', capacitySlots: 2, defaultBatchCapacity: 2 }
  });
  const [systemConfig, setSystemConfig] = useState({
    packingDurationMinutes: 1.5,
    bufferMinutes: 2,
    maxConcurrentOrders: 30
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSavedAlert, setSettingsSavedAlert] = useState(false);

  // Audit Logs & Reports
  const [auditLogs, setAuditLogs] = useState([]);

  // Fetch full menu & system stations
  const fetchMenuAndConfig = async () => {
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const data = await res.json();
        if (data.metrics?.menu) setMenuItems(data.metrics.menu);
        if (data.metrics?.categories) setCategories(data.metrics.categories);
        if (data.stations) setStationsConfig(data.stations);
        if (data.systemConfig) setSystemConfig(data.systemConfig);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
      }
    } catch (err) {
      console.error('Failed to load menu/config:', err);
    }
  };

  useEffect(() => {
    fetchMenuAndConfig();
  }, []);

  // Update order status
  const handleAdvanceStatus = async (orderId, nextAction) => {
    try {
      await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action: nextAction })
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Status advance error:', err);
    }
  };

  // Cancel order
  const handleCancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this online takeaway order? This action cannot be undone.')) return;
    try {
      await fetch(`/api/orders?orderId=${orderId}&reason=Manager+Cancelled`, {
        method: 'DELETE'
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Cancel order error:', err);
    }
  };

  // WhatsApp Alert to customer
  const handleWhatsAppAlert = (order) => {
    const phone = (order.customerPhone || '').replace(/\D/g, '');
    if (!phone || phone.length < 10) {
      alert(`No valid phone number for Token #${order.token} to send WhatsApp.`);
      return;
    }
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;
    const msg = encodeURIComponent(`Hello ${order.customerName}! Your QueueFlow Online Takeaway Order (Token #${order.token}) is READY for pickup at the counter! Hot & Fresh. Total Paid: ₹${order.totalPrice || order.totalAmount}`);
    const waUrl = `https://wa.me/${cleanPhone}?text=${msg}`;
    window.open(waUrl, '_blank');
    if (onNotifyCustomer) onNotifyCustomer(order.id);
  };

  // Menu Form Handlers
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setMenuForm({
      name: '',
      category: categories[0]?.id || 'MAIN_COURSE',
      price: 60,
      isVeg: true,
      prepDurationMinutes: 4,
      station: 'main_kitchen',
      batchCapacity: 1,
      description: '',
      image: '🍲',
      isAvailable: true
    });
    setIsMenuModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setMenuForm({
      name: item.name,
      category: item.category || 'MAIN_COURSE',
      price: item.price,
      isVeg: item.isVeg !== false,
      prepDurationMinutes: item.prepDurationMinutes || 4,
      station: item.station || 'main_kitchen',
      batchCapacity: item.batchCapacity || 1,
      description: item.description || '',
      image: item.image || '🍲',
      isAvailable: item.isAvailable !== false
    });
    setIsMenuModalOpen(true);
  };

  const handleSaveMenuItem = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        // Update
        const res = await fetch('/api/menu', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingItem.id, ...menuForm })
        });
        if (res.ok) {
          setIsMenuModalOpen(false);
          fetchMenuAndConfig();
          if (onRefresh) onRefresh();
        }
      } else {
        // Create
        const res = await fetch('/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(menuForm)
        });
        if (res.ok) {
          setIsMenuModalOpen(false);
          fetchMenuAndConfig();
          if (onRefresh) onRefresh();
        }
      }
    } catch (err) {
      console.error('Failed to save menu item:', err);
    }
  };

  const handleToggleItemAvailability = async (item) => {
    try {
      await fetch('/api/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, isAvailable: !item.isAvailable })
      });
      fetchMenuAndConfig();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    }
  };

  const handleDeleteMenuItem = async (id) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await fetch(`/api/menu?id=${id}`, { method: 'DELETE' });
      fetchMenuAndConfig();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  // Station Configuration Save
  const handleSaveStationsAndEngine = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch('/api/stations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stations: stationsConfig, systemConfig })
      });
      if (res.ok) {
        setSettingsSavedAlert(true);
        setTimeout(() => setSettingsSavedAlert(false), 3500);
        fetchMenuAndConfig();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Failed to save station settings:', err);
    } finally {
      setSavingSettings(false);
    }
  };

  // Filter orders
  const activeOrders = orders.filter(o => o.orderStatus !== 'COMPLETED' && o.orderStatus !== 'CANCELLED');
  const completedOrders = orders.filter(o => o.orderStatus === 'COMPLETED' || o.orderStatus === 'CANCELLED');
  
  const displayedOrders = (statusFilter === 'COMPLETED' || statusFilter === 'CANCELLED' ? orders : orders).filter(o => {
    if (statusFilter === 'ALL') {
      return activeTab === 'audit' ? true : o.orderStatus !== 'COMPLETED' && o.orderStatus !== 'CANCELLED';
    }
    return o.orderStatus === statusFilter;
  }).filter(o => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const token = (o.token || '').toString().toLowerCase();
    const name = (o.customerName || '').toLowerCase();
    const phone = (o.customerPhone || '').toLowerCase();
    const items = (o.items || []).map(i => i.name).join(' ').toLowerCase();
    return token.includes(term) || name.includes(term) || phone.includes(term) || items.includes(term);
  });

  const totalRevenueToday = orders
    .filter(o => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + (o.totalPrice || o.totalAmount || 0), 0);

  const readyOrdersCount = orders.filter(o => o.orderStatus === 'READY').length;
  const preparingOrdersCount = orders.filter(o => o.orderStatus === 'PREPARING').length;
  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'PENDING').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', paddingBottom: '3rem' }}>
      
      {/* TOP KPI RIBBON */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0.85rem',
        width: '100%'
      }}>
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.65rem', borderRadius: '12px', color: 'var(--accent-indigo)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Takeaway Revenue</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff' }}>₹{totalRevenueToday}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--accent-emerald)' }}>100% Online UPI Verified</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.2)', padding: '0.65rem', borderRadius: '12px', color: 'var(--accent-cyan)' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Takeaway Queue</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>{activeOrders.length}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{pendingOrdersCount} queued, {preparingOrdersCount} in prep</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.65rem', borderRadius: '12px', color: 'var(--accent-emerald)' }}>
            <PackageCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ready For Pickup</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent-emerald)' }}>{readyOrdersCount}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Packed at counter</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '0.65rem', borderRadius: '12px', color: 'var(--accent-amber)' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Smart ETA Engine</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent-amber)' }}>
              {aiPrediction?.estimatedWaitMinutes ? `${aiPrediction.estimatedWaitMinutes}m` : '8m'}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Resource-aware scheduling</div>
          </div>
        </div>

        <div className="glass-panel" style={{
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(99, 102, 241, 0.12))',
          border: '1px solid rgba(245, 158, 11, 0.35)'
        }}>
          <div style={{ background: 'linear-gradient(135deg, var(--accent-amber), #d97706)', padding: '0.65rem', borderRadius: '12px', color: '#fff', flexShrink: 0 }}>
            <Timer size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#fef08a', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>Time to Clear All Orders</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff' }}>
              {activeOrders.length > 0 ? (aiPrediction?.totalClearanceFormatted || `${activeOrders.length * 5 + 2} mins`) : '0 mins'}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--accent-amber)' }}>
              {activeOrders.length > 0 ? (aiPrediction?.completionTargetTime ? `Cleared: ${aiPrediction.completionTargetTime}` : 'In progress') : 'Queue clear'}
            </div>
          </div>
        </div>
      </div>

      {/* 4 MAIN TABS NAVIGATION */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '0.5rem'
      }}>
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => { setActiveTab('queue'); setStatusFilter('ALL'); }}
            className={`btn ${activeTab === 'queue' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
          >
            <ListFilter size={15} />
            <span>Live Central Queue ({activeOrders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            className={`btn ${activeTab === 'menu' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
          >
            <ChefHat size={15} />
            <span>Dynamic Menu ({menuItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stations')}
            className={`btn ${activeTab === 'stations' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
          >
            <Sliders size={15} />
            <span>Kitchen Stations & ETA</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('audit'); setStatusFilter('ALL'); }}
            className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
          >
            <History size={15} />
            <span>Audit Trail & Archive</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => { fetchMenuAndConfig(); if (onRefresh) onRefresh(); }}
            className="btn btn-outline"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.7rem' }}
            title="Refresh Live State"
          >
            <RefreshCw size={13} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: LIVE CENTRAL QUEUE & ORDERS */}
      {/* ============================================================== */}
      {activeTab === 'queue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Filter Bar & Search */}
          <div className="glass-panel" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              {['ALL', 'PENDING', 'PREPARING', 'PACKING', 'READY'].map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`btn ${statusFilter === st ? 'btn-primary' : 'btn-outline'}`}
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.3rem 0.65rem',
                    borderRadius: '8px'
                  }}
                >
                  {st}
                  {st === 'READY' && readyOrdersCount > 0 && (
                    <span style={{ background: '#10b981', color: '#fff', borderRadius: '9999px', padding: '0.05rem 0.35rem', marginLeft: '0.25rem', fontSize: '0.62rem' }}>
                      {readyOrdersCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '220px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search token, name, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.4rem 0.65rem 0.4rem 2rem',
                    fontSize: '0.78rem',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Orders Grid / Table */}
          {displayedOrders.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
              <PackageCheck size={42} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>No active takeaway orders matching filter</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>New customer online orders will automatically appear here with smart ETA estimation.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {displayedOrders.map((ord) => {
                const isReady = ord.orderStatus === 'READY';
                const isPacking = ord.orderStatus === 'PACKING';
                const isPrep = ord.orderStatus === 'PREPARING';
                const isPending = ord.orderStatus === 'PENDING';

                return (
                  <div 
                    key={ord.id}
                    className="glass-panel"
                    style={{
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      borderLeft: `4px solid ${
                        isReady ? 'var(--accent-emerald)' :
                        isPacking ? 'var(--accent-amber)' :
                        isPrep ? 'var(--accent-cyan)' : 'var(--accent-indigo)'
                      }`,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Header Row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          background: isReady ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                          color: isReady ? 'var(--accent-emerald)' : 'var(--accent-indigo)',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '10px',
                          fontWeight: 900,
                          fontSize: '1.05rem',
                          letterSpacing: '0.04em',
                          border: `1px solid ${isReady ? 'var(--accent-emerald)' : 'rgba(99, 102, 241, 0.4)'}`
                        }}>
                          TOKEN #{ord.token}
                        </div>

                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span>{ord.customerName || 'Takeaway Customer'}</span>
                            {ord.isNearShop && (
                              <span style={{ background: '#10b981', color: '#fff', fontSize: '0.62rem', fontWeight: 900, padding: '0.1rem 0.4rem', borderRadius: '9999px', animation: 'float-badge 1s infinite alternate' }}>
                                🟢 AT SHOP
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            📱 {ord.customerPhone || 'N/A'} • Placed {ord.createdAt ? new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span className={`badge badge-${(ord.orderStatus || 'pending').toLowerCase()}`}>
                          {ord.orderStatus}
                        </span>

                        <span className="badge badge-paid">
                          PAID ₹{ord.totalPrice || ord.totalAmount}
                        </span>
                      </div>
                    </div>

                    {/* Order Details & Smart ETA Breakdown */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      fontSize: '0.78rem'
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '0.25rem' }}>Ordered Items:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                          {(ord.items || []).map((it, idx) => (
                            <span 
                              key={idx}
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '6px',
                                color: '#ffffff',
                                border: '1px solid rgba(255, 255, 255, 0.08)'
                              }}
                            >
                              {it.qty}x {it.name}
                            </span>
                          ))}
                        </div>
                        {ord.cookingNotes && (
                          <div style={{ marginTop: '0.35rem', fontSize: '0.7rem', color: 'var(--accent-amber)' }}>
                            📝 Note: {ord.cookingNotes}
                          </div>
                        )}
                      </div>

                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--accent-amber)', marginBottom: '0.25rem' }}>Smart ETA Schedule:</div>
                        <div style={{ color: '#ffffff' }}>
                          Pickup Window: <strong style={{ color: 'var(--accent-emerald)' }}>{ord.smartEta?.pickupWindow || ord.estimatedPickupTime || 'Calculating...'}</strong>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          Est. Duration: {ord.smartEta?.estimatedTotalDurationMinutes || ord.estimatedWaitMinutes || 8} mins (Workload + Buffer)
                        </div>
                      </div>
                    </div>

                    {/* Operational Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {/* Status Progression Workflow */}
                        {isPending && (
                          <button
                            type="button"
                            onClick={() => handleAdvanceStatus(ord.id, 'PREPARE')}
                            className="btn btn-primary"
                            style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                          >
                            <Play size={13} /> Send to Kitchen
                          </button>
                        )}

                        {isPrep && (
                          <button
                            type="button"
                            onClick={() => handleAdvanceStatus(ord.id, 'PACK')}
                            className="btn btn-primary"
                            style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', background: 'linear-gradient(135deg, var(--accent-amber), #d97706)' }}
                          >
                            <PackageCheck size={13} /> Move to Packing
                          </button>
                        )}

                        {isPacking && (
                          <button
                            type="button"
                            onClick={() => handleAdvanceStatus(ord.id, 'READY')}
                            className="btn btn-primary"
                            style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', background: 'linear-gradient(135deg, var(--accent-emerald), #059669)' }}
                          >
                            <CheckCheck size={13} /> Mark Order Ready
                          </button>
                        )}

                        {isReady && (
                          <button
                            type="button"
                            onClick={() => handleAdvanceStatus(ord.id, 'DELIVER')}
                            className="btn btn-primary"
                            style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', background: 'linear-gradient(135deg, var(--accent-cyan), #0284c7)' }}
                          >
                            <CheckCircle2 size={13} /> Complete Handover
                          </button>
                        )}

                        {/* WhatsApp / SMS Notification */}
                        <button
                          type="button"
                          onClick={() => handleWhatsAppAlert(ord)}
                          className="btn btn-outline"
                          style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', color: '#25D366', borderColor: 'rgba(37, 211, 102, 0.4)' }}
                          title="Send Ready Notification via WhatsApp"
                        >
                          <Smartphone size={13} /> Alert Customer
                        </button>

                        {/* Print Receipt */}
                        <button
                          type="button"
                          onClick={() => onPrintReceipt(ord)}
                          className="btn btn-outline"
                          style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                          title="Print Thermal Takeaway Slip"
                        >
                          <Printer size={13} /> Slip
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(ord)}
                          className="btn btn-outline"
                          style={{ fontSize: '0.75rem', padding: '0.4rem 0.65rem' }}
                          title="View Full Order Breakdown"
                        >
                          <Eye size={13} /> Details
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCancelOrder(ord.id)}
                          className="btn btn-outline"
                          style={{ fontSize: '0.75rem', padding: '0.4rem 0.65rem', color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                          title="Cancel Order"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: DYNAMIC RESTAURANT MENU MANAGEMENT */}
      {/* ============================================================== */}
      {activeTab === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Header & Add Button */}
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff' }}>
                Takeaway Menu & Kitchen Profiles
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Create, update, price, and assign preparation stations to all takeaway items.
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="btn btn-primary"
              style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
            >
              <Plus size={16} /> Add Food Item
            </button>
          </div>

          {/* Category Pills */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`btn ${selectedCategory === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
            >
              All Categories ({menuItems.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              >
                {cat.icon || '🍽️'} {cat.name}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
            gap: '1rem'
          }}>
            {menuItems
              .filter(it => selectedCategory === 'ALL' || it.category === selectedCategory)
              .map((item) => (
                <div
                  key={item.id}
                  className="glass-panel"
                  style={{
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    borderTop: item.isVeg ? '3px solid var(--accent-emerald)' : '3px solid #ef4444',
                    opacity: item.isAvailable ? 1 : 0.6
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.6rem' }}>{item.image || '🍲'}</span>
                        <div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>{item.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.category}</div>
                        </div>
                      </div>

                      <span className={`badge ${item.isVeg ? 'badge-veg' : 'badge-nonveg'}`}>
                        {item.isVeg ? 'VEG' : 'NON-VEG'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: '1.3' }}>
                      {item.description || 'Delicious freshly prepared takeaway dish.'}
                    </div>

                    <div style={{
                      marginTop: '0.75rem',
                      padding: '0.5rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.4rem',
                      fontSize: '0.72rem'
                    }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Prep Time: </span>
                        <strong style={{ color: '#fff' }}>{item.prepDurationMinutes || 4}m</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Station: </span>
                        <strong style={{ color: 'var(--accent-cyan)' }}>{item.station || 'main_kitchen'}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Batch Cap: </span>
                        <strong style={{ color: '#fff' }}>{item.batchCapacity || 1}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Price: </span>
                        <strong style={{ color: 'var(--accent-emerald)', fontSize: '0.85rem' }}>₹{item.price}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleItemAvailability(item)}
                      className={`btn ${item.isAvailable ? 'btn-outline' : 'btn-primary'}`}
                      style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }}
                    >
                      {item.isAvailable ? '🟢 Available' : '🔴 Sold Out'}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className="btn btn-outline"
                        style={{ fontSize: '0.7rem', padding: '0.3rem 0.5rem' }}
                        title="Edit Item"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteMenuItem(item.id)}
                        className="btn btn-outline"
                        style={{ fontSize: '0.7rem', padding: '0.3rem 0.5rem', color: '#f43f5e' }}
                        title="Delete Item"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: KITCHEN STATIONS & SMART ETA CONFIGURATION */}
      {/* ============================================================== */}
      {activeTab === 'stations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff' }}>
                  Kitchen Station Concurrency & Engine Settings
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  The Smart ETA engine uses these resource constraints to schedule batches, station concurrency, and pickup windows.
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveStationsAndEngine}
                disabled={savingSettings}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}
              >
                {savingSettings ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>

            {settingsSavedAlert && (
              <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid var(--accent-emerald)', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', textAlign: 'center' }}>
                ✅ Kitchen station capacities and Smart ETA parameters successfully saved!
              </div>
            )}
          </div>

          {/* Stations Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem'
          }}>
            {Object.entries(stationsConfig).map(([key, st]) => (
              <div key={key} className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.95rem' }}>
                    {st.name}
                  </div>
                  <span className="badge badge-preparing" style={{ fontSize: '0.65rem' }}>
                    {key.toUpperCase()}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                      Parallel Capacity Slots:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={st.capacitySlots || 1}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setStationsConfig(prev => ({
                          ...prev,
                          [key]: { ...prev[key], capacitySlots: val }
                        }));
                      }}
                      style={{
                        width: '100%',
                        padding: '0.4rem 0.65rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        color: '#fff',
                        outline: 'none'
                      }}
                    />
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      Number of independent batches this station can cook at the exact same time.
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                      Default Batch Size:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={st.defaultBatchCapacity || 1}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setStationsConfig(prev => ({
                          ...prev,
                          [key]: { ...prev[key], defaultBatchCapacity: val }
                        }));
                      }}
                      style={{
                        width: '100%',
                        padding: '0.4rem 0.65rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        color: '#fff',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* System ETA Engine Parameters */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={16} color="var(--accent-amber)" />
              Global ETA Scheduling Formula Parameters
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Packing Duration Per Order (Minutes):
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="10"
                  value={systemConfig.packingDurationMinutes || 1.5}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 1.5;
                    setSystemConfig(prev => ({ ...prev, packingDurationMinutes: val }));
                  }}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Uncertainty Buffer (Minutes):
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="15"
                  value={systemConfig.bufferMinutes || 2}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 2;
                    setSystemConfig(prev => ({ ...prev, bufferMinutes: val }));
                  }}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Max Concurrent Orders:
                </label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={systemConfig.maxConcurrentOrders || 30}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 30;
                    setSystemConfig(prev => ({ ...prev, maxConcurrentOrders: val }));
                  }}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              💡 <strong>Smart ETA Scheduling Engine Formula:</strong> Estimated Pickup = Current Time + max(Station Queued Workload) + Parallel Item Batch Cooking Duration + Packing Time ({systemConfig.packingDurationMinutes}m) + Buffer ({systemConfig.bufferMinutes}m).
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: SYSTEM AUDIT LOGS & ORDER ARCHIVE */}
      {/* ============================================================== */}
      {activeTab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff' }}>
              System Audit Trail & Takeaway Archive
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Complete record of all orders completed, cancelled, and system configuration events.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {/* Audit Logs Feed */}
            <div className="glass-panel" style={{ padding: '1rem', maxHeight: '480px', overflowY: 'auto' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={16} /> Operational Audit Events
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {auditLogs.length === 0 ? (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                    No audit logs recorded yet.
                  </div>
                ) : (
                  auditLogs.slice(0, 30).map((log) => (
                    <div
                      key={log.id}
                      style={{
                        padding: '0.5rem',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderLeft: '3px solid var(--accent-indigo)',
                        borderRadius: '6px',
                        fontSize: '0.72rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700, color: '#ffffff' }}>{log.event}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>
                          {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {JSON.stringify(log.details || {})}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Completed & Cancelled Archive */}
            <div className="glass-panel" style={{ padding: '1rem', maxHeight: '480px', overflowY: 'auto' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-emerald)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <History size={16} /> Order Archive ({completedOrders.length})
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {completedOrders.length === 0 ? (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                    No archived orders yet.
                  </div>
                ) : (
                  completedOrders.map((ord) => (
                    <div
                      key={ord.id}
                      style={{
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        fontSize: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontWeight: 800, color: '#ffffff' }}>
                          TOKEN #{ord.token} • {ord.customerName}
                        </div>
                        <span className={`badge badge-${ord.orderStatus.toLowerCase()}`}>
                          {ord.orderStatus}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Total: ₹{ord.totalPrice || ord.totalAmount} • Completed at {ord.completedAt ? new Date(ord.completedAt).toLocaleTimeString() : 'N/A'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* MENU ITEM ADD / EDIT MODAL */}
      {/* ============================================================== */}
      {isMenuModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff' }}>
                {editingItem ? 'Edit Food Item & Prep Profile' : 'Add New Food Item'}
              </h3>
              <button
                type="button"
                onClick={() => setIsMenuModalOpen(false)}
                className="btn btn-outline"
                style={{ padding: '0.35rem 0.5rem' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveMenuItem} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Food Name *</label>
                <input
                  type="text"
                  required
                  value={menuForm.name}
                  onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  placeholder="e.g. Butter Garlic Naan"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Category *</label>
                  <select
                    value={menuForm.category}
                    onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', background: '#0d1527', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={menuForm.price}
                    onChange={(e) => setMenuForm({ ...menuForm, price: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Prep Duration (mins) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="60"
                    value={menuForm.prepDurationMinutes}
                    onChange={(e) => setMenuForm({ ...menuForm, prepDurationMinutes: parseFloat(e.target.value) || 1 })}
                    style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Preparation Station *</label>
                  <select
                    value={menuForm.station}
                    onChange={(e) => setMenuForm({ ...menuForm, station: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', background: '#0d1527', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  >
                    <option value="tawa">Tawa Station</option>
                    <option value="main_kitchen">Main Kitchen Stove</option>
                    <option value="biryani">Biryani Station</option>
                    <option value="fryer">Deep Fryer Station</option>
                    <option value="beverage">Beverage & Cold Counter</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Batch Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={menuForm.batchCapacity}
                    onChange={(e) => setMenuForm({ ...menuForm, batchCapacity: parseInt(e.target.value) || 1 })}
                    style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Emoji Icon / Image</label>
                  <input
                    type="text"
                    value={menuForm.image}
                    onChange={(e) => setMenuForm({ ...menuForm, image: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                    placeholder="e.g. 🍛"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Food Description</label>
                <textarea
                  rows="2"
                  value={menuForm.description}
                  onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  placeholder="Short description of taste and portion size"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingTop: '0.35rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem', color: '#fff' }}>
                  <input
                    type="checkbox"
                    checked={menuForm.isVeg}
                    onChange={(e) => setMenuForm({ ...menuForm, isVeg: e.target.checked })}
                  />
                  <span>Pure Vegetarian (Green)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem', color: '#fff' }}>
                  <input
                    type="checkbox"
                    checked={menuForm.isAvailable}
                    onChange={(e) => setMenuForm({ ...menuForm, isAvailable: e.target.checked })}
                  />
                  <span>Currently Available</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsMenuModalOpen(false)}
                  className="btn btn-outline"
                  style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontSize: '0.8rem', padding: '0.5rem 1.25rem' }}
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ORDER DETAILS MODAL */}
      {/* ============================================================== */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff' }}>
                  TOKEN #{selectedOrder.token}
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Order ID: {selectedOrder.id}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="btn btn-outline"
                style={{ padding: '0.35rem 0.5rem' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.8rem' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Customer:</div>
                <div style={{ fontWeight: 800, color: '#fff' }}>{selectedOrder.customerName} ({selectedOrder.customerPhone})</div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.3rem' }}>Itemized Breakdown:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: '8px' }}>
                  {(selectedOrder.items || []).map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: '#fff' }}>
                      <span>{it.qty}x {it.name}</span>
                      <span>₹{(it.price || 0) * (it.qty || 1)}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.4rem', marginTop: '0.2rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                    <span>Total Amount Paid</span>
                    <span>₹{selectedOrder.totalPrice || selectedOrder.totalAmount}</span>
                  </div>
                </div>
              </div>

              {selectedOrder.cookingNotes && (
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Special Cooking Notes:</div>
                  <div style={{ color: 'var(--accent-amber)' }}>{selectedOrder.cookingNotes}</div>
                </div>
              )}

              <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <div style={{ fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '0.25rem' }}>Smart ETA Engine Diagnosis:</div>
                <div style={{ color: '#fff' }}>Pickup Window: {selectedOrder.smartEta?.pickupWindow || selectedOrder.estimatedPickupTime}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.15rem' }}>
                  Prep Duration: {selectedOrder.smartEta?.estimatedTotalDurationMinutes || 8} mins (Pack time: {selectedOrder.smartEta?.packingDurationMinutes || 1.5}m, Buffer: {selectedOrder.smartEta?.bufferMinutes || 2}m)
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => { onPrintReceipt(selectedOrder); setSelectedOrder(null); }}
                  className="btn btn-outline"
                  style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                >
                  <Printer size={14} /> Print Receipt
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="btn btn-primary"
                  style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}