import React from 'react';

/* ─────────────────────────────────────────────────
   Per-card visual configuration
   accent  → left strip + icon ring color
   tint    → card background
   iconBg  → icon container fill
   iconColor → icon stroke/fill
   topBadge → corner label (optional)
   treatment → layout variant
───────────────────────────────────────────────── */
const CARD_CFG = {
  /* ── SYSTEM ── calm green */
  'Server Status': {
    accent: '#6B9E6F', tint: '#F4FAF4', iconBg: '#DCF0DD', iconColor: '#2D5E33',
    topBadge: 'sys', badgeColor: '#6B9E6F', treatment: 'status',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
  },
  'Redis Status': {
    accent: '#5B8BA4', tint: '#F4F8FC', iconBg: '#D3E9F5', iconColor: '#1E4F6B',
    topBadge: '6379', badgeColor: '#5B8BA4', treatment: 'status',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
        <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
      </svg>
    ),
  },
  'MongoDB Status': {
    accent: '#D4834A', tint: '#FDF8F4', iconBg: '#F7E4D3', iconColor: '#7A3A10',
    topBadge: '27017', badgeColor: '#D4834A', treatment: 'status',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C8 2 5 5.5 5 9.5c0 5.25 7 12.5 7 12.5s7-7.25 7-12.5C19 5.5 16 2 12 2z"/>
        <path d="M12 2v19.5"/>
      </svg>
    ),
  },
  'Uptime': {
    accent: '#C4962A', tint: '#FDFAF3', iconBg: '#F5E9B0', iconColor: '#6B5000',
    treatment: 'number',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  'Current Algorithm': {
    accent: '#C4962A', tint: '#FDFAF3', iconBg: '#F5E9B0', iconColor: '#6B5000',
    topBadge: 'policy', badgeColor: '#C4962A', treatment: 'text-sm',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      </svg>
    ),
  },

  /* ── TRAFFIC ── warm orange */
  'Total Requests': {
    accent: '#D4834A', tint: '#FDF8F4', iconBg: '#F7E4D3', iconColor: '#7A3A10',
    treatment: 'number',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
      </svg>
    ),
  },
  'Allowed Requests': {
    accent: '#6B9E6F', tint: '#F4FAF4', iconBg: '#DCF0DD', iconColor: '#2D5E33',
    treatment: 'number',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
      </svg>
    ),
  },
  'Blocked Requests': {
    accent: '#C47070', tint: '#FDF5F5', iconBg: '#F5D8D8', iconColor: '#7A2020',
    treatment: 'number',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
      </svg>
    ),
  },
  'Authenticated Requests': {
    accent: '#6B9E6F', tint: '#F4FAF4', iconBg: '#DCF0DD', iconColor: '#2D5E33',
    treatment: 'number',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>
      </svg>
    ),
  },
  'Anonymous Requests': {
    accent: '#C47070', tint: '#FDF5F5', iconBg: '#F5D8D8', iconColor: '#7A2020',
    treatment: 'number',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/>
      </svg>
    ),
  },
};

const FALLBACK_CFG = {
  accent: '#C8C3BB', tint: '#F7F4F0',
  iconBg: '#EDE8E2', iconColor: '#8C8680',
  treatment: 'number',
  icon: <span style={{ fontSize: 10 }}>·</span>,
};

export default function StatCard({ title, value, type, suffix }) {
  const cfg = CARD_CFG[title] || FALLBACK_CFG;
  const isStatus  = type === 'status';
  const isUp      = value === 'UP' || value === 'Active';
  const isLoading = value === '···';

  return (
    <div
      className="card-hover animate-slide-up relative overflow-hidden cursor-default select-none"
      style={{
        backgroundColor: cfg.tint,
        border: '1.5px solid #E8E3DA',
        borderRadius: 14,
        borderLeft: `3px solid ${cfg.accent}`,
      }}
    >
      {/* Decorative background circle — very subtle */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 60, height: 60,
          bottom: -16, right: -12,
          backgroundColor: cfg.accent,
          opacity: 0.06,
        }}
      />
      {/* Tiny decorative dot cluster — top right corner */}
      <div
        className="absolute pointer-events-none"
        style={{ top: 10, right: 10, display: 'flex', gap: 3 }}
      >
        <span className="rounded-full" style={{ width: 3, height: 3, backgroundColor: cfg.accent, opacity: 0.25, display: 'block' }} />
        <span className="rounded-full" style={{ width: 3, height: 3, backgroundColor: cfg.accent, opacity: 0.15, display: 'block' }} />
      </div>

      {/* Card body */}
      <div style={{ padding: '14px 14px 13px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Top row — icon + badge */}
        <div className="flex items-start justify-between gap-2">
          {/* Icon container */}
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 34, height: 34,
              borderRadius: 10,
              backgroundColor: cfg.iconBg,
              color: cfg.iconColor,
            }}
          >
            {cfg.icon}
          </div>

          {/* Corner badge */}
          {cfg.topBadge ? (
            <span
              className="flex-shrink-0"
              style={{
                fontSize: 8, fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                backgroundColor: cfg.iconBg, color: cfg.iconColor,
                borderRadius: 4, padding: '2px 6px', lineHeight: 1.6,
              }}
            >
              {cfg.topBadge}
            </span>
          ) : suffix ? (
            <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C8C3BB', lineHeight: 1.6, paddingTop: 2 }}>
              {suffix}
            </span>
          ) : null}
        </div>

        {/* Title + description */}
        <div>
          <h3 style={{ fontSize: 11, fontWeight: 800, color: '#1A1714', lineHeight: 1.2 }}>{title}</h3>
        </div>

        {/* Value area */}
        <div className="flex items-end justify-between" style={{ marginTop: 'auto', paddingTop: 2 }}>
          {isLoading ? (
            <span style={{ fontSize: 18, fontWeight: 900, color: '#C8C3BB' }}>···</span>
          ) : isStatus ? (
            <div className="flex items-center gap-1.5">
              <span
                className={isUp ? 'animate-pulse' : ''}
                style={{
                  width: 8, height: 8, borderRadius: '50%', display: 'block',
                  backgroundColor: isUp ? cfg.accent : '#C47070',
                }}
              />
              <span
                style={{
                  fontSize: 15, fontWeight: 900, letterSpacing: '-0.02em',
                  color: isUp ? cfg.iconColor : '#7A2020',
                }}
              >
                {value}
              </span>
            </div>
          ) : cfg.treatment === 'text-sm' ? (
            <span style={{ fontSize: 13, fontWeight: 900, color: '#1A1714', letterSpacing: '-0.02em', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {value}
            </span>
          ) : (
            <span style={{ fontSize: 22, fontWeight: 900, color: '#1A1714', letterSpacing: '-0.04em', lineHeight: 1 }}>
              {value}
            </span>
          )}

          {/* Accent circle mark */}
          <div
            className="flex-shrink-0 rounded-full"
            style={{ width: 18, height: 18, backgroundColor: cfg.accent, opacity: 0.18 }}
          />
        </div>

      </div>
    </div>
  );
}
