import React, { useState, useEffect } from 'react';
import { getRequestLogs } from '../services/api';

const METHOD_CFG = {
  GET:    { bg: '#EBF5EC', color: '#2D5E33', border: '#C0DCC2' },
  POST:   { bg: '#E3EEF5', color: '#1E4F6B', border: '#A8CCE0' },
  PUT:    { bg: '#FAF2DC', color: '#6B5000', border: '#DFC980' },
  DELETE: { bg: '#FBE9E9', color: '#7A2020', border: '#E8B8B8' },
  PATCH:  { bg: '#EDE8F5', color: '#4A3070', border: '#C8B8E0' },
};

function getStatusCfg(status) {
  if (status >= 200 && status < 300) return { bg: '#EBF5EC', color: '#2D5E33', border: '#C0DCC2' };
  if (status >= 300 && status < 400) return { bg: '#E3EEF5', color: '#1E4F6B', border: '#A8CCE0' };
  if (status === 429)                return { bg: '#FBE9E9', color: '#7A2020', border: '#E8B8B8' };
  if (status >= 500)                 return { bg: '#FAF2DC', color: '#6B3000', border: '#DFC980' };
  return { bg: '#F0EDE8', color: '#8C8680', border: '#DDD8D0' };
}

export default function TablePlaceholder() {
  const [logs, setLogs]   = useState([]);
  const [error, setError] = useState(false);

  const fetchLogs = async () => {
    try {
      const data = await getRequestLogs();
      setLogs(data || []);
      setError(false);
    } catch (err) {
      console.error('[TablePlaceholder]', err.message);
      setError(true);
      setLogs([]);
    }
  };

  useEffect(() => {
    fetchLogs();
    const id = setInterval(fetchLogs, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="animate-slide-up delay-100 relative overflow-hidden flex flex-col"
      style={{
        backgroundColor: '#FDFCF9',
        borderRadius: 14,
        border: '1.5px solid #E8E3DA',
        /* Blue top strip = Analytics identity */
        borderTop: '3px solid #5B8BA4',
        height: '100%',
      }}
    >
      {/* Decorative corner graphic — abstract stacked lines */}
      <div
        className="pointer-events-none absolute"
        style={{ top: 12, right: 12, opacity: 0.15, display: 'flex', flexDirection: 'column', gap: 3 }}
      >
        <div style={{ width: 18, height: 1.5, backgroundColor: '#5B8BA4', borderRadius: 1 }} />
        <div style={{ width: 12, height: 1.5, backgroundColor: '#5B8BA4', borderRadius: 1 }} />
        <div style={{ width: 8, height: 1.5, backgroundColor: '#5B8BA4', borderRadius: 1 }} />
      </div>

      {/* ── Header ── */}
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #EDEAE4' }}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p style={{ fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#5B8BA4', marginBottom: 3 }}>
              requests · log
            </p>
            <h3 style={{ fontSize: 14, fontWeight: 900, color: '#1A1714', letterSpacing: '-0.025em' }}>
              Recent Requests
            </h3>
            <p style={{ fontSize: 9, color: '#A8A29E', marginTop: 2 }}>
              last 100 calls · 3 s poll
            </p>
          </div>

          {/* Live indicator */}
          <div
            className="flex items-center gap-1.5 flex-shrink-0"
            style={{
              borderRadius: 99,
              padding: '4px 9px',
              fontSize: 9, fontWeight: 700,
              ...(error
                ? { backgroundColor: '#FBE9E9', border: '1.5px solid #E8B8B8', color: '#7A2020' }
                : { backgroundColor: '#EBF5EC', border: '1.5px solid #C0DCC2', color: '#2D5E33' }
              ),
            }}
          >
            <span
              className={error ? '' : 'animate-pulse'}
              style={{
                width: 5, height: 5, borderRadius: '50%',
                backgroundColor: error ? '#C47070' : '#6B9E6F',
                display: 'block',
              }}
            />
            {error ? 'error' : 'live'}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-y-auto">
        {error || logs.length === 0 ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center gap-4" style={{ padding: '40px 20px' }}>
            {/* Decorative concentric rings */}
            <div className="relative" style={{ width: 48, height: 48 }}>
              <div className="absolute inset-0 rounded-full" style={{ border: '1.5px solid #E8E3DA' }} />
              <div className="absolute rounded-full" style={{ inset: 8, border: '1px dashed #EDE8E0' }} />
              <div className="absolute rounded-full" style={{ inset: 16, backgroundColor: '#F0EDE8' }} />
            </div>
            <div className="text-center">
              <p style={{ fontSize: 11, color: '#A8A29E', fontWeight: 600 }}>
                {error ? 'Failed to load logs' : 'Waiting for traffic…'}
              </p>
              {!error && (
                <p style={{ fontSize: 9, color: '#C8C3BB', marginTop: 3 }}>
                  Make a request to see it appear here
                </p>
              )}
            </div>
          </div>
        ) : (
          <table className="w-full" style={{ fontSize: 10, color: '#6B6560', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ backgroundColor: '#F5F1EB' }}>
                {['Method', 'Endpoint', 'Client', 'ms', 'Status'].map((col, i) => (
                  <th
                    key={col}
                    className={i === 2 ? 'hidden lg:table-cell' : i === 3 ? 'hidden xl:table-cell' : ''}
                    style={{
                      padding: '7px 12px',
                      textAlign: i === 4 ? 'right' : 'left',
                      fontSize: 8, fontWeight: 800,
                      textTransform: 'uppercase', letterSpacing: '0.14em',
                      color: '#B0AB9E',
                      borderBottom: '1px solid #EDEAE4',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((req, idx) => {
                const mCfg = METHOD_CFG[req.method] || { bg: '#F0EDE8', color: '#8C8680', border: '#DDD8D0' };
                const sCfg = getStatusCfg(req.status);
                return (
                  <tr
                    key={`${req.timestamp}-${idx}`}
                    className="table-row-hover"
                    style={{ borderBottom: '1px solid #F0EDE8' }}
                  >
                    {/* Method badge */}
                    <td style={{ padding: '9px 12px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: 8, fontWeight: 900,
                          textTransform: 'uppercase', letterSpacing: '0.08em',
                          backgroundColor: mCfg.bg, color: mCfg.color,
                          border: `1px solid ${mCfg.border}`,
                          borderRadius: 4, padding: '2px 6px', lineHeight: 1.7,
                        }}
                      >
                        {req.method}
                      </span>
                    </td>

                    {/* Endpoint */}
                    <td
                      style={{
                        padding: '9px 12px',
                        fontFamily: 'monospace', fontSize: 9,
                        color: '#4A4540', maxWidth: 100,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}
                      title={req.endpoint}
                    >
                      {req.endpoint}
                    </td>

                    {/* Client */}
                    <td
                      className="hidden lg:table-cell"
                      style={{
                        padding: '9px 12px', maxWidth: 80,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        color: '#A8A29E', fontSize: 9,
                      }}
                      title={req.client}
                    >
                      {req.client}
                    </td>

                    {/* Latency */}
                    <td
                      className="hidden xl:table-cell"
                      style={{ padding: '9px 12px', fontFamily: 'monospace', color: '#C8C3BB', fontSize: 9 }}
                    >
                      {req.latency != null ? `${req.latency}` : '—'}
                    </td>

                    {/* Status badge */}
                    <td style={{ padding: '9px 12px', textAlign: 'right' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: 8, fontWeight: 800,
                          backgroundColor: sCfg.bg, color: sCfg.color,
                          border: `1px solid ${sCfg.border}`,
                          borderRadius: 5, padding: '2px 7px', lineHeight: 1.7,
                        }}
                      >
                        {req.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Footer ── */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{ padding: '8px 14px', borderTop: '1px solid #EDEAE4' }}
      >
        <p style={{ fontSize: 8, color: '#C8C3BB', fontFamily: 'monospace' }}>{logs.length} entries</p>
        <p style={{ fontSize: 8, color: '#C8C3BB', fontFamily: 'monospace' }}>auto-polling</p>
      </div>
    </div>
  );
}
