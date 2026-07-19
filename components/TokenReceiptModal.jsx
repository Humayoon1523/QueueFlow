'use client';

import React from 'react';
import { Printer, CheckCircle, X } from 'lucide-react';

export default function TokenReceiptModal({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
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
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '380px',
        background: '#ffffff',
        color: '#0f172a',
        borderRadius: '20px',
        padding: '1.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        
        {/* Receipt Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px dashed #cbd5e1', paddingBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>TAKEAWAY HUB RECEIPT</h3>
            <p style={{ fontSize: '0.7rem', color: '#64748b' }}>Chapathi & Chenna Station</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        {/* Token Number */}
        <div style={{ textAlign: 'center', margin: '1.25rem 0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            TOKEN NUMBER
          </div>
          <div style={{ fontSize: '4rem', fontWeight: 900, color: '#4f46e5', margin: '-0.2rem 0' }}>
            #{order.token}
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '9999px', background: '#e0e7ff', color: '#4338ca' }}>
            {order.orderType} • {order.paymentMode}
          </span>
        </div>

        {/* Order Items */}
        <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '12px', marginBottom: '1rem', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
            <span>🫓 Chapathi ({order.chapathiQty} pcs)</span>
            <strong>₹{order.chapathiQty * 15}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
            <span>🥘 Chenna Gravy ({order.chennaQty} container)</span>
            <strong>₹{order.chennaQty * 30}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', marginTop: '0.5rem', paddingTop: '0.5rem', fontWeight: 900, fontSize: '1rem', color: '#0f172a' }}>
            <span>Total Paid</span>
            <span>₹{order.totalAmount}</span>
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', marginBottom: '1.25rem' }}>
          Customer: <strong>{order.customerName}</strong> ({order.customerPhone})<br />
          Date: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={onClose} className="btn btn-outline" style={{ flex: 1, color: '#475569', borderColor: '#cbd5e1' }}>
            Close
          </button>
          <button onClick={handlePrint} className="btn btn-primary" style={{ flex: 1 }}>
            <Printer size={16} /> Print Token
          </button>
        </div>

      </div>
    </div>
  );
}
