'use client';

import React from 'react';
import { Printer, CheckCircle, X, QrCode } from 'lucide-react';

export default function TokenReceiptModal({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const formattedTime = order.createdAt 
    ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formattedDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  // Compute items list
  const items = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : [
        order.chapathiQty > 0 ? { name: 'Special Hot Chapathi', qty: order.chapathiQty, price: 15 } : null,
        order.chennaQty > 0 ? { name: 'Spicy Chenna Gravy', qty: order.chennaQty, price: 30 } : null
      ].filter(Boolean);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(2, 6, 23, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2200,
      padding: '1rem'
    }}>
      <div className="receipt-printable-container" style={{
        width: '100%',
        maxWidth: '380px',
        background: '#ffffff',
        color: '#0f172a',
        borderRadius: '20px',
        padding: '1.5rem',
        boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.7)',
        fontFamily: 'monospace, sans-serif'
      }}>
        
        {/* Receipt Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px dashed #94a3b8', paddingBottom: '0.85rem' }}>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.1em' }}>QUEUEFLOW AI TAKEAWAY</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0.1rem 0' }}>OFFICIAL TOKEN SLIP</h3>
            <p style={{ fontSize: '0.72rem', color: '#475569' }}>Hot Chapathi & Curry Station</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="receipt-no-print"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.2rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Big Token Number */}
        <div style={{ textAlign: 'center', margin: '1.15rem 0', padding: '0.75rem', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            TOKEN NUMBER
          </div>
          <div style={{ fontSize: '3.8rem', fontWeight: 900, color: '#4f46e5', margin: '-0.3rem 0', lineHeight: 1.1 }}>
            #{order.token}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '0.35rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.15rem 0.55rem', borderRadius: '9999px', background: '#e0e7ff', color: '#4338ca' }}>
              {order.orderType}
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.15rem 0.55rem', borderRadius: '9999px', background: '#dcfce7', color: '#15803d' }}>
              {order.paymentMode}
            </span>
          </div>
        </div>

        {/* Order Items */}
        <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '12px', marginBottom: '1rem', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
          <div style={{ fontWeight: 800, color: '#475569', fontSize: '0.7rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.35rem', marginBottom: '0.45rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>ITEM & QTY</span>
            <span>PRICE</span>
          </div>
          {items.map((it, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0' }}>
              <span>{it.qty}x {it.name}</span>
              <strong>₹{it.qty * (it.price || 15)}</strong>
            </div>
          ))}
          {order.notes && (
            <div style={{ marginTop: '0.4rem', paddingTop: '0.35rem', borderTop: '1px dashed #cbd5e1', fontSize: '0.72rem', color: '#64748b' }}>
              <em>Note: &quot;{order.notes}&quot;</em>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #0f172a', marginTop: '0.5rem', paddingTop: '0.5rem', fontWeight: 900, fontSize: '1.05rem', color: '#0f172a' }}>
            <span>TOTAL AMOUNT</span>
            <span>₹{order.totalAmount}</span>
          </div>
        </div>

        {/* Customer & Timestamp info */}
        <div style={{ fontSize: '0.75rem', color: '#475569', textAlign: 'center', marginBottom: '1.15rem', lineHeight: '1.4' }}>
          Customer: <strong>{order.customerName}</strong> ({order.customerPhone})<br />
          Date: {formattedDate} • Time: {formattedTime}
        </div>

        {/* Print Barcode Simulation */}
        <div style={{ textAlign: 'center', padding: '0.4rem', borderTop: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1', marginBottom: '1rem' }}>
          <div style={{ letterSpacing: '4px', fontSize: '0.7rem', color: '#475569', fontWeight: 800 }}>
            *QF-{order.token}-{order.totalAmount}*
          </div>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.15rem' }}>
            Present this token at counter for handover
          </div>
        </div>

        {/* Buttons (Hidden on Print) */}
        <div className="receipt-no-print" style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            style={{ flex: 1, color: '#334155', borderColor: '#cbd5e1' }}
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-primary"
            style={{ flex: 1.3, fontWeight: 800 }}
          >
            <Printer size={16} /> Print Receipt
          </button>
        </div>

      </div>
    </div>
  );
}
