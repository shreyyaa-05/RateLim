import React, { useState, useEffect } from 'react';
import { getPolicies, updatePolicy } from '../services/api';

/* ─── Helpers ─── */
const getAlgoName = (algo) => {
  const map = {
    'fixed-window':            'Fixed Window',
    'sliding-window':          'Sliding Window Log',
    'sliding-window-counter':  'Sliding Window Counter',
    'token-bucket':            'Token Bucket',
    'leaky-bucket':            'Leaky Bucket',
  };
  return map[algo] || algo;
};

const getAlgoDescription = (algo) => {
  const map = {
    'fixed-window':           'Low memory, simple limiting. Can allow 2× the rate at window boundaries.',
    'sliding-window':         'Strict, accurate limiting. Prevents boundary spikes; higher memory use.',
    'sliding-window-counter': 'Memory-efficient approximation. Slides without storing individual timestamps.',
    'token-bucket':           'Handles bursty traffic gracefully. Tokens refill continuously.',
    'leaky-bucket':           'Smooth, queue-based flow. Overflow rejected to protect downstream.',
  };
  return map[algo] || '';
};

/* Mustard shades — Algorithms page identity */
const MU = {
  accent:  '#C4962A',
  bg:      '#FAF2DC',
  border:  '#E8D580',
  dark:    '#6B5000',
  light:   '#FDFCF3',
};

const validate = (algo, max, windowDur) => {
  const valid = ['fixed-window','sliding-window','sliding-window-counter','token-bucket','leaky-bucket'];
  if (!valid.includes(algo)) return 'Unsupported algorithm.';
  const maxVal = parseFloat(max);
  if (max === '' || isNaN(maxVal) || !Number.isInteger(maxVal) || maxVal <= 0) return 'Max requests must be a positive integer.';
  const winVal = parseFloat(windowDur);
  if (windowDur === '' || isNaN(winVal) || !Number.isInteger(winVal) || winVal <= 0) return 'Window must be a positive integer.';
  return '';
};

export default function Algorithms() {
  const [policies, setPolicies]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [editingId, setEditingId]   = useState(null);

  const [formAlgo, setFormAlgo]       = useState('fixed-window');
  const [formMax, setFormMax]         = useState(1);
  const [formWindow, setFormWindow]   = useState(1);
  const [formEnabled, setFormEnabled] = useState(true);

  const [validationError, setValidationError] = useState('');
  const [saveError, setSaveError]             = useState('');
  const [saving, setSaving]                   = useState(false);

  const loadAllPolicies = async () => {
    try {
      const data = await getPolicies();
      setPolicies(data || []);
      setFetchError(false);
    } catch (err) {
      console.error('[Algorithms]', err.message);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setLoading(true); loadAllPolicies(); }, []);

  const startEdit = (policy) => {
    setEditingId(policy._id);
    setFormAlgo(policy.algorithm);
    setFormMax(policy.maxRequests);
    setFormWindow(policy.windowInSeconds);
    setFormEnabled(policy.enabled);
    setValidationError('');
    setSaveError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setValidationError('');
    setSaveError('');
  };

  const handleSave = async (id) => {
    const err = validate(formAlgo, formMax, formWindow);
    if (err) { setValidationError(err); return; }
    setValidationError(''); setSaveError(''); setSaving(true);
    try {
      await updatePolicy(id, {
        algorithm: formAlgo,
        maxRequests: parseInt(formMax, 10),
        windowInSeconds: parseInt(formWindow, 10),
        enabled: formEnabled,
      });
      setEditingId(null);
      await loadAllPolicies();
    } catch (e) {
      setSaveError(e.response?.data?.message || e.message || 'Failed to save policy');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="flex-1 overflow-y-auto dot-grid"
      style={{ minHeight: 'calc(100vh - 56px)' }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 24px 48px', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* ── Page header ── */}
        <header className="animate-slide-up relative overflow-hidden"
          style={{
            backgroundColor: '#FDFCF9',
            border: `1.5px solid ${MU.border}`,
            borderRadius: 16,
            borderTop: `3px solid ${MU.accent}`,
            padding: '26px 32px',
          }}
        >
          {/* Decorative circles */}
          <div className="absolute pointer-events-none rounded-full" style={{ width: 200, height: 200, top: -80, right: -60, backgroundColor: MU.accent, opacity: 0.05 }} />
          <div className="absolute pointer-events-none rounded-full spin-slow" style={{ width: 140, height: 140, top: -30, right: 30, border: `1.5px dashed ${MU.border}`, opacity: 0.35 }} />
          <div className="absolute pointer-events-none rounded-full float-anim" style={{ width: 10, height: 10, top: 24, right: 100, backgroundColor: MU.accent, opacity: 0.5 }} />
          <div className="absolute pointer-events-none rounded-full float-anim-2" style={{ width: 6, height: 6, top: 44, right: 80, backgroundColor: '#C47070', opacity: 0.4 }} />

          {/* Tape label */}
          <div className="tape-label inline-flex mb-5" style={{ color: MU.dark, borderColor: MU.border }}>
            <span className="rounded-full" style={{ width: 5, height: 5, backgroundColor: MU.accent, display: 'block', flexShrink: 0 }} />
            Algorithms · Policies
          </div>

          <h1 style={{
            fontSize: 'clamp(24px, 3.5vw, 38px)',
            fontWeight: 900,
            color: '#1A1714',
            letterSpacing: '-0.035em',
            lineHeight: 1.05,
            marginBottom: 10,
          }}>
            Algorithm{' '}
            <span style={{ fontFamily: 'Lora, Georgia, serif', fontStyle: 'italic', fontWeight: 600, color: MU.accent, letterSpacing: '-0.01em' }}>
              Management
            </span>
          </h1>
          <p style={{ fontSize: 12, color: '#6B6560', maxWidth: 460, lineHeight: 1.65 }}>
            Configure endpoint rate-limiting strategies and limits dynamically at runtime.
            Each policy maps to a specific API route.
          </p>
        </header>

        {/* ── Content ── */}
        {loading && policies.length === 0 ? (
          <LoadingState />
        ) : fetchError ? (
          <ErrorState />
        ) : (
          <div
            className="animate-slide-up delay-100"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 14,
            }}
          >
            {policies.map((policy, idx) => {
              const isEditing = editingId === policy._id;
              return (
                <PolicyCard
                  key={policy._id}
                  policy={policy}
                  isEditing={isEditing}
                  idx={idx}
                  formAlgo={formAlgo} setFormAlgo={setFormAlgo}
                  formMax={formMax}   setFormMax={setFormMax}
                  formWindow={formWindow} setFormWindow={setFormWindow}
                  formEnabled={formEnabled} setFormEnabled={setFormEnabled}
                  validationError={validationError}
                  saveError={saveError}
                  saving={saving}
                  onStartEdit={() => startEdit(policy)}
                  onSave={() => handleSave(policy._id)}
                  onCancel={cancelEdit}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   PolicyCard — mustard editorial card
───────────────────────────────────────────────── */
function PolicyCard({
  policy, isEditing, idx,
  formAlgo, setFormAlgo, formMax, setFormMax,
  formWindow, setFormWindow, formEnabled, setFormEnabled,
  validationError, saveError, saving,
  onStartEdit, onSave, onCancel,
}) {
  const delayClass = `delay-${Math.min((idx + 1) * 50, 400)}`;

  return (
    <div
      className={`card-hover animate-slide-up ${delayClass} relative overflow-hidden flex flex-col`}
      style={{
        backgroundColor: isEditing ? MU.light : '#FDFCF9',
        border: `1.5px solid ${isEditing ? MU.border : '#E8E3DA'}`,
        borderRadius: 14,
        borderTop: `3px solid ${policy.enabled ? MU.accent : '#D4CFC7'}`,
        minHeight: 260,
      }}
    >
      {/* Decorative background blob */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 70, height: 70,
          bottom: -20, right: -20,
          backgroundColor: policy.enabled ? MU.accent : '#C4BFB6',
          opacity: 0.05,
        }}
      />

      {/* ── Card top row — endpoint + status ── */}
      <div
        className="flex items-start justify-between gap-2"
        style={{ padding: '14px 16px 12px', borderBottom: '1px solid #F0EDE8' }}
      >
        {/* Endpoint badge */}
        <span
          style={{
            fontFamily: 'monospace', fontSize: 10, fontWeight: 700,
            backgroundColor: isEditing ? MU.bg : '#F0EDE8',
            color: isEditing ? MU.dark : '#4A4540',
            borderRadius: 5, padding: '3px 8px', lineHeight: 1.6,
            maxWidth: '75%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            display: 'block',
          }}
        >
          {policy.endpoint}
        </span>

        {/* Status chip */}
        <span
          style={{
            fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
            borderRadius: 99, padding: '3px 8px',
            border: '1.5px solid',
            ...(policy.enabled
              ? { backgroundColor: MU.bg, borderColor: MU.border, color: MU.dark }
              : { backgroundColor: '#F0EDE8', borderColor: '#E8E3DA', color: '#A8A29E' }
            ),
          }}
        >
          {policy.enabled ? 'active' : 'off'}
        </span>
      </div>

      {/* ── Card body ── */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Description text */}
        {!isEditing && (
          <div>
            {policy.description && (
              <p style={{ fontSize: 10, color: '#8C8680', fontStyle: 'italic', lineHeight: 1.55, marginBottom: 6 }}>
                {policy.description}
              </p>
            )}
            <p style={{ fontSize: 10, color: '#6B6560', lineHeight: 1.6 }}>
              {getAlgoDescription(policy.algorithm)}
            </p>
          </div>
        )}

        {/* View or Edit fields */}
        <div style={{ flex: 1 }}>
          {isEditing ? (
            <div className="flex flex-col gap-3">
              <FormField label="Algorithm">
                <select
                  className="algo-select"
                  value={formAlgo}
                  onChange={(e) => setFormAlgo(e.target.value)}
                >
                  <option value="fixed-window">Fixed Window</option>
                  <option value="sliding-window">Sliding Window</option>
                  <option value="sliding-window-counter">Sliding Window Counter</option>
                  <option value="token-bucket">Token Bucket</option>
                  <option value="leaky-bucket">Leaky Bucket</option>
                </select>
              </FormField>

              <div className="grid grid-cols-2 gap-2">
                <FormField label="Max Requests">
                  <input
                    type="number"
                    className="algo-input"
                    value={formMax}
                    onChange={(e) => setFormMax(e.target.value)}
                    placeholder="e.g. 100"
                  />
                </FormField>
                <FormField label="Window (s)">
                  <input
                    type="number"
                    className="algo-input"
                    value={formWindow}
                    onChange={(e) => setFormWindow(e.target.value)}
                    placeholder="e.g. 60"
                  />
                </FormField>
              </div>

              {/* Enabled toggle */}
              <label
                htmlFor={`enabled-${policy._id}`}
                className="flex items-center gap-2 cursor-pointer"
                style={{ userSelect: 'none' }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: 32, height: 18,
                    backgroundColor: formEnabled ? MU.accent : '#D4CFC7',
                    borderRadius: 99,
                    transition: 'background-color 0.2s ease',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                  onClick={() => setFormEnabled(p => !p)}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 2, left: formEnabled ? 16 : 2,
                      width: 14, height: 14,
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      transition: 'left 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }}
                  />
                </div>
                <input
                  type="checkbox"
                  id={`enabled-${policy._id}`}
                  checked={formEnabled}
                  onChange={(e) => setFormEnabled(e.target.checked)}
                  style={{ display: 'none' }}
                />
                <span style={{ fontSize: 11, fontWeight: 600, color: '#6B6560' }}>
                  Policy {formEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>

              {/* Validation errors */}
              {(validationError || saveError) && (
                <p style={{ fontSize: 10, fontWeight: 600, color: '#C47070' }}>
                  {validationError || saveError}
                </p>
              )}
            </div>
          ) : (
            /* ── View state ── stat grid ── */
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
              <StatPair label="Algorithm" value={getAlgoName(policy.algorithm)} accent={MU.accent} />
              <StatPair label="Status"    value={policy.enabled ? 'Enabled' : 'Disabled'} accent={policy.enabled ? '#6B9E6F' : '#A8A29E'} />
              <StatPair label="Limit"     value={`${policy.maxRequests} reqs`} accent={MU.accent} />
              <StatPair label="Window"    value={`${policy.windowInSeconds} s`} accent={MU.accent} />
            </div>
          )}
        </div>

        {/* ── Footer buttons ── */}
        <div className="flex gap-2" style={{ marginTop: 'auto' }}>
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                style={{
                  flex: 1,
                  borderRadius: 8, padding: '8px 0',
                  fontSize: 11, fontWeight: 800,
                  backgroundColor: saving ? '#D4CFC7' : MU.accent,
                  color: saving ? '#A8A29E' : '#fff',
                  border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.15s ease',
                  letterSpacing: '-0.01em',
                }}
                onMouseEnter={e => { if (!saving) e.currentTarget.style.backgroundColor = '#B8821A'; }}
                onMouseLeave={e => { if (!saving) e.currentTarget.style.backgroundColor = MU.accent; }}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                style={{
                  borderRadius: 8, padding: '8px 14px',
                  fontSize: 11, fontWeight: 700,
                  backgroundColor: 'transparent',
                  color: '#6B6560',
                  border: '1.5px solid #E8E3DA',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F0EDE8'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onStartEdit}
              style={{
                width: '100%',
                borderRadius: 8, padding: '8px 0',
                fontSize: 11, fontWeight: 700,
                backgroundColor: 'transparent',
                color: '#6B6560',
                border: '1.5px solid #E8E3DA',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = MU.bg;
                e.currentTarget.style.borderColor = MU.border;
                e.currentTarget.style.color = MU.dark;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#E8E3DA';
                e.currentTarget.style.color = '#6B6560';
              }}
            >
              Edit Config
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Small stat label/value pair ── */
function StatPair({ label, value, accent }) {
  return (
    <div style={{ padding: '8px 10px', backgroundColor: '#F7F3EE', borderRadius: 8, borderLeft: `2px solid ${accent}30` }}>
      <p style={{ fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#C8C3BB', marginBottom: 3 }}>
        {label}
      </p>
      <p style={{ fontSize: 11, fontWeight: 800, color: '#1A1714', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {value}
      </p>
    </div>
  );
}

/* ── Form field wrapper ── */
function FormField({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#A8A29E', marginBottom: 5 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

/* ── Loading state ── */
function LoadingState() {
  return (
    <div className="animate-slide-up" style={{
      backgroundColor: '#FDFCF9',
      border: '1.5px solid #E8E3DA',
      borderRadius: 14, padding: '48px',
      textAlign: 'center',
    }}>
      <div className="flex flex-col items-center gap-3">
        <div className="relative" style={{ width: 40, height: 40 }}>
          <div className="absolute inset-0 rounded-full" style={{ border: '2px solid #F5E9B0' }} />
          <div className="absolute rounded-full spin-slow" style={{ inset: 5, border: '2px dashed #C4962A', opacity: 0.5 }} />
        </div>
        <p style={{ fontSize: 11, color: '#A8A29E', fontWeight: 600 }}>Loading rate limiting policies…</p>
      </div>
    </div>
  );
}

/* ── Error state ── */
function ErrorState() {
  return (
    <div className="animate-slide-up" style={{
      backgroundColor: '#FBE9E9',
      border: '1.5px solid #E8B8B8',
      borderRadius: 14, padding: '20px 24px',
    }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#7A2020' }}>
        Unable to load policies — please check your backend connection.
      </p>
    </div>
  );
}
