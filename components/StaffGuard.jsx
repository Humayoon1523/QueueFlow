'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, ShieldAlert, KeyRound, ArrowRight, ArrowLeft, Delete } from 'lucide-react';

export default function StaffGuard({ children, title = "Staff Portal Access" }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Default Staff PIN
  const STAFF_PIN = '1234';

  useEffect(() => {
    const authStatus = sessionStorage.getItem('staff_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleVerifyPin = (inputPin) => {
    if (inputPin === STAFF_PIN) {
      sessionStorage.setItem('staff_authenticated', 'true');
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Incorrect Staff PIN. Please try again.');
      setPin('');
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleVerifyPin(pin);
  };

  const handleKeypadPress = (val) => {
    if (pin.length < 6) {
      const newPin = pin + val;
      setPin(newPin);
      setErrorMsg('');
      if (newPin.length === 4) {
        handleVerifyPin(newPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('staff_authenticated');
    setIsAuthenticated(false);
    setPin('');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="live-dot" style={{ width: '12px', height: '12px' }}></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <div className="glass-panel" style={{
          width: '100%',
          maxWidth: '400px',
          padding: '2rem 1.75rem',
          textAlign: 'center',
          borderTop: '4px solid var(--accent-indigo)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.2)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(6, 182, 212, 0.25))',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto',
            border: '1px solid rgba(99, 102, 241, 0.4)'
          }}>
            <Lock size={28} color="var(--accent-indigo)" />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.35rem' }}>
            Protected Staff Area
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Enter 4-digit PIN to access {title}
          </p>

          <form onSubmit={handleFormSubmit}>
            {/* PIN Dots Indicator */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: pin.length > i ? 'var(--accent-indigo)' : 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.15s ease',
                    boxShadow: pin.length > i ? '0 0 10px rgba(99, 102, 241, 0.8)' : 'none'
                  }}
                />
              ))}
            </div>

            {errorMsg && (
              <div style={{
                background: 'rgba(244, 63, 94, 0.15)',
                color: '#fda4af',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                padding: '0.5rem 0.75rem',
                borderRadius: '10px',
                fontSize: '0.78rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}>
                <ShieldAlert size={15} />
                {errorMsg}
              </div>
            )}

            {/* Quick Touch Keypad */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.55rem',
              maxWidth: '280px',
              margin: '0 auto 1.25rem auto'
            }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypadPress(num.toString())}
                  className="btn btn-outline"
                  style={{
                    height: '50px',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    borderRadius: '12px',
                    background: 'rgba(15, 23, 42, 0.7)'
                  }}
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPin('')}
                className="btn btn-outline"
                style={{ height: '50px', fontSize: '0.75rem', borderRadius: '12px', color: 'var(--text-muted)' }}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="btn btn-outline"
                style={{ height: '50px', fontSize: '1.2rem', fontWeight: 800, borderRadius: '12px' }}
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="btn btn-outline"
                style={{ height: '50px', borderRadius: '12px', color: 'var(--text-muted)' }}
                title="Backspace"
              >
                <Delete size={18} />
              </button>
            </div>

            {/* Demo 1-Click Fill Button */}
            <button
              type="button"
              onClick={() => { setPin('1234'); handleVerifyPin('1234'); }}
              className="btn btn-emerald"
              style={{ width: '100%', padding: '0.65rem', fontSize: '0.85rem', marginBottom: '0.75rem' }}
            >
              <KeyRound size={16} /> Quick Unlock with Demo PIN (1234)
            </button>
          </form>

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.85rem' }}>
            <Link
              href="/"
              style={{
                fontSize: '0.78rem',
                color: 'var(--accent-cyan)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <ArrowLeft size={14} /> Back to Customer Takeaway Hub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.35rem 0.5rem 0.65rem 0' }}>
        <button
          type="button"
          onClick={handleLogout}
          className="btn btn-outline"
          style={{ fontSize: '0.72rem', padding: '0.3rem 0.65rem', borderColor: 'rgba(244, 63, 94, 0.3)', color: '#fda4af' }}
        >
          <Lock size={12} /> Lock Staff Portal
        </button>
      </div>
      {children}
    </div>
  );
}
