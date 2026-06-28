import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { getAnalyticsData } from '../services/api';

/* ─── Custom editorial tooltip ─── */
function EditorialTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      backgroundColor: '#FDFCF9',
      border: '1.5px solid #E8E3DA',
      borderRadius: 10,
      padding: '8px 12px',
      minWidth: 130,
      boxShadow: '0 4px 16px rgba(26,23,20,0.08)',
    }}>
      <p style={{ fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#C8C3BB', marginBottom: 6 }}>
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between" style={{ gap: 16, paddingBottom: 2 }}>
          <span className="flex items-center gap-1.5" style={{ fontSize: 10, color: '#6B6560' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: entry.color, display: 'block', flexShrink: 0 }} />
            {entry.name}
          </span>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#1A1714', fontFamily: 'monospace' }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Legend pill ─── */
function LegendPill({ color, label }) {
  return (
    <span
      className="flex items-center gap-1"
      style={{
        fontSize: 9, fontWeight: 700,
        borderRadius: 99, padding: '3px 8px',
        border: `1.5px solid ${color}40`,
        backgroundColor: `${color}12`,
        color,
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: color, display: 'block' }} />
      {label}
    </span>
  );
}

export default function ChartPlaceholder() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  const fetchAnalytics = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const apiData = await getAnalyticsData();
      setData(apiData);
      setError(false);
    } catch (err) {
      console.error('[ChartPlaceholder]', err.message);
      setError(true);
      setData(null);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(true);
    const id = setInterval(() => fetchAnalytics(false), 5000);
    return () => clearInterval(id);
  }, []);

  const transformedData = React.useMemo(() => {
    if (!data || !data.labels) return [];
    return data.labels.map((label, idx) => ({
      label,
      total:   data.totalRequests[idx]   || 0,
      allowed: data.allowedRequests[idx] || 0,
      blocked: data.blockedRequests[idx] || 0,
    }));
  }, [data]);

  const hasTraffic = React.useMemo(
    () => transformedData.some((p) => p.total > 0),
    [transformedData]
  );

  return (
    <div
      className="animate-slide-up relative overflow-hidden"
      style={{
        backgroundColor: '#FDFCF9',
        borderRadius: 14,
        border: '1.5px solid #E8E3DA',
        /* Orange top accent strip = Traffic identity */
        borderTop: '3px solid #D4834A',
      }}
    >
      {/* Decorative corner dot grid — very faint */}
      <div
        className="pointer-events-none absolute dot-grid-fine"
        style={{
          top: 0, right: 0,
          width: 80, height: 80,
          opacity: 0.35,
          maskImage: 'radial-gradient(ellipse at top right, black 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at top right, black 20%, transparent 75%)',
        }}
      />

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4" style={{ padding: '16px 18px 0' }}>
        <div>
          <p style={{ fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#D4834A', marginBottom: 3 }}>
            analytics · traffic
          </p>
          <h3 style={{ fontSize: 15, fontWeight: 900, color: '#1A1714', letterSpacing: '-0.025em' }}>
            Traffic Over Time
          </h3>
          <p style={{ fontSize: 10, color: '#A8A29E', marginTop: 2 }}>
            Request throughput — 5 s refresh
          </p>
        </div>

        {/* Floating legend pills */}
        {!loading && !error && hasTraffic && (
          <div className="flex flex-wrap gap-1.5 justify-end" style={{ paddingTop: 2 }}>
            <LegendPill color="#5B8BA4" label="Total" />
            <LegendPill color="#6B9E6F" label="Allowed" />
            <LegendPill color="#C47070" label="Blocked" />
          </div>
        )}
      </div>

      {/* Thin separator */}
      <div style={{ margin: '12px 18px 0', height: 1, backgroundColor: '#EDEAE4' }} />

      {/* ── Chart area ── */}
      <div className="relative" style={{ padding: '12px 6px 8px', height: 210 }}>
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span style={{ fontSize: 11, color: '#C8C3BB' }}>Loading chart data…</span>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span style={{ fontSize: 11, color: '#C47070' }}>Unable to load analytics</span>
          </div>
        ) : !hasTraffic ? (
          /* ── Empty state with decorative rings ── */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="relative" style={{ width: 52, height: 52 }}>
              <div className="absolute inset-0 rounded-full" style={{ border: '1.5px solid #E8E3DA' }} />
              <div className="absolute rounded-full" style={{ inset: 8, border: '1px dashed #EDEAE4' }} />
              <div className="absolute rounded-full" style={{ inset: 18, backgroundColor: '#F0EDE8' }} />
              {/* Tiny center dot */}
              <div className="absolute rounded-full" style={{ width: 6, height: 6, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#D4CFC7' }} />
            </div>
            <div className="text-center">
              <p style={{ fontSize: 11, color: '#B0AB9E', fontWeight: 600 }}>No traffic recorded yet</p>
              <p style={{ fontSize: 9, color: '#C8C3BB', marginTop: 2 }}>Send some requests to see data appear</p>
            </div>
          </div>
        ) : (
          /* ── Recharts — unchanged ── */
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={transformedData} margin={{ top: 4, right: 14, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#EDEAE4" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 8, fill: '#B0AB9E', fontFamily: 'Outfit, sans-serif' }}
                axisLine={false}
                tickLine={false}
                interval={9}
              />
              <YAxis
                tick={{ fontSize: 8, fill: '#B0AB9E', fontFamily: 'Outfit, sans-serif' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<EditorialTooltip />} cursor={{ stroke: '#EDEAE4', strokeWidth: 1 }} />
              <Line type="monotone" dataKey="total"   stroke="#5B8BA4" strokeWidth={2}   dot={false} activeDot={{ r: 3, strokeWidth: 2, stroke: '#FDFCF9' }} />
              <Line type="monotone" dataKey="allowed" stroke="#6B9E6F" strokeWidth={2}   dot={false} activeDot={{ r: 3, strokeWidth: 2, stroke: '#FDFCF9' }} />
              <Line type="monotone" dataKey="blocked" stroke="#C47070" strokeWidth={1.5} strokeDasharray="3 3" dot={false} activeDot={{ r: 3, strokeWidth: 2, stroke: '#FDFCF9' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Footer annotation strip ── */}
      <div
        className="flex items-center justify-between"
        style={{
          padding: '8px 18px 12px',
          borderTop: '1px solid #EDEAE4',
          marginTop: 0,
        }}
      >
        <p style={{ fontSize: 8, color: '#C8C3BB', fontFamily: 'monospace' }}>
          window · last 60 min
        </p>
        <div className="flex items-center gap-1.5">
          <span className="rounded-full animate-pulse" style={{ width: 5, height: 5, backgroundColor: '#6B9E6F', display: 'block' }} />
          <p style={{ fontSize: 8, color: '#C8C3BB', fontFamily: 'monospace' }}>live</p>
        </div>
      </div>
    </div>
  );
}
