'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ChefHat, Clock, Sparkles, Flame, CheckCircle, Package, Zap } from 'lucide-react';

/**
 * VisualQueue3D - High-Fidelity Isometric Kitchen Station & Queue Throughput Visualizer
 * Renders stationary, architectural kitchen station bays, central packing hub,
 * and continuous flowing order token packets based on REAL live order data.
 */
export default function VisualQueue3D({ activeOrders = [], stations = [], activeCount = 0 }) {
  const canvasRef = useRef(null);
  const [hoveredStation, setHoveredStation] = useState(null);

  // Derive real active order count from array or prop
  const currentActiveOrders = useMemo(() => {
    if (Array.isArray(activeOrders) && activeOrders.length > 0) {
      return activeOrders.filter(o => o.orderStatus !== 'COMPLETED' && o.orderStatus !== 'CANCELLED');
    }
    return [];
  }, [activeOrders]);

  const liveActiveCount = currentActiveOrders.length || (typeof activeCount === 'number' ? activeCount : 0);

  // Compute live items and workload per station from actual active orders
  const stationWorkloads = useMemo(() => {
    const workloads = {
      tawa_station: { items: 0, orderTokens: [], names: [] },
      main_kitchen: { items: 0, orderTokens: [], names: [] },
      biryani_station: { items: 0, orderTokens: [], names: [] },
      fryer_station: { items: 0, orderTokens: [], names: [] },
      beverage_station: { items: 0, orderTokens: [], names: [] },
      packing_hub: { items: 0, orderTokens: [], names: [] }
    };

    const norm = (s) => (s || '').toLowerCase().replace(/_station$/, '');

    currentActiveOrders.forEach(o => {
      const isPacking = o.orderStatus === 'PACKING';
      const isReady = o.orderStatus === 'READY';

      if (isPacking || isReady) {
        workloads.packing_hub.items += (o.items || []).length || 1;
        workloads.packing_hub.orderTokens.push(o.token);
      }

      (o.items || []).forEach(it => {
        const itemSt = norm(it.station);
        let targetKey = 'main_kitchen';
        if (itemSt.includes('tawa') || itemSt.includes('bread')) targetKey = 'tawa_station';
        else if (itemSt.includes('biryani')) targetKey = 'biryani_station';
        else if (itemSt.includes('fryer')) targetKey = 'fryer_station';
        else if (itemSt.includes('beverage') || itemSt.includes('dessert')) targetKey = 'beverage_station';
        else targetKey = 'main_kitchen';

        const qty = it.qty || 1;
        workloads[targetKey].items += qty;
        if (!workloads[targetKey].orderTokens.includes(o.token)) {
          workloads[targetKey].orderTokens.push(o.token);
        }
        workloads[targetKey].names.push(`${qty}x ${it.name}`);
      });
    });

    return workloads;
  }, [currentActiveOrders]);

  // Estimate total time to complete all orders (minutes)
  const totalClearanceMinutes = useMemo(() => {
    if (liveActiveCount === 0) return 0;
    const maxStationItems = Math.max(
      Math.ceil((stationWorkloads.tawa_station.items || 0) / 4) * 4,
      Math.ceil((stationWorkloads.main_kitchen.items || 0) / 2) * 6,
      Math.ceil((stationWorkloads.biryani_station.items || 0) / 2) * 5,
      Math.ceil((stationWorkloads.fryer_station.items || 0) / 2) * 5,
      Math.ceil((stationWorkloads.beverage_station.items || 0) / 2) * 2
    );
    const packingTime = liveActiveCount * 1.5;
    const buffer = 2;
    return Math.max(3, Math.round(maxStationItems + packingTime + buffer));
  }, [liveActiveCount, stationWorkloads]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let animTime = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Station Layout Definition: Fixed Architectural Bays in 2.5D Isometric Space
    // Normalized layout coordinates: (nx: 0..1, ny: 0..1)
    const stationNodes = [
      {
        id: 'tawa_station',
        name: 'Tawa & Breads',
        icon: '🫓',
        color: '#f59e0b',
        nx: 0.18,
        ny: 0.70,
        capacity: 3,
        shortDesc: 'Hot Chapathis & Naans'
      },
      {
        id: 'main_kitchen',
        name: 'Main Kitchen',
        icon: '🍲',
        color: '#6366f1',
        nx: 0.24,
        ny: 0.28,
        capacity: 3,
        shortDesc: 'Curries & Gravies'
      },
      {
        id: 'biryani_station',
        name: 'Biryani Handi',
        icon: '🍚',
        color: '#ec4899',
        nx: 0.76,
        ny: 0.28,
        capacity: 2,
        shortDesc: 'Dum Chicken & Paneer'
      },
      {
        id: 'fryer_station',
        name: 'Deep Fryer',
        icon: '🥟',
        color: '#f97316',
        nx: 0.82,
        ny: 0.70,
        capacity: 2,
        shortDesc: 'Crispy Appetizers'
      },
      {
        id: 'beverage_station',
        name: 'Cold Counter',
        icon: '🥤',
        color: '#06b6d4',
        nx: 0.50,
        ny: 0.16,
        capacity: 2,
        shortDesc: 'Lassi, Chaas & Desserts'
      },
      {
        id: 'packing_hub',
        name: 'Packing & Handover Hub',
        icon: '📦',
        color: '#10b981',
        nx: 0.50,
        ny: 0.65,
        capacity: 4,
        shortDesc: 'Bagging, Sealing & Ready Counter',
        isHub: true
      }
    ];

    // Mouse Interaction for Hover
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const width = rect.width;
      const height = rect.height;

      let found = null;
      stationNodes.forEach(st => {
        const x = st.nx * width;
        const y = st.ny * height;
        const dist = Math.hypot(mouseX - x, mouseY - y);
        if (dist < 42) {
          found = st;
        }
      });
      setHoveredStation(found);
    };

    const handleMouseLeave = () => setHoveredStation(null);

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      ctx.clearRect(0, 0, width, height);

      animTime += 0.012;

      // 1. Draw Isometric Base Floor Grid & Aesthetic Rings
      ctx.save();
      const centerX = width / 2;
      const centerY = height / 2;

      // Floor grid ellipse
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 20, width * 0.46, height * 0.42, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.12)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.stroke();

      // Inner routing ring
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 20, width * 0.28, height * 0.25, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      const hubX = 0.50 * width;
      const hubY = 0.65 * height;

      // 2. Draw Transport Track Lines connecting Stations to Central Packing Hub
      stationNodes.forEach(st => {
        if (st.isHub) return;
        const sx = st.nx * width;
        const sy = st.ny * height;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        // Subtle quadratic curve toward packing hub
        const midX = (sx + hubX) / 2;
        const midY = (sy + hubY) / 2 + 10;
        ctx.quadraticCurveTo(midX, midY, hubX, hubY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 6]);
        ctx.stroke();

        // If station has active items, illuminate the track
        const stData = stationWorkloads[st.id] || { items: 0 };
        if (stData.items > 0) {
          ctx.strokeStyle = `${st.color}55`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        ctx.restore();
      });

      // 3. Render Smooth, Continuous Virtual Token Particles along the Tracks
      // Tokens travel seamlessly from stations into the packing hub without resetting abruptly
      const activeStationKeys = stationNodes.filter(s => !s.isHub && (stationWorkloads[s.id]?.items > 0));
      const stationsToDraw = activeStationKeys.length > 0 ? activeStationKeys : stationNodes.filter(s => !s.isHub);

      stationsToDraw.forEach((st, idx) => {
        const sx = st.nx * width;
        const sy = st.ny * height;
        const midX = (sx + hubX) / 2;
        const midY = (sy + hubY) / 2 + 10;

        // Continuous interpolation parameter (0 to 1) based on continuous animTime
        // Phase-shifted per station so particles flow naturally
        const speed = liveActiveCount > 0 ? 0.45 : 0.2;
        const t = ((animTime * speed) + (idx * 0.25)) % 1;

        // Quadratic bezier position: B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
        const invT = 1 - t;
        const px = (invT * invT * sx) + (2 * invT * t * midX) + (t * t * hubX);
        const py = (invT * invT * sy) + (2 * invT * t * midY) + (t * t * hubY);

        ctx.save();
        // Outer energy aura
        ctx.beginPath();
        ctx.arc(px, py - 6, 6, 0, Math.PI * 2);
        ctx.fillStyle = st.color;
        ctx.shadowColor = st.color;
        ctx.shadowBlur = 12;
        ctx.fill();

        // Inner white nucleus
        ctx.beginPath();
        ctx.arc(px, py - 6, 2.8, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();
      });

      // 4. Draw Stations as Fixed 3D Isometric Bays
      stationNodes.forEach(st => {
        const sx = st.nx * width;
        const sy = st.ny * height;
        const workload = stationWorkloads[st.id] || { items: 0, orderTokens: [] };
        const isActive = workload.items > 0;
        const isHovered = hoveredStation?.id === st.id;

        const baseRadius = st.isHub ? 32 : 24;
        const pillarHeight = st.isHub ? 40 : 28;

        ctx.save();

        // Ambient ground glow for active stations
        if (isActive || st.isHub) {
          const glowColor = st.isHub ? '#10b981' : st.color;
          const pulse = Math.sin(animTime * 3) * 4;
          ctx.beginPath();
          ctx.ellipse(sx, sy + 12, baseRadius + 14 + pulse, (baseRadius + 14 + pulse) * 0.45, 0, 0, Math.PI * 2);
          ctx.fillStyle = `${glowColor}18`;
          ctx.fill();
        }

        // Base shadow
        ctx.beginPath();
        ctx.ellipse(sx, sy + 10, baseRadius + 4, (baseRadius + 4) * 0.45, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fill();

        // 3D Isometric Cylinder / Bay Body
        ctx.beginPath();
        ctx.rect(sx - baseRadius, sy - pillarHeight, baseRadius * 2, pillarHeight);
        const grad = ctx.createLinearGradient(sx - baseRadius, sy - pillarHeight, sx + baseRadius, sy);
        if (isActive || st.isHub) {
          grad.addColorStop(0, st.color);
          grad.addColorStop(1, '#090e1a');
        } else {
          grad.addColorStop(0, '#1e293b');
          grad.addColorStop(1, '#090e1a');
        }
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = isActive || isHovered ? st.color : 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = isHovered ? 2 : 1.2;
        ctx.stroke();

        // Top Isometric Platform
        ctx.beginPath();
        ctx.ellipse(sx, sy - pillarHeight, baseRadius, baseRadius * 0.45, 0, 0, Math.PI * 2);
        ctx.fillStyle = isActive || st.isHub ? st.color : '#334155';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Station Icon / Emoji on platform
        ctx.font = `${st.isHub ? '16px' : '14px'} sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(st.icon, sx, sy - pillarHeight - 1);

        // Station Header Text (Above platform)
        ctx.font = '800 11px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(st.name, sx, sy - pillarHeight - 20);

        // Subtext: Active items or capacity status
        ctx.font = '600 9.5px Plus Jakarta Sans, sans-serif';
        if (st.isHub) {
          ctx.fillStyle = liveActiveCount > 0 ? '#10b981' : '#94a3b8';
          ctx.fillText(liveActiveCount > 0 ? `📦 ${liveActiveCount} Orders in Pipeline` : 'Counter Ready', sx, sy - pillarHeight - 8);
        } else if (isActive) {
          ctx.fillStyle = '#f59e0b';
          ctx.fillText(`🔥 ${workload.items} items cooking`, sx, sy - pillarHeight - 8);
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
          ctx.fillText(`Ready (${st.capacity} slots)`, sx, sy - pillarHeight - 8);
        }

        ctx.restore();
      });

      // 5. Tooltip Card if hovering over a station
      if (hoveredStation) {
        const sx = hoveredStation.nx * width;
        const sy = hoveredStation.ny * height;
        const data = stationWorkloads[hoveredStation.id] || { items: 0, names: [], orderTokens: [] };

        ctx.save();
        const tipWidth = 190;
        const tipHeight = 72;
        const tipX = Math.min(width - tipWidth - 10, Math.max(10, sx - tipWidth / 2));
        const tipY = Math.max(10, sy - 110);

        ctx.fillStyle = 'rgba(13, 21, 39, 0.95)';
        ctx.strokeStyle = hoveredStation.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(tipX, tipY, tipWidth, tipHeight, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = '800 11px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText(`${hoveredStation.icon} ${hoveredStation.name}`, tipX + 10, tipY + 18);

        ctx.font = '600 9.5px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = hoveredStation.color;
        ctx.fillText(`Capacity: ${hoveredStation.capacity} concurrent batches`, tipX + 10, tipY + 34);

        ctx.fillStyle = '#cbd5e1';
        if (data.items > 0) {
          ctx.fillText(`Active: ${data.items} items (Tokens: #${data.orderTokens.join(', #')})`, tipX + 10, tipY + 50);
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(data.names.slice(0, 2).join(', '), tipX + 10, tipY + 64);
        } else {
          ctx.fillStyle = '#10b981';
          ctx.fillText('Station idle • Ready for instant tickets', tipX + 10, tipY + 50);
        }
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [currentActiveOrders, liveActiveCount, stationWorkloads, hoveredStation]);

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: '14px', overflow: 'hidden', background: '#070c17' }}>
      
      {/* HUD HEADER: LIVE TELEMETRY & CLEARANCE TIME */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.65rem',
        padding: '0.75rem 1rem',
        background: 'rgba(15, 23, 42, 0.85)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-cyan))',
            padding: '0.45rem',
            borderRadius: '10px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ChefHat size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span>Kitchen Station Pipeline & Flow</span>
              <span className="live-dot" style={{ width: '7px', height: '7px' }}></span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              Fixed Station Concurrency • Verbal Bridge Simulation
            </div>
          </div>
        </div>

        {/* METRICS PILLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Total Queue Clearance Time */}
          <div style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            padding: '0.35rem 0.65rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.75rem'
          }}>
            <Clock size={13} color="var(--accent-amber)" />
            <span style={{ color: 'var(--text-muted)' }}>Total Clearance:</span>
            <strong style={{ color: 'var(--accent-amber)' }}>
              {liveActiveCount > 0 ? `${totalClearanceMinutes} mins` : 'Queue Clear (0m)'}
            </strong>
          </div>

          {/* Active Orders in Queue */}
          <div style={{
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            padding: '0.35rem 0.65rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.75rem'
          }}>
            <Zap size={13} color="var(--accent-cyan)" />
            <span style={{ color: 'var(--text-muted)' }}>Queue Load:</span>
            <strong style={{ color: 'var(--accent-cyan)' }}>
              {liveActiveCount} Active {liveActiveCount === 1 ? 'Order' : 'Orders'}
            </strong>
          </div>
        </div>
      </div>

      {/* CANVAS ELEMENT */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '240px',
          display: 'block',
          cursor: 'crosshair'
        }}
      />

      {/* BOTTOM FOOTER HELP TEXT */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.4rem 1rem',
        background: 'rgba(15, 23, 42, 0.6)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        fontSize: '0.68rem',
        color: 'var(--text-muted)'
      }}>
        <span>💡 Hover any station bay to inspect live cooking batches and capacity</span>
        <span style={{ color: 'var(--accent-emerald)' }}>● Continuous Packet Flow</span>
      </div>

    </div>
  );
}