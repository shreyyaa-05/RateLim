import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import ChartPlaceholder from '../components/ChartPlaceholder';
import TablePlaceholder from '../components/TablePlaceholder';
import { getDashboardStats } from '../services/api';

export default function Dashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  const fetchStats = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const data = await getDashboardStats();
      setStats(data);
      setError(false);
    } catch (err) {
      console.error('[Dashboard]', err.message);
      setError(true);
      setStats(null);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(true);
    const id = setInterval(() => fetchStats(false), 5000);
    return () => clearInterval(id);
  }, []);

  const v = (field, isNum = false, fmt = null) => {
    if (loading) return '···';
    if (error || !stats || stats[field] == null) return '--';
    if (fmt)   return fmt(stats[field]);
    if (isNum) return typeof stats[field] === 'number' ? stats[field].toLocaleString() : stats[field];
    return stats[field];
  };

  const t = (originalType) => (loading ? 'text' : originalType);

  const systemCards = [
    { title: 'Server Status',     value: v('server'),    type: t('status'), suffix: 'Node.js' },
    { title: 'Redis Status',      value: v('redis'),     type: t('status'), suffix: ':6379' },
    { title: 'MongoDB Status',    value: v('mongodb'),   type: t('status'), suffix: ':27017' },
    { title: 'Uptime',            value: v('uptime', false, (val) => `${Math.floor(val)}s`), type: t('text'), suffix: 'running' },
    { title: 'Current Algorithm', value: v('algorithm'), type: t('text'),   suffix: 'active' },
  ];

  const trafficCards = [
    { title: 'Total Requests',         value: v('totalRequests', true),         type: t('text'), suffix: 'all time' },
    { title: 'Allowed Requests',       value: v('allowedRequests', true),       type: t('text'), suffix: '2xx/3xx' },
    { title: 'Blocked Requests',       value: v('blockedRequests', true),       type: t('text'), suffix: 'HTTP 429' },
    { title: 'Authenticated Requests', value: v('authenticatedRequests', true), type: t('text'), suffix: 'JWT' },
    { title: 'Anonymous Requests',     value: v('anonymousRequests', true),     type: t('text'), suffix: 'by IP' },
  ];

  return (
    <div className="flex-1 overflow-y-auto dot-grid" style={{ minHeight: 'calc(100vh - 56px)' }}>
      <div style={{ maxWidth: 1580, margin: '0 auto', padding: '28px 24px 40px', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* ══════════════════════════════════════════════════
            HERO — editorial magazine header
        ══════════════════════════════════════════════════ */}
        <section
          className="animate-slide-up relative overflow-hidden"
          style={{
            backgroundColor: '#FDFCF9',
            border: '1.5px solid #E8E3DA',
            borderRadius: 18,
            padding: '32px 36px',
          }}
        >
          {/* Large decorative circle — way behind everything */}
          <div
            className="absolute pointer-events-none rounded-full"
            style={{
              width: 360, height: 360,
              top: -120, right: -80,
              border: '1.5px solid #6B9E6F',
              opacity: 0.07,
            }}
          />
          {/* Medium circle  */}
          <div
            className="absolute pointer-events-none rounded-full"
            style={{
              width: 220, height: 220,
              top: -60, right: 30,
              backgroundColor: '#D4834A',
              opacity: 0.05,
            }}
          />
          {/* Small filled mustard circle */}
          <div
            className="absolute pointer-events-none rounded-full float-anim"
            style={{
              width: 14, height: 14,
              top: 28, right: 220,
              backgroundColor: '#C4962A',
              opacity: 0.5,
            }}
          />
          {/* Tiny coral dot */}
          <div
            className="absolute pointer-events-none rounded-full float-anim-2"
            style={{
              width: 8, height: 8,
              top: 55, right: 190,
              backgroundColor: '#C47070',
              opacity: 0.45,
            }}
          />

          <div className="flex flex-col xl:flex-row xl:items-center gap-8">
            {/* ── Left: editorial heading ── */}
            <div className="flex-1">
              {/* Overline tape label */}
              <div className="tape-label inline-flex mb-5" style={{ color: '#A8A29E' }}>
                <span className="rounded-full" style={{ width: 5, height: 5, backgroundColor: '#6B9E6F', display: 'block', flexShrink: 0 }} />
                Overview · Dashboard
              </div>

              {/* Main headline — large editorial type */}
              <h1 style={{
                fontSize: 'clamp(28px, 4vw, 44px)',
                fontWeight: 900,
                color: '#1A1714',
                letterSpacing: '-0.04em',
                lineHeight: 1.0,
                marginBottom: 6,
              }}>
                Shreyya's{' '}
                <span style={{
                  fontFamily: 'Lora, Georgia, serif',
                  fontStyle: 'italic',
                  fontWeight: 600,
                  color: '#6B9E6F',
                  letterSpacing: '-0.02em',
                }}>
                  API
                </span>
              </h1>
              <h1 style={{
                fontSize: 'clamp(28px, 4vw, 44px)',
                fontWeight: 900,
                color: '#1A1714',
                letterSpacing: '-0.04em',
                lineHeight: 1.0,
                marginBottom: 16,
              }}>
                Workspace
              </h1>

              <p style={{ fontSize: 12, color: '#6B6560', maxWidth: 380, lineHeight: 1.65, marginBottom: 20 }}>
                {error
                  ? 'Backend connection lost — check your server is running.'
                  : 'Live rate limiter control panel. Traffic, algorithms, and system health — all in one place.'}
              </p>

              {/* Status pill */}
              <div
                className="flex items-center gap-2 inline-flex"
                style={{
                  borderRadius: 99,
                  padding: '6px 14px',
                  fontSize: 10, fontWeight: 700,
                  border: '1.5px solid',
                  ...(error
                    ? { backgroundColor: '#FBE9E9', borderColor: '#E8B8B8', color: '#7A2020' }
                    : { backgroundColor: '#EBF5EC', borderColor: '#C0DCC2', color: '#2D5E33' }
                  ),
                }}
              >
                <span
                  className={error ? '' : 'animate-pulse'}
                  style={{
                    width: 6, height: 6, borderRadius: '50%', display: 'block',
                    backgroundColor: error ? '#C47070' : '#6B9E6F',
                  }}
                />
                {error ? 'offline · check backend' : 'live · auto-refreshes every 5 s'}
              </div>
            </div>

            {/* ── Right: decorative stat panel ── */}
            <div
              className="relative xl:w-72 flex-shrink-0"
              style={{
                backgroundColor: '#F7F3EE',
                borderRadius: 14,
                border: '1.5px solid #E8E3DA',
                padding: '20px 20px 16px',
                minHeight: 160,
              }}
            >
              {/* Decorative dashed circle inside panel */}
              <div
                className="absolute pointer-events-none rounded-full spin-slow"
                style={{
                  width: 120, height: 120,
                  bottom: -30, right: -30,
                  border: '1.5px dashed #D4CFC7',
                  opacity: 0.5,
                }}
              />
              {/* Small filled circles */}
              <div className="absolute pointer-events-none rounded-full" style={{ width: 22, height: 22, top: 14, right: 14, backgroundColor: '#D4834A', opacity: 0.12 }} />
              <div className="absolute pointer-events-none rounded-full" style={{ width: 10, height: 10, top: 22, right: 22, border: '1.5px solid #D4834A', opacity: 0.25 }} />

              {/* Panel overline */}
              <p style={{ fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#C8C3BB', marginBottom: 14 }}>
                at a glance
              </p>

              {/* Two floating stat chips */}
              <div className="flex flex-col gap-3">
                <StatChip
                  label="Algorithm"
                  value={loading ? '···' : (stats?.algorithm || '--')}
                  color="#C4962A"
                />
                <StatChip
                  label="Uptime"
                  value={loading ? '···' : (stats?.uptime != null ? `${Math.floor(stats.uptime)}s` : '--')}
                  color="#6B9E6F"
                />
                <StatChip
                  label="Total Requests"
                  value={loading ? '···' : (stats?.totalRequests != null ? stats.totalRequests.toLocaleString() : '--')}
                  color="#5B8BA4"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Error banner */}
        {error && (
          <div
            className="flex items-center gap-3 animate-slide-up"
            style={{
              backgroundColor: '#FBE9E9',
              border: '1.5px solid #E8B8B8',
              borderRadius: 10, padding: '10px 14px',
              fontSize: 11, color: '#7A2020', fontWeight: 600,
            }}
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#C47070' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Backend unreachable — retrying automatically every 5 s.
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            SYSTEM CARDS — calm green identity
        ══════════════════════════════════════════════════ */}
        <section className="animate-slide-up delay-100">
          <SectionLabel label="System" note="infrastructure health" dotColor="#6B9E6F" />

          {/* Asymmetric grid: 3 cards + 2 cards, last row offset */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}
            className="sm:grid-cols-3 lg:grid-cols-5"
          >
            {/* Use custom grid for editorial layout */}
          </div>

          {/* Desktop: intentional asymmetry via explicit grid spans */}
          <div className="hidden lg:grid" style={{
            gridTemplateColumns: '1.1fr 1fr 1fr 1fr 1.2fr',
            gap: 10,
          }}>
            {systemCards.map((card, i) => (
              <div key={card.title} className={`animate-slide-up delay-${(i + 1) * 50}`}>
                <StatCard {...card} />
              </div>
            ))}
          </div>
          {/* Mobile fallback */}
          <div className="grid lg:hidden" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {systemCards.map((card) => (
              <div key={card.title}>
                <StatCard {...card} />
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            TRAFFIC CARDS — warm orange identity
        ══════════════════════════════════════════════════ */}
        <section className="animate-slide-up delay-200">
          <SectionLabel label="Traffic" note="request volume breakdown" dotColor="#D4834A" />

          {/* Desktop: slightly asymmetric — total is wider */}
          <div className="hidden lg:grid" style={{
            gridTemplateColumns: '1.3fr 1fr 1fr 1fr 1fr',
            gap: 10,
          }}>
            {trafficCards.map((card, i) => (
              <div key={card.title} className={`animate-slide-up delay-${(i + 2) * 50}`}>
                <StatCard {...card} />
              </div>
            ))}
          </div>
          {/* Mobile fallback */}
          <div className="grid lg:hidden" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {trafficCards.map((card) => (
              <div key={card.title}>
                <StatCard {...card} />
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            LIVE ACTIVITY — chart + table
        ══════════════════════════════════════════════════ */}
        <section className="animate-slide-up delay-300">
          <SectionLabel label="Live Activity" note="real-time chart and request log" dotColor="#5B8BA4" />
          {/* Chart 2/3, table 1/3 — slightly asymmetric */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 12 }}>
            {/* Mobile: stacked; XL: side by side */}
            <div className="xl:hidden flex flex-col gap-3">
              <ChartPlaceholder />
              <TablePlaceholder />
            </div>
            <div
              className="hidden xl:grid"
              style={{ gridTemplateColumns: '1fr 370px', gap: 12, alignItems: 'start' }}
            >
              <ChartPlaceholder />
              <div style={{ height: 420, display: 'flex', flexDirection: 'column' }}>
                <TablePlaceholder />
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            DECORATIVE FOOTER AREA
        ══════════════════════════════════════════════════ */}
        <footer className="flex items-center justify-between" style={{ paddingTop: 8 }}>
          <p style={{ fontSize: 8, color: '#C8C3BB', fontFamily: 'monospace' }}>
            Shreyya's Workspace · Rate Limiter v1.2
          </p>
          <div className="flex items-center gap-2">
            <span className="rounded-full" style={{ width: 4, height: 4, backgroundColor: '#6B9E6F', display: 'block', opacity: 0.5 }} />
            <span className="rounded-full" style={{ width: 4, height: 4, backgroundColor: '#C4962A', display: 'block', opacity: 0.5 }} />
            <span className="rounded-full" style={{ width: 4, height: 4, backgroundColor: '#5B8BA4', display: 'block', opacity: 0.5 }} />
          </div>
        </footer>

      </div>
    </div>
  );
}

/* ── Section label with dot + line ── */
function SectionLabel({ label, note, dotColor }) {
  return (
    <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
      {/* Tape-style label */}
      <span
        className="tape-label"
        style={{ color: dotColor }}
      >
        <span
          className="rounded-full"
          style={{ width: 5, height: 5, backgroundColor: dotColor, display: 'block', flexShrink: 0 }}
        />
        {label}
      </span>
      {note && (
        <span style={{ fontSize: 10, color: '#C8C3BB' }}>
          {note}
        </span>
      )}
      <div style={{ flex: 1, height: 1, backgroundColor: '#EDEAE4' }} />
      {/* Decorative end mark */}
      <span
        className="rounded-full flex-shrink-0"
        style={{ width: 4, height: 4, backgroundColor: dotColor, opacity: 0.3 }}
      />
    </div>
  );
}

/* ── Floating stat chip in hero panel ── */
function StatChip({ label, value, color }) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        backgroundColor: '#FDFCF9',
        border: '1.5px solid #E8E3DA',
        borderRadius: 9,
        padding: '8px 12px',
        borderLeft: `3px solid ${color}`,
      }}
    >
      <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A8A29E' }}>
        {label}
      </span>
      <span style={{ fontSize: 12, fontWeight: 900, color: '#1A1714', letterSpacing: '-0.02em', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {value}
      </span>
    </div>
  );
}
