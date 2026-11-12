'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Phone, ArrowRight, Sparkles, Utensils, ShieldCheck, Zap, Lock, MapPin } from 'lucide-react';

export default function CustomerLogin({ onLogin }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    onLogin({ name: name.trim(), phone: cleanedPhone });
  };

  const handleDemoLogin = (demoName, demoPhone) => {
    setName(demoName);
    setPhone(demoPhone);
    onLogin({ name: demoName, phone: demoPhone });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.25rem 1rem',
      background: 'radial-gradient(circle at 50% 0%, #1e1b4b 0%, #0c1222 55%, #050811 100%)',
    }}>
      <div 
        className="glass-panel" 
        style={{
          width: '100%',
          maxWidth: '430px',
          padding: '2.2rem 2rem',
          textAlign: 'center',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.2)',
          transform: animate ? 'translateY(0) scale(1)' : 'translateY(25px) scale(0.96)',
          opacity: animate ? 1 : 0,
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Animated Brand Badge */}
        <div style={{
          width: '68px',
          height: '68px',
          borderRadius: '22px',
          background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-cyan))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto',
          color: '#ffffff',
          boxShadow: '0 8px 25px rgba(99, 102, 241, 0.45)',
        }}>
          <Utensils size={32} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
          <span className="live-dot" style={{ width: '8px', height: '8px' }}></span>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent-cyan)', letterSpacing: '0.12em' }}>
            SMART TAKEAWAY PRE-ORDER HUB
          </span>
        </div>

        <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
          QueueFlow AI
        </h1>
        
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.45' }}>
          Skip the counter rush. Order hot chapathis & curries with zero waiting in line.
        </p>

        {/* Feature Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '9999px', background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            ⚡ UPI Instant Pay
          </span>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            🎯 Live Token Tracker
          </span>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '9999px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
            📍 Arrival Radar
          </span>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            borderRadius: '12px',
            padding: '0.65rem 0.85rem',
            fontSize: '0.8rem',
            color: '#fda4af',
            marginBottom: '1.25rem',
            textAlign: 'left',
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', letterSpacing: '0.04em' }}>
              CUSTOMER NAME
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <User size={16} />
              </span>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Anand Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', letterSpacing: '0.04em' }}>
              MOBILE PHONE NUMBER
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Phone size={16} />
              </span>
              <input
                type="tel"
                maxLength={10}
                className="input-field"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                required
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              padding: '0.85rem 1rem',
              fontSize: '0.92rem',
              fontWeight: 800,
              marginTop: '0.35rem',
              width: '100%'
            }}
          >
            Start Takeaway Pre-Order <ArrowRight size={17} />
          </button>
        </form>

        {/* 1-Click Demo Profile Button */}
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            type="button"
            onClick={() => handleDemoLogin('Anand Sharma', '9876543210')}
            className="btn btn-outline"
            style={{ width: '100%', fontSize: '0.78rem', padding: '0.55rem', borderColor: 'rgba(6, 182, 212, 0.35)', color: 'var(--accent-cyan)' }}
          >
            <Zap size={14} /> Quick Demo Login as &quot;Anand Sharma&quot;
          </button>
        </div>

        {/* Staff Portal Link */}
        <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
          <Link
            href="/manager"
            style={{
              fontSize: '0.75rem',
              color: '#94a3b8',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <Lock size={12} /> Restaurant Staff POS Login
          </Link>
        </div>

      </div>
    </div>
  );
}
