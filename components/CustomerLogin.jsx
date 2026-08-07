'use client';

import React, { useState, useEffect } from 'react';
import { User, Phone, ArrowRight, Sparkles, Utensils } from 'lucide-react';

export default function CustomerLogin({ onLogin }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger entrance animation delay
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
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    onLogin({ name: name.trim(), phone: cleanedPhone });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      background: 'radial-gradient(circle at 50% 0%, #1e1b4b 0%, #0f172a 60%, #020617 100%)',
    }}>
      <div 
        className="glass-panel" 
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '2.2rem 2rem',
          textAlign: 'center',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.15)',
          transform: animate ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
          opacity: animate ? 1 : 0,
          transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Animated Accent Glow */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-cyan))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4), 0 0 20px rgba(6, 182, 212, 0.2)',
        }}>
          <Utensils size={30} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
          <span className="live-dot" style={{ width: '8px', height: '8px' }}></span>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent-cyan)', letterSpacing: '0.12em' }}>
            QUEUEFLOW AI PRE-ORDER
          </span>
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          Welcome Customer
        </h1>
        
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.8rem', lineHeight: '1.4' }}>
          Enter your name and phone number to access the smart takeout queue and pre-order hub.
        </p>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '10px',
            padding: '0.65rem 0.85rem',
            fontSize: '0.78rem',
            color: '#fda4af',
            marginBottom: '1.25rem',
            textAlign: 'left',
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', textAlign: 'left' }}>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              YOUR NAME
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
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem 0.65rem 2.4rem',
                  fontSize: '0.88rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-indigo)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              PHONE NUMBER
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Phone size={16} />
              </span>
              <input
                type="tel"
                className="input-field"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem 0.65rem 2.4rem',
                  fontSize: '0.88rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-indigo)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              padding: '0.8rem 1rem',
              fontSize: '0.9rem',
              fontWeight: 800,
              marginTop: '0.5rem',
              background: 'linear-gradient(135deg, var(--accent-indigo) 0%, #4f46e5 100%)',
              boxShadow: '0 6px 20px rgba(99, 102, 241, 0.35)',
            }}
          >
            Enter Takeaway Hub <ArrowRight size={16} />
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          fontSize: '0.68rem',
          color: 'var(--text-muted)'
        }}>
          <Sparkles size={12} color="var(--accent-cyan)" />
          <span>Powered by Intelligent Queue Engine</span>
        </div>
      </div>
    </div>
  );
}
