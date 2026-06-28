import React, { useState, useEffect } from 'react';

export default function Navbar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 5000);
    return () => clearInterval(id);
  }, []);

  const hh = time.getHours().toString().padStart(2, '0');
  const mm = time.getMinutes().toString().padStart(2, '0');

  return (
    <header className="sticky top-0 z-50 h-14 w-full flex items-center justify-between px-5"
      style={{ backgroundColor: '#FDFCF9', borderBottom: '1.5px solid #E8E3DA' }}>

      {/* ── Brand ── */}
      <div className="flex items-center gap-3">
        {/* Geometric brand mark */}
        <div className="relative w-8 h-8 flex-shrink-0">
          {/* Diamond outline */}
          <div
            className="absolute inset-0.5 border-2"
            style={{
              borderColor: '#6B9E6F',
              transform: 'rotate(45deg)',
              borderRadius: '3px',
            }}
          />
          {/* Center dot */}
          <div
            className="absolute rounded-full"
            style={{
              width: 6, height: 6,
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#C4962A',
            }}
          />
        </div>

        <div>
          <p className="leading-none" style={{ fontSize: 12, fontWeight: 900, color: '#1A1714', letterSpacing: '-0.03em' }}>
            ratelim&nbsp;
            <span style={{ fontFamily: 'Lora, Georgia, serif', fontStyle: 'italic', fontWeight: 600, color: '#6B9E6F', letterSpacing: '0' }}>
              studio
            </span>
          </p>
          <p className="leading-none mt-0.5" style={{ fontSize: 9, color: '#A8A29E', fontFamily: 'monospace', letterSpacing: '0.06em' }}>
            api · traffic · control
          </p>
        </div>
      </div>

      {/* ── Center meta strip ── */}
      <div className="hidden md:flex items-center" style={{ gap: 0 }}>
        <MetaPill label="env" value="development" dotColor="#C4962A" />
        <Divider />
        <MetaPill label="refresh" value="5 s" dotColor="#6B9E6F" pulse />
        <Divider />
        <MetaPill label="updated" value={`${hh}:${mm}`} mono />
      </div>

      {/* ── Right user chip ── */}
      <div className="flex items-center gap-2.5">
        <div className="hidden sm:flex flex-col items-end">
          <p className="leading-none" style={{ fontSize: 11, fontWeight: 800, color: '#1A1714' }}>Shreyya</p>
          <p className="leading-none mt-0.5" style={{ fontSize: 9, color: '#A8A29E' }}>admin · workspace</p>
        </div>

        {/* Avatar */}
        <div className="relative">
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 32, height: 32,
              backgroundColor: '#EAF4EB',
              border: '2px solid #6B9E6F',
              fontSize: 12, fontWeight: 900, color: '#2D5E33',
            }}
          >
            S
          </div>
          {/* Online badge */}
          <span
            className="absolute rounded-full border-2"
            style={{
              width: 9, height: 9,
              bottom: -1, right: -1,
              backgroundColor: '#6B9E6F',
              borderColor: '#FDFCF9',
            }}
          />
        </div>
      </div>
    </header>
  );
}

function Divider() {
  return <span style={{ width: 1, height: 14, backgroundColor: '#E8E3DA', display: 'block', margin: '0 2px' }} />;
}

function MetaPill({ label, value, dotColor, mono, pulse }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2" style={{ fontSize: 10 }}>
      {dotColor && (
        <span
          className={pulse ? 'animate-pulse' : ''}
          style={{
            width: 6, height: 6, borderRadius: '50%',
            backgroundColor: dotColor, flexShrink: 0, display: 'block',
          }}
        />
      )}
      <span style={{ color: '#A8A29E', fontWeight: 500 }}>{label}</span>
      <span style={{ color: '#1A1714', fontWeight: 700, fontFamily: mono ? 'monospace' : 'inherit' }}>
        {value}
      </span>
    </div>
  );
}
