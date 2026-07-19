import React from 'react';
import { ChefHat, Smartphone, Store, PackageCheck, Bot, BellRing, Volume2, Sparkles } from 'lucide-react';

export default function Navbar({ currentRole, setCurrentRole, activeQueueCount, soundEnabled, setSoundEnabled, notificationAlert }) {
  const roles = [
    { id: 'customer', label: 'Customer App', icon: Smartphone, color: 'from-cyan-500 to-blue-500' },
    { id: 'manager', label: 'Manager POS', icon: Store, color: 'from-purple-500 to-indigo-500' },
    { id: 'delivery', label: 'Delivery & Packing', icon: PackageCheck, color: 'from-amber-500 to-orange-500' },
    { id: 'analytics', label: 'AI Analytics', icon: Bot, color: 'from-emerald-500 to-teal-500' }
  ];

  return (
    <header className="glass-panel" style={{ padding: '0.85rem 1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            padding: '0.6rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
          }}>
            <ChefHat size={26} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, background: 'linear-gradient(90deg, #ffffff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                QueueFlow AI
              </h1>
              <span className="badge badge-ready" style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}>
                <Sparkles size={10} /> AI LIVE
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Intelligent Takeaway Queue & Order Coordination System
            </p>
          </div>
        </div>

        {/* Role Switcher Tabs */}
        <nav style={{ display: 'flex', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.35rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          {roles.map(r => {
            const Icon = r.icon;
            const isActive = currentRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setCurrentRole(r.id)}
                className={`btn ${isActive ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  fontSize: '0.85rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '10px',
                  border: isActive ? 'none' : 'transparent',
                  background: isActive ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent'
                }}
              >
                <Icon size={16} />
                <span>{r.label}</span>
                {r.id === 'manager' && activeQueueCount > 0 && (
                  <span style={{
                    background: '#f43f5e',
                    color: '#fff',
                    borderRadius: '9999px',
                    padding: '0.1rem 0.45rem',
                    fontSize: '0.7rem',
                    fontWeight: 700
                  }}>
                    {activeQueueCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick System Controls & Notifications */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="btn btn-outline"
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
            title="Toggle Sound Alerts"
          >
            <Volume2 size={16} color={soundEnabled ? '#10b981' : '#94a3b8'} />
            <span style={{ color: soundEnabled ? '#10b981' : '#94a3b8' }}>{soundEnabled ? 'Audio On' : 'Muted'}</span>
          </button>

          {notificationAlert && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              borderRadius: '10px',
              padding: '0.4rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8rem',
              color: '#10b981',
              animation: 'float-badge 1s infinite alternate'
            }}>
              <BellRing size={16} />
              <span>{notificationAlert}</span>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
