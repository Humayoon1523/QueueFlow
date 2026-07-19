import React from 'react';
import { Bot, Sparkles, TrendingUp, Clock, AlertTriangle, Cpu, Flame, BarChart3 } from 'lucide-react';

export default function AiAnalytics({ aiPrediction, metrics, orders }) {
  const predictions = aiPrediction || {
    estimatedWaitMinutes: 8,
    rushHourPrediction: {
      peakStatus: "EVEN_RUSH",
      expectedOrders: 120,
      peakHourText: "6:45 PM",
      recommendation: "High takeaway load anticipated. Prepare Chapathi dough batches.",
      cookingLoadPercentage: 65
    },
    etaRecommendation: {
      estimatedPickupTime: "06:42 PM",
      suggestedArrivalTime: "06:37 PM",
      customerMessage: "Estimated Pickup: 6:42 PM. Please arrive 5 minutes before."
    },
    analytics: {
      avgPrepMinutes: 4.2,
      avgWaitMinutes: 8,
      throughputChapathiPerHr: 180,
      throughputChennaPerHr: 60,
      queueCongestionScore: "OPTIMAL"
    }
  };

  const rush = predictions.rushHourPrediction;
  const analytics = predictions.analytics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* AI ENGINE HERO BANNER */}
      <div className="glass-panel-glow" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(99, 102, 241, 0.15))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #06b6d4, #6366f1)', padding: '0.85rem', borderRadius: '16px', color: '#fff' }}>
              <Cpu size={36} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff' }}>
                  QueueFlow AI Neural Engine
                </h2>
                <span className="badge badge-ready">
                  <Sparkles size={12} /> ML ACTIVE
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                Predictive Wait Times, Peak Hour Traffic Forecasting & Traffic Flow Optimization
              </p>
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '0.75rem 1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)', textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>CONGESTION STATUS</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--accent-emerald)' }}>
              🟢 {analytics?.queueCongestionScore || 'OPTIMAL'} FLOW
            </div>
          </div>

        </div>
      </div>

      {/* AI PREDICTION CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* CARD 1: AI RUSH HOUR FORECAST */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', color: 'var(--accent-amber)' }}>
            <Flame size={24} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>AI Peak Rush Forecast</h3>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>NEXT EXPECTED PEAK</span>
              <span style={{ fontWeight: 800, color: 'var(--accent-amber)', fontSize: '1.1rem' }}>{rush.peakHourText}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PROJECTED ORDERS</span>
              <span style={{ fontWeight: 800, color: '#ffffff', fontSize: '1.1rem' }}>~{rush.expectedOrders} Orders</span>
            </div>

            {/* Kitchen Cooking Load Progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                <span>Cook Throughput Utilization</span>
                <span>{rush.cookingLoadPercentage}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#334155', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: `${rush.cookingLoadPercentage}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #f43f5e)', borderRadius: '9999px' }}></div>
              </div>
            </div>

          </div>

          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', fontSize: '0.8rem', color: '#fef08a' }}>
            <strong>💡 AI Recommendation:</strong> {rush.recommendation}
          </div>
        </div>

        {/* CARD 2: AI WAIT TIME & PICKUP ETA */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', color: 'var(--accent-cyan)' }}>
            <Clock size={24} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>Smart Pickup ETA Engine</h3>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <div style={{ textAlign: 'center', margin: '0.5rem 0' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PREDICTED WAIT TIME</span>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>
                {predictions.estimatedWaitMinutes} MINS
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Estimated Pickup:</span>
              <strong style={{ color: '#ffffff' }}>{predictions.etaRecommendation?.estimatedPickupTime}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Suggested Arrival:</span>
              <strong style={{ color: 'var(--accent-emerald)' }}>{predictions.etaRecommendation?.suggestedArrivalTime}</strong>
            </div>

          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.85rem' }}>
            Prevents vehicle double-parking outside by distributing customer arrival times intelligently.
          </p>
        </div>

        {/* CARD 3: KITCHEN THROUGHPUT ANALYTICS */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', color: 'var(--accent-indigo)' }}>
            <BarChart3 size={24} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>Kitchen Capacity & Metrics</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem 1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Chapathi Throughput</span>
              <strong style={{ fontSize: '1rem', color: '#ffffff' }}>~180 pcs / hr</strong>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem 1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Chenna Gravy Capacity</span>
              <strong style={{ fontSize: '1rem', color: '#ffffff' }}>~60 containers / hr</strong>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem 1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Avg Preparation Time</span>
              <strong style={{ fontSize: '1rem', color: 'var(--accent-emerald)' }}>{analytics?.avgPrepMinutes || 4.2} Mins / order</strong>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
