'use client';

import React, { useState, useEffect } from 'react';
import { Lock, ShieldAlert, KeyRound, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function StaffGuard({ children, title = "Staff Portal Access" }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Default Staff PIN - change this to whatever PIN you prefer (e.g., '1234' or process.env PIN)
  const STAFF_PIN = '1234';

  useEffect(() => {
    const authStatus = sessionStorage.getItem('staff_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === STAFF_PIN) {
      sessionStorage.setItem('staff_authenticated', 'true');
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Incorrect Staff Passcode. Access Denied.');
      setPin('');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('staff_authenticated');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="live-dot"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <div className="glass-panel" style={{
          width: '100%',
          maxWidth: '420px',
          padding: '2rem',
          textAlign: 'center',
          borderTop: '4px solid #6366f1',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(16, 185, 129, 0.2))',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto',
            border: '1px solid rgba(99, 102, 241, 0.4)'
          }}>
            <Lock size={28} color="#6366f1" />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
            Protected Staff Area
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
            Enter 4-digit Staff Passcode to unlock {title}
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => { setPin(e.target.value); setErrorMsg(''); }}
                placeholder="Enter PIN (Default: 1234)"
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  fontSize: '1.2rem',
                  letterSpacing: '0.35em',
                  textAlign: 'center',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: errorMsg ? '2px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  outline: 'none'
                }}
              />
            </div>

            {errorMsg && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}>
                <ShieldAlert size={14} />
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.95rem',
                borderRadius: '12px',
                justifyContent: 'center'
              }}
            >
              <KeyRound size={16} /> Unlock Staff Portal <ArrowRight size={16} />
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              🔑 Default Staff PIN is <strong>1234</strong>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.5rem 1rem 0 0' }}>
        <button
          onClick={handleLogout}
          className="btn btn-outline"
          style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', opacity: 0.8 }}
        >
          <Lock size={12} /> Lock Staff Portal
        </button>
      </div>
      {children}
    </div>
  );
}
