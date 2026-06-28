import React from 'react';

const NAV = [
  {
    name: 'Dashboard', clickable: true, category: 'core',
    accent: '#6B9E6F', accentBg: '#EAF4EB',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
  },
  {
    name: 'Algorithms', clickable: true, category: 'core',
    accent: '#C4962A', accentBg: '#FAF2DC',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      </svg>
    ),
  },
  {
    name: 'Analytics', clickable: false, category: 'data',
    accent: '#5B8BA4', accentBg: '#E3EEF5',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    name: 'Users', clickable: false, category: 'data',
    accent: '#5B8BA4', accentBg: '#E3EEF5',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    name: 'Settings', clickable: false, category: 'data',
    accent: '#5B8BA4', accentBg: '#E3EEF5',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ),
  },
];

export default function Sidebar({ currentPage, setCurrentPage }) {
  const handleClick = (name) => {
    if (name === 'Dashboard' || name === 'Algorithms') setCurrentPage(name.toLowerCase());
  };

  const core = NAV.filter(n => n.category === 'core');
  const data = NAV.filter(n => n.category === 'data');

  return (
    <aside
      className="hidden md:flex flex-col overflow-hidden"
      style={{
        height: 'calc(100vh - 56px)',
        width: 200,
        backgroundColor: '#FDFCF9',
        borderRight: '1.5px solid #E8E3DA',
      }}
    >
      <div className="flex-1 overflow-y-auto" style={{ padding: '16px 10px 12px' }}>
        <NavSection label="Core" items={core} currentPage={currentPage} onClick={handleClick} />

        {/* Decorative separator */}
        <div className="relative my-4" style={{ height: 1 }}>
          <div style={{ height: 1, backgroundColor: '#EDEAE4' }} />
          {/* Center diamond mark */}
          <div
            className="absolute"
            style={{
              width: 5, height: 5,
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%) rotate(45deg)',
              backgroundColor: '#D4CFC7',
            }}
          />
        </div>

        <NavSection label="Data" items={data} currentPage={currentPage} onClick={handleClick} />
      </div>

      {/* Bottom signature */}
      <div
        className="relative overflow-hidden"
        style={{ padding: '12px 14px 14px', borderTop: '1.5px solid #EDEAE4' }}
      >
        {/* Decorative background circle */}
        <div
          className="absolute rounded-full"
          style={{
            width: 64, height: 64,
            right: -16, bottom: -16,
            backgroundColor: '#6B9E6F',
            opacity: 0.06,
          }}
        />
        {/* Tiny dots */}
        <div
          className="absolute rounded-full"
          style={{ width: 5, height: 5, top: 10, right: 14, backgroundColor: '#C4962A', opacity: 0.4 }}
        />
        <div
          className="absolute rounded-full"
          style={{ width: 3, height: 3, top: 18, right: 22, backgroundColor: '#5B8BA4', opacity: 0.3 }}
        />

        <div className="flex items-center gap-1.5 mb-2">
          <span className="rounded-full" style={{ width: 5, height: 5, backgroundColor: '#6B9E6F', display: 'block', opacity: 0.9 }} />
          <span className="rounded-full" style={{ width: 5, height: 5, backgroundColor: '#C4962A', display: 'block', opacity: 0.9 }} />
          <span className="rounded-full" style={{ width: 5, height: 5, backgroundColor: '#5B8BA4', display: 'block', opacity: 0.9 }} />
          <span style={{ fontSize: 8, color: '#C4BFB6', fontFamily: 'monospace', marginLeft: 4 }}>online</span>
        </div>
        <p style={{ fontSize: 10, fontWeight: 900, color: '#6B6560', letterSpacing: '-0.02em' }}>shreyya's workspace</p>
        <p style={{ fontSize: 8, color: '#C4BFB6', marginTop: 2, fontFamily: 'monospace' }}>v1.2.0 · rate limiter</p>
      </div>
    </aside>
  );
}

function NavSection({ label, items, currentPage, onClick }) {
  return (
    <div>
      {/* Tape-style section label */}
      <div className="flex items-center gap-2 px-2 mb-2">
        <p style={{ fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#C4BFB6' }}>
          {label}
        </p>
        <div className="flex-1" style={{ height: 1, backgroundColor: '#EDEAE4' }} />
      </div>

      <nav className="flex flex-col" style={{ gap: 2 }}>
        {items.map((item) => {
          const isActive = item.name.toLowerCase() === currentPage;
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => onClick(item.name)}
              disabled={!item.clickable}
              className="group flex w-full items-center gap-2.5 relative overflow-hidden"
              style={{
                borderRadius: 8,
                padding: '7px 10px',
                fontSize: 11,
                fontWeight: isActive ? 700 : 600,
                color: isActive
                  ? item.accent
                  : item.clickable
                    ? '#6B6560'
                    : '#C4BFB6',
                backgroundColor: isActive ? item.accentBg : 'transparent',
                cursor: item.clickable ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s ease',
                border: 'none',
                textAlign: 'left',
              }}
              onMouseEnter={e => {
                if (!isActive && item.clickable) {
                  e.currentTarget.style.backgroundColor = '#F0EDE8';
                  e.currentTarget.style.color = '#1A1714';
                }
              }}
              onMouseLeave={e => {
                if (!isActive && item.clickable) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#6B6560';
                }
              }}
            >
              {/* Active bar */}
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 5,
                  bottom: 5,
                  width: 3,
                  borderRadius: '0 3px 3px 0',
                  backgroundColor: isActive ? item.accent : 'transparent',
                  transition: 'background-color 0.15s ease',
                }}
              />

              {/* Icon container */}
              <span
                className="flex items-center justify-center rounded-md flex-shrink-0"
                style={{
                  width: 24, height: 24,
                  backgroundColor: isActive ? `${item.accent}22` : 'transparent',
                  color: isActive ? item.accent : item.clickable ? '#B0AB9E' : '#D4CFC7',
                  transition: 'all 0.15s ease',
                }}
              >
                {item.icon}
              </span>

              <span className="flex-1 text-left">{item.name}</span>

              {!item.clickable && (
                <span
                  className="flex-shrink-0"
                  style={{
                    fontSize: 7, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
                    backgroundColor: '#F0EDE8', color: '#C4BFB6',
                    borderRadius: 3, padding: '2px 4px',
                    border: '1px solid #E8E3DA',
                  }}
                >
                  soon
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
