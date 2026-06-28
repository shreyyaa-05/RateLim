import React, { useState, useEffect } from 'react';
import { getPolicies, updatePolicy } from '../services/api';

const getAlgoName = (algo) => {
  switch (algo) {
    case 'fixed-window':
      return 'Fixed Window';
    case 'sliding-window':
      return 'Sliding Window Log';
    case 'sliding-window-counter':
      return 'Sliding Window Counter';
    case 'token-bucket':
      return 'Token Bucket';
    default:
      return algo;
  }
};

const getAlgoDescription = (algo) => {
  switch (algo) {
    case 'fixed-window':
      return 'Best for simple rate limiting. Low memory usage, but can allow twice the limit at window boundaries.';
    case 'sliding-window':
      return 'Best for strict, accurate rate limiting. Prevents boundary spikes but has higher memory overhead.';
    case 'sliding-window-counter':
      return 'Best for memory-efficient sliding windows. Approximates request rate without storing individual timestamps.';
    case 'token-bucket':
      return 'Best for APIs with bursty traffic. Refills tokens continuously and allows accumulated bursts.';
    default:
      return '';
  }
};

export default function Algorithms() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Edit form state
  const [formAlgo, setFormAlgo] = useState('fixed-window');
  const [formMax, setFormMax] = useState(1);
  const [formWindow, setFormWindow] = useState(1);
  const [formEnabled, setFormEnabled] = useState(true);
  
  // Validation & Save error states
  const [validationError, setValidationError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadAllPolicies = async () => {
    try {
      const data = await getPolicies();
      setPolicies(data || []);
      setFetchError(false);
    } catch (err) {
      console.error('[Algorithms] Error fetching policies:', err.message);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadAllPolicies();
  }, []);

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

  // Perform client-side validation
  const validate = (algo, max, windowDur) => {
    if (!['fixed-window', 'sliding-window', 'sliding-window-counter', 'token-bucket'].includes(algo)) {
      return 'Unsupported rate limiting algorithm.';
    }
    const maxVal = parseFloat(max);
    if (max === '' || isNaN(maxVal) || !Number.isInteger(maxVal) || maxVal <= 0) {
      return 'Max requests must be a positive integer.';
    }
    const windowVal = parseFloat(windowDur);
    if (windowDur === '' || isNaN(windowVal) || !Number.isInteger(windowVal) || windowVal <= 0) {
      return 'Window duration must be a positive integer.';
    }
    return '';
  };

  const handleSave = async (id) => {
    const errorMsg = validate(formAlgo, formMax, formWindow);
    if (errorMsg) {
      setValidationError(errorMsg);
      return;
    }

    setValidationError('');
    setSaveError('');
    setSaving(true);

    try {
      await updatePolicy(id, {
        algorithm: formAlgo,
        maxRequests: parseInt(formMax, 10),
        windowInSeconds: parseInt(formWindow, 10),
        enabled: formEnabled,
      });
      setEditingId(null);
      // Reload policies
      await loadAllPolicies();
    } catch (err) {
      console.error('[Algorithms] Error saving policy:', err.message);
      setSaveError(err.response?.data?.message || err.message || 'Failed to save policy');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-neutral-50 p-6">
      {/* Page Header */}
      <div className="mb-6 border-b border-neutral-200 pb-4">
        <h1 className="text-xl font-bold text-neutral-900 leading-tight">Algorithm Management</h1>
        <p className="text-xs text-neutral-400 mt-1">Configure endpoint rate-limiting strategies and limits dynamically at runtime</p>
      </div>

      {loading && policies.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <p className="text-xs text-neutral-400">Loading rate limiting policies...</p>
        </div>
      ) : fetchError ? (
        <div className="rounded-lg border border-neutral-200 bg-red-50 p-6 shadow-sm">
          <p className="text-xs font-semibold text-red-800">Unable to load policies. Please check your backend connection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {policies.map((policy) => {
            const isEditing = editingId === policy._id;
            return (
              <div key={policy._id} className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm flex flex-col justify-between min-h-[260px]">
                {/* Header */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-neutral-800 bg-neutral-100 rounded px-2 py-0.5">
                      {policy.endpoint}
                    </span>
                    <span className={`h-2.5 w-2.5 rounded-full ${policy.enabled ? 'bg-neutral-900' : 'bg-neutral-300'}`} title={policy.enabled ? 'Active' : 'Disabled'}></span>
                  </div>
                  
                  <p className="text-[11px] text-neutral-400 mt-3 italic leading-relaxed">
                    {policy.description || 'No description provided.'}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-2 leading-relaxed">
                    <strong className="text-neutral-700">Use Case:</strong> {getAlgoDescription(policy.algorithm)}
                  </p>
                </div>

                {/* Body Details / Fields */}
                <div className="my-4 border-t border-b border-neutral-100 py-3">
                  {isEditing ? (
                    <div className="flex flex-col gap-3">
                      {/* Algorithm Select */}
                      <div>
                        <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">Algorithm</label>
                        <select
                          value={formAlgo}
                          onChange={(e) => setFormAlgo(e.target.value)}
                          className="mt-1 w-full rounded border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-800 focus:border-neutral-900 focus:outline-none"
                        >
                          <option value="fixed-window">Fixed Window</option>
                          <option value="sliding-window">Sliding Window</option>
                          <option value="sliding-window-counter">Sliding Window Counter</option>
                          <option value="token-bucket">Token Bucket</option>
                        </select>
                      </div>

                      {/* Max Requests Input */}
                      <div>
                        <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">Max Requests</label>
                        <input
                          type="number"
                          value={formMax}
                          onChange={(e) => setFormMax(e.target.value)}
                          placeholder="e.g. 100"
                          className="mt-1 w-full rounded border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-800 focus:border-neutral-900 focus:outline-none"
                        />
                      </div>

                      {/* Window Duration Input */}
                      <div>
                        <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">Window (seconds)</label>
                        <input
                          type="number"
                          value={formWindow}
                          onChange={(e) => setFormWindow(e.target.value)}
                          placeholder="e.g. 60"
                          className="mt-1 w-full rounded border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-800 focus:border-neutral-900 focus:outline-none"
                        />
                      </div>

                      {/* Enabled Checkbox */}
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="checkbox"
                          id={`enabled-${policy._id}`}
                          checked={formEnabled}
                          onChange={(e) => setFormEnabled(e.target.checked)}
                          className="h-4 w-4 rounded border-neutral-200 text-neutral-900 focus:ring-0 cursor-pointer"
                        />
                        <label htmlFor={`enabled-${policy._id}`} className="text-xs font-semibold text-neutral-600 cursor-pointer select-none">
                          Policy Enabled
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-y-3 text-xs">
                      <div>
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase block tracking-wide">Algorithm</span>
                        <span className="font-semibold text-neutral-800">
                          {getAlgoName(policy.algorithm)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase block tracking-wide">Status</span>
                        <span className={`font-bold ${policy.enabled ? 'text-neutral-800' : 'text-neutral-300'}`}>
                          {policy.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase block tracking-wide">Current Limit</span>
                        <span className="font-semibold text-neutral-800">{policy.maxRequests} reqs</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase block tracking-wide">Window</span>
                        <span className="font-semibold text-neutral-800">{policy.windowInSeconds}s</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Validation and Saving Errors */}
                {isEditing && validationError && (
                  <p className="text-[10px] font-semibold text-red-500 mb-3">{validationError}</p>
                )}
                {isEditing && saveError && (
                  <p className="text-[10px] font-semibold text-red-500 mb-3">{saveError}</p>
                )}

                {/* Footer Buttons */}
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSave(policy._id)}
                        disabled={saving}
                        className="flex-1 rounded bg-neutral-900 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 disabled:bg-neutral-300 transition-colors"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={saving}
                        className="rounded border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-500 hover:bg-neutral-50 disabled:opacity-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEdit(policy)}
                      className="w-full rounded border border-neutral-200 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
                    >
                      Edit Config
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
