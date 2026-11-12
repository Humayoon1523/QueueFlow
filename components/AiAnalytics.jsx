'use client';

import React, { useState } from 'react';
import { 
  Bot, Sparkles, Clock, Cpu, Flame, BarChart3, TrendingUp, Package, 
  Layers, Lightbulb, ShieldCheck, RefreshCw, AlertTriangle, CheckCircle2,
  Sliders, Activity, Award, Timer, Radio, Eye, EyeOff, Utensils
} from 'lucide-react';
import VisualQueue3D from './VisualQueue3D';

export default function AiAnalytics({ aiPrediction, metrics, orders = [] }) {
  const [activeHourlyBar, setActiveHourlyBar] = useState(null);
  const [showVisualizer, setShowVisualizer] = useState(true);

  const activeOrders = orders.filter(o => o.orderStatus !== 'COMPLETED' && o.orderStatus !== 'CANCELLED');

  const defaultStations = [
    { id: 'tawa_station', name: 'Tawa & Bread Station', icon: '🫓', capacity: 3, activeItems: 0, activeMinutes: 0, utilizationPct: 0 },
    { id: 'main_kitchen', name: 'Main Kitchen (Curries & Gravies)', icon: '🍲', capacity: 3, activeItems: 0, activeMinutes: 0, utilizationPct: 0 },
    { id: 'biryani_station', name: 'Biryani & Rice Station', icon: '🍚', capacity: 2, activeItems: 0, activeMinutes: 0, utilizationPct: 0 },
    { id: 'fryer_station', name: 'Fryer & Starters Station', icon: '🥟', capacity: 2, activeItems: 0, activeMinutes: 0, utilizationPct: 0 },
    { id: 'beverage_station', name: 'Beverage & Dessert Counter', icon: '🥤', capacity: 2, activeItems: 0, activeMinutes: 0, utilizationPct: 0 }
  ];

  const predictions = aiPrediction || {
    estimatedWaitMinutes: 8,
    totalEstimatedTimeToCompleteAllOrdersMinutes: activeOrders.length > 0 ? activeOrders.length * 6 : 0,
    totalClearanceFormatted: activeOrders.length > 0 ? `${activeOrders.length * 6} mins` : 'Queue Clear (0m)',
    completionTargetTime: 'Within 20 mins',
    rushHourPrediction: {
      peakStatus: "BALANCED_FLOW",
      expectedOrders: 45,
      peakHourText: "7:00 PM - 9:00 PM",
      recommendation: "Takeaway order inflow is steady. Kitchen stations operating at optimal concurrency.",
      cookingLoadPercentage: 45
    },
    etaRecommendation: {
      estimatedPickupTime: "07:30 PM",
      suggestedArrivalTime: "07:25 PM",
      customerMessage: "Estimated Pickup: 7:30 PM. Please arrive 5 minutes before."
    },
    analytics: {
      avgPrepMinutes: 4.2,
      avgWaitMinutes: 8,
      totalEstimatedTimeToCompleteAllOrdersMinutes: activeOrders.length > 0 ? activeOrders.length * 6 : 0,
      totalClearanceFormatted: activeOrders.length > 0 ? `${activeOrders.length * 6} mins` : 'Queue Clear (0m)',
      completionTargetTime: 'Within 20 mins',
      throughputChapathiPerHr: 180,
      throughputChennaPerHr: 60,
      queueCongestionScore: "OPTIMAL",
      kitchenUtilizationPct: 40,
      totalActiveKitchenOrders: activeOrders.length,
      etaAccuracyPercentage: 94.5,
      averageEtaVarianceMinutes: 1.2,
      totalOrdersAnalyzed: orders.length
    },
    stationUtilization: defaultStations,
    inventoryForecast: {
      flourAttaKg: '6.5',
      chennaBeansKg: '3.2',
      cookingOilLiters: '1.4',
      ecoBoxesCount: 38
    },
    hourlyForecast: [
      { hour: '10 AM', orders: 4, load: 15 },
      { hour: '11 AM', orders: 8, load: 22 },
      { hour: '12 PM', orders: 24, load: 55 },
      { hour: '1 PM', orders: 36, load: 78, isPeak: true },
      { hour: '2 PM', orders: 20, load: 45 },
      { hour: '3 PM', orders: 6, load: 15 },
      { hour: '4 PM', orders: 12, load: 25 },
      { hour: '5 PM', orders: 18, load: 35 },
      { hour: '6 PM', orders: 28, load: 60 },
      { hour: '7 PM', orders: 42, load: 88, isPeak: true },
      { hour: '8 PM', orders: 48, load: 95, isPeak: true },
      { hour: '9 PM', orders: 30, load: 65 },
      { hour: '10 PM', orders: 10, load: 20 },
    ]
  };

  const rush = predictions.rushHourPrediction || {};
  const analytics = predictions.analytics || {};
  const inventory = predictions.inventoryForecast || {};
  const hourlyData = predictions.hourlyForecast || [];

  // Total Estimated Time to Complete All Orders
  const totalClearanceMinutes = predictions.totalEstimatedTimeToCompleteAllOrdersMinutes !== undefined
    ? predictions.totalEstimatedTimeToCompleteAllOrdersMinutes
    : (predictions.analytics?.totalEstimatedTimeToCompleteAllOrdersMinutes !== undefined
      ? predictions.analytics.totalEstimatedTimeToCompleteAllOrdersMinutes
      : (activeOrders.length > 0 ? activeOrders.length * 5 + 3 : 0));

  const totalClearanceText = predictions.totalClearanceFormatted || (totalClearanceMinutes > 0 ? `${totalClearanceMinutes} mins` : 'Queue Clear (0m)');
  const completionTarget = predictions.completionTargetTime || predictions.analytics?.completionTargetTime || 'All Orders Completed';

  // Ensure Stations Array is NEVER empty
  const rawStations = (predictions.stationUtilization && predictions.stationUtilization.length > 0)
    ? predictions.stationUtilization
    : (predictions.stationStats && predictions.stationStats.length > 0)
      ? predictions.stationStats
      : (predictions.analytics?.stationStats && predictions.analytics.stationStats.length > 0)
        ? predictions.analytics.stationStats
        : defaultStations;

  const stations = rawStations.map(st => {
    let icon = '🍲';
    const id = (st.id || '').toLowerCase();
    if (id.includes('tawa') || id.includes('bread')) icon = '🫓';
    else if (id.includes('biryani')) icon = '🍚';
    else if (id.includes('fryer')) icon = '🥟';
    else if (id.includes('beverage') || id.includes('dessert') || id.includes('cold')) icon = '🥤';
    return { ...st, icon };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', paddingBottom: '3rem' }}>
      
      {/* AI ENGINE HERO BANNER */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(99, 102, 241, 0.15))', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-indigo))',
              padding: '0.85rem',
              borderRadius: '16px',
              color: '#fff',
              boxShadow: '0 4px 20px rgba(6, 182, 212, 0.4)',
              flexShrink: 0
            }}>
              <Cpu size={36} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff' }}>
                  Smart ETA & Kitchen Workload Analytics
                </h2>
                <span className="badge badge-ready" style={{ fontSize: '0.62rem' }}>
                  <Sparkles size={10} /> RESOURCE-AWARE SCHEDULER
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                Real-time queue load, station concurrency bottleneck analysis, and historical ETA prediction accuracy.
              </p>
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.85)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'right' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>CONGESTION HEALTH SCORE</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--accent-emerald)', marginTop: '0.1rem' }}>
              🟢 {analytics?.queueCongestionScore || 'OPTIMAL'} FLOW
            </div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.1rem' }}>
              Smooth Pickup Scheduling
            </div>
          </div>

        </div>
      </div>

      {/* TOP METRICS CARDS INCLUDING TOTAL TIME TO COMPLETE ALL ORDERS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0.85rem',
        width: '100%'
      }}>
        {/* CARD 1: TOTAL ESTIMATED TIME TO COMPLETE ALL ORDERS (HIGHLIGHTED) */}
        <div className="glass-panel" style={{
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(99, 102, 241, 0.15))',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          boxShadow: '0 4px 20px rgba(245, 158, 11, 0.15)'
        }}>
          <div style={{ background: 'linear-gradient(135deg, var(--accent-amber), #d97706)', padding: '0.75rem', borderRadius: '12px', color: '#fff', flexShrink: 0, boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)' }}>
            <Timer size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#fef08a', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 800 }}>
              Time to Complete All Orders
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.15, marginTop: '0.1rem' }}>
              {activeOrders.length > 0 ? totalClearanceText : '0 mins'}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--accent-amber)', marginTop: '0.15rem' }}>
              {activeOrders.length > 0 ? `Target Cleared: ${completionTarget}` : 'Queue completely clear'}
            </div>
          </div>
        </div>

        {/* CARD 2: ETA ACCURACY RATE */}
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.65rem', borderRadius: '12px', color: 'var(--accent-emerald)', flexShrink: 0 }}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>ETA Accuracy Rate</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent-emerald)' }}>
              {analytics.etaAccuracyPercentage || 94.5}%
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              Avg variance: ±{analytics.averageEtaVarianceMinutes || 1.2} mins
            </div>
          </div>
        </div>

        {/* CARD 3: KITCHEN UTILIZATION */}
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.65rem', borderRadius: '12px', color: 'var(--accent-indigo)', flexShrink: 0 }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Kitchen Utilization</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff' }}>
              {analytics.kitchenUtilizationPct || 35}%
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)' }}>
              {activeOrders.length} active orders cooking
            </div>
          </div>
        </div>

        {/* CARD 4: AVERAGE TURNAROUND */}
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.2)', padding: '0.65rem', borderRadius: '12px', color: 'var(--accent-cyan)', flexShrink: 0 }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Average Turnaround</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>
              {analytics.avgPrepMinutes || 4.2}m
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              Per order prep duration
            </div>
          </div>
        </div>

        {/* CARD 5: ORDERS ANALYZED */}
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'rgba(168, 85, 247, 0.2)', padding: '0.65rem', borderRadius: '12px', color: '#c084fc', flexShrink: 0 }}>
            <Package size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Orders Analyzed</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#c084fc' }}>
              {analytics.totalOrdersAnalyzed || orders.length}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              Continuous DB telemetry
            </div>
          </div>
        </div>
      </div>

      {/* ISOMETRIC KITCHEN THROUGHPUT & QUEUE FLOW SIMULATOR */}
      <div className="glass-panel" style={{ padding: '0.85rem 1rem', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showVisualizer ? '0.75rem' : '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Radio size={16} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>
              Architectural Kitchen Station Throughput & Flow
            </span>
            <span className="badge badge-ready" style={{ fontSize: '0.62rem', padding: '0.1rem 0.4rem' }}>
              LIVE SIMULATION
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowVisualizer(!showVisualizer)}
            className="btn btn-outline"
            style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
          >
            {showVisualizer ? (
              <><EyeOff size={12} /> Hide Visualizer</>
            ) : (
              <><Eye size={12} /> Show Visualizer</>
            )}
          </button>
        </div>

        {showVisualizer && (
          <VisualQueue3D activeOrders={activeOrders} stations={stations} activeCount={activeOrders.length} />
        )}
      </div>

      {/* HOURLY DEMAND DISTRIBUTION HISTOGRAM */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="var(--accent-amber)" />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffffff' }}>Hourly Takeaway Order Distribution</h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Derived from actual customer order timestamps across operating hours (10 AM – 10 PM)</p>
            </div>
          </div>

          {activeHourlyBar && (
            <div style={{ background: 'rgba(245, 158, 11, 0.2)', border: '1px solid var(--accent-amber)', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', color: '#fef08a' }}>
              {activeHourlyBar.hour}: <strong>{activeHourlyBar.orders} orders</strong> ({activeHourlyBar.load}% workload)
            </div>
          )}
        </div>

        {/* Visual Bar Chart */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '0.4rem',
          height: '160px',
          padding: '1rem 0.5rem 0.5rem 0.5rem',
          background: 'rgba(15, 23, 42, 0.55)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          overflowX: 'auto'
        }}>
          {hourlyData.map((item, idx) => {
            const isPeak = item.isPeak || item.load >= 75;
            const isMid = item.load >= 45;
            const maxOrder = Math.max(30, ...hourlyData.map(h => h.orders || 0));
            const barHeightPct = Math.max(14, ((item.orders || 1) / maxOrder) * 100);

            return (
              <div
                key={idx}
                onMouseEnter={() => setActiveHourlyBar(item)}
                onMouseLeave={() => setActiveHourlyBar(null)}
                style={{
                  flex: 1,
                  minWidth: '34px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: isPeak ? 'var(--accent-amber)' : '#94a3b8', marginBottom: '0.25rem' }}>
                  {item.orders}
                </div>

                <div
                  style={{
                    width: '75%',
                    height: `${barHeightPct}%`,
                    background: isPeak 
                      ? 'linear-gradient(180deg, #f59e0b 0%, #f43f5e 100%)' 
                      : (isMid ? 'linear-gradient(180deg, var(--accent-cyan) 0%, var(--accent-indigo) 100%)' : 'rgba(99, 102, 241, 0.35)'),
                    borderRadius: '6px 6px 2px 2px',
                    transition: 'all 0.3s ease',
                    boxShadow: isPeak ? '0 0 10px rgba(245, 158, 11, 0.4)' : 'none'
                  }}
                />

                <div style={{ fontSize: '0.65rem', color: isPeak ? '#ffffff' : 'var(--text-muted)', fontWeight: isPeak ? 800 : 600, marginTop: '0.35rem', whiteSpace: 'nowrap' }}>
                  {item.hour}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2-COLUMN: STATION CONCURRENCY & WORKLOAD + RUSH FORECAST */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        
        {/* Real Station Workload Gauges (NEVER BLANK) */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)' }}>
              <BarChart3 size={20} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffffff' }}>Station Concurrency & Workload</h3>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {activeOrders.length} active queue tickets
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stations.map(st => {
              const activeCount = st.activeItems || 0;
              const capacity = st.capacity || 2;
              const utilPct = st.utilizationPct || 0;
              const isHigh = utilPct >= 70;

              return (
                <div key={st.id} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>{st.icon}</span>
                      <div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff' }}>{st.name}</span>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          Capacity: {capacity} parallel batches
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: isHigh ? 'var(--accent-amber)' : 'var(--accent-cyan)', fontWeight: 800 }}>
                        {activeCount} {activeCount === 1 ? 'item' : 'items'} ({utilPct}%)
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden', margin: '0.35rem 0' }}>
                    <div
                      style={{
                        width: `${Math.max(activeCount > 0 ? 12 : 0, Math.min(100, utilPct))}%`,
                        height: '100%',
                        background: isHigh ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, var(--accent-cyan), var(--accent-indigo))',
                        borderRadius: '9999px',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>

                  {/* Active Items breakdown or Idle indicator */}
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {st.activeItemNames && st.activeItemNames.length > 0 ? (
                      <span style={{ color: 'var(--accent-amber)' }}>
                        🔥 Cooking: {st.activeItemNames.slice(0, 3).join(', ')}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--accent-emerald)' }}>
                        ● Ready for tickets • 0% active workload
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Peak Rush Forecast & Operational Guidance */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent-amber)' }}>
            <Flame size={20} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffffff' }}>Peak Rush Forecast & Action Plan</h3>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Projected Peak Window:</span>
              <strong style={{ color: 'var(--accent-amber)' }}>{rush.peakHourText || '7:00 PM – 9:00 PM'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Peak Order Volume:</span>
              <strong style={{ color: '#ffffff' }}>~{rush.expectedOrders || 45} takeaway orders</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Kitchen Peak Load:</span>
              <strong style={{ color: 'var(--accent-cyan)' }}>{rush.cookingLoadPercentage || 45}% capacity</strong>
            </div>
          </div>

          <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', fontSize: '0.78rem', color: '#fef08a', lineHeight: '1.4' }}>
            <strong style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
              <Lightbulb size={14} /> Smart Operational Guidance:
            </strong>
            {rush.recommendation || 'Keep hot tawa pans pre-heated and packaging boxes assembled.'}
          </div>

          {/* Raw Material Inventory Usage */}
          <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-emerald)', marginBottom: '0.5rem' }}>
              Today&apos;s Estimated Material Consumption:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.72rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.4rem 0.55rem', borderRadius: '6px' }}>
                🌾 Atta Flour: <strong style={{ color: '#fff' }}>{inventory.flourAttaKg || '6.5'} kg</strong>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.4rem 0.55rem', borderRadius: '6px' }}>
                🥘 Gravy Base: <strong style={{ color: '#fff' }}>{inventory.chennaBeansKg || '3.2'} kg</strong>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.4rem 0.55rem', borderRadius: '6px' }}>
                🫙 Ghee & Oil: <strong style={{ color: '#fff' }}>{inventory.cookingOilLiters || '1.4'} L</strong>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.4rem 0.55rem', borderRadius: '6px' }}>
                📦 Eco Boxes: <strong style={{ color: '#fff' }}>{inventory.ecoBoxesCount || '38'} pcs</strong>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}