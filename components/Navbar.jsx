'use client';

import React from 'react';
import { ChefHat, Store, PackageCheck, Bot, Volume2, Sparkles } from 'lucide-react';

export default function Navbar({ currentRole, setCurrentRole, activeQueueCount, soundEnabled, setSoundEnabled, notificationAlert }) {
  const staffRoles = [
    { id: 'manager', label: 'Manager POS', shortLabel: 'POS', icon: Store },
    { id: 'delivery', label: 'Delivery & Packing', shortLabel: 'Delivery', icon: PackageCheck },
    { id: 'analytics', label: 'AI Analytics', shortLabel: 'Analytics', icon: Bot }
  ];

  return (
    <header className="glass-panel" style={{ padding: '0.75rem 1rem', marginBottom: '1rem', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.65rem', width: '100%' }}>
        
        {/* Brand & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            padding: '0.45rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
          }}>
            <ChefHat size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.05rem', fontWeight: 800, background: 'linear-gradient(90deg, #ffffff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap' }}>
                QueueFlow Staff
              </h1>
              <span className="badge badge-ready" style={{ fontSize: '0.6rem', padding: '0.15rem 0.4rem' }}>
                <Sparkles size={10} /> STAFF ONLY
              </span>
            </div>
          </div>
        </div>

        {/* Audio Alert Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="btn btn-outline"
          style={{ padding: '0.35rem 0.6rem', fontSize: '0.72rem' }}
          title="Toggle Sound Alerts"
        >
          <Volume2 size={13} color={soundEnabled ? '#10b981' : '#94a3b8'} />
          <span style={{ color: soundEnabled ? '#10b981' : '#94a3b8' }}>{soundEnabled ? 'Audio On' : 'Muted'}</span>
        </button>

        {/* Staff Role Switcher Tabs */}
        <nav className="nav-tabs">
          {staffRoles.map(r => {
            const Icon = r.icon;
            const isActive = currentRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setCurrentRole(r.id)}
                className={`btn ${isActive ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.4rem 0.5rem',
                  borderRadius: '9px',
                  border: isActive ? 'none' : 'transparent',
                  background: isActive ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
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
                    padding: '0.05rem 0.35rem',
                    fontSize: '0.65rem',
                    fontWeight: 800
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
          marginTop: '0.5rem',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid #10b981',
          borderRadius: '8px',
          padding: '0.35rem 0.65rem',
          fontSize: '0.75rem',
          color: '#10b981',
          textAlign: 'center',
          animation: 'float-badge 1s infinite alternate'
        }}>
          🔔 {notificationAlert}
        </div>
      )}
    </header>
  );
}
