'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChefHat, Store, PackageCheck, Bot, Volume2, VolumeX, Sparkles, ShoppingBag, Clock, Bell, Check, Trash2, X, ExternalLink } from 'lucide-react';

export default function Navbar({ currentRole, setCurrentRole, activeQueueCount, soundEnabled, setSoundEnabled, notificationAlert }) {
  const [currentTime, setCurrentTime] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notify');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const markAllRead = async () => {
    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' })
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const staffRoles = [
    { id: 'manager', label: 'Manager Operations', href: '/manager', icon: Store },
    { id: 'delivery', label: 'Kitchen & Packing', href: '/delivery', icon: PackageCheck },
    { id: 'analytics', label: 'AI Analytics', href: '/analytics', icon: Bot }
  ];

  const handleRoleClick = (roleId) => {
    if (setCurrentRole) {
      setCurrentRole(roleId);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="glass-panel" style={{ padding: '0.85rem 1.15rem', marginBottom: '1.25rem', width: '100%', borderTop: '3px solid var(--accent-indigo)', position: 'relative', zIndex: 50 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', width: '100%' }}>

        {/* Brand & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-cyan))',
            padding: '0.5rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.45)'
          }}>
            <ChefHat size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 900, background: 'linear-gradient(90deg, #ffffff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap' }}>
                QueueFlow AI
              </span>
              <span className="badge badge-ready" style={{ fontSize: '0.62rem', padding: '0.15rem 0.45rem' }}>
                <Sparkles size={10} /> STAFF PORTAL
              </span>
            </div>
            {currentTime && (
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.05rem' }}>
                <Clock size={11} /> {currentTime} • Takeaway Engine Live
              </div>
            )}
          </div>
        </div>

        {/* Action Controls: Audio Toggle, Notification Bell, & Back to Customer App */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }} ref={dropdownRef}>
          <Link
            href="/"
            className="btn btn-outline"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', borderColor: 'rgba(6, 182, 212, 0.4)', color: 'var(--accent-cyan)' }}
            title="Open Customer Pre-Order App"
          >
            <ShoppingBag size={14} />
            <span>Customer App</span>
          </Link>

          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="btn btn-outline"
              style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem', position: 'relative' }}
              title="System Alerts & Customer Notifications"
            >
              <Bell size={14} color={unreadCount > 0 ? 'var(--accent-amber)' : 'var(--text-muted)'} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#f43f5e',
                  color: '#ffffff',
                  fontSize: '0.6rem',
                  fontWeight: 900,
                  borderRadius: '9999px',
                  padding: '0.05rem 0.3rem',
                  lineHeight: '1.2'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '320px',
                maxWidth: '90vw',
                background: '#0d1527',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '14px',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
                padding: '0.75rem',
                zIndex: 100,
                animation: 'fade-in 0.2s ease-out'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Bell size={13} color="var(--accent-cyan)" />
                    System Notifications
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                    >
                      <Check size={12} /> Mark read
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                  {notifications.length === 0 ? (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                      No recent notifications
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((n) => (
                      <div
                        key={n.id}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '8px',
                          background: n.read ? 'rgba(255, 255, 255, 0.02)' : 'rgba(99, 102, 241, 0.1)',
                          borderLeft: `3px solid ${n.read ? 'rgba(255, 255, 255, 0.2)' : 'var(--accent-indigo)'}`,
                          fontSize: '0.75rem',
                          color: '#ffffff'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontSize: '0.7rem' }}>
                            {n.type?.toUpperCase() || 'ALERT'}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <div style={{ marginTop: '0.2rem', lineHeight: '1.3' }}>
                          {n.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="btn btn-outline"
            style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem' }}
            title={soundEnabled ? 'Click to Mute Audio' : 'Click to Enable Audio Alerts'}
          >
            {soundEnabled ? (
              <>
                <Volume2 size={14} color="var(--accent-emerald)" />
                <span style={{ color: 'var(--accent-emerald)' }}>Audio On</span>
              </>
            ) : (
              <>
                <VolumeX size={14} color="var(--text-muted)" />
                <span style={{ color: 'var(--text-muted)' }}>Muted</span>
              </>
            )}
          </button>
        </div>

        {/* Staff Role Switcher Tabs */}
        <nav className="nav-tabs" style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto' }}>
          {staffRoles.map(r => {
            const Icon = r.icon;
            const isActive = currentRole === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => handleRoleClick(r.id)}
                className={`btn ${isActive ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.45rem 0.7rem',
                  borderRadius: '10px',
                  border: isActive ? 'none' : 'transparent',
                  background: isActive ? 'linear-gradient(135deg, var(--accent-indigo), #4f46e5)' : 'transparent',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={14} />
                <span>{r.label}</span>
                {r.id === 'manager' && activeQueueCount > 0 && (
                  <span style={{
                    background: '#f43f5e',
                    color: '#fff',
                    borderRadius: '9999px',
                    padding: '0.05rem 0.38rem',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    marginLeft: '0.2rem'
                  }}>
                    {activeQueueCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

      </div>

      {notificationAlert && (
        <div style={{
          marginTop: '0.75rem',
          background: 'rgba(16, 185, 129, 0.18)',
          border: '1px solid var(--accent-emerald)',
          borderRadius: '10px',
          padding: '0.45rem 0.85rem',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: '#ffffff',
          textAlign: 'center',
          animation: 'float-badge 1s infinite alternate'
        }}>
          🔔 {notificationAlert}
        </div>
      )}
    </header>
  );
}