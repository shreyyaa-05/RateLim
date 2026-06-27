import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import ChartPlaceholder from '../components/ChartPlaceholder';
import TablePlaceholder from '../components/TablePlaceholder';
import { getDashboardStats } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const data = await getDashboardStats();
      setStats(data);
      setError(false);
    } catch (err) {
      console.error('[Dashboard] Error fetching statistics:', err.message);
      setError(true);
      setStats(null);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(true);

    const intervalId = setInterval(() => {
      fetchStats(false);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const getCardValue = (field, isNumber = false, formatFn = null) => {
    if (loading) return 'Loading...';
    if (error || !stats || stats[field] === undefined || stats[field] === null) return '--';
    if (formatFn) return formatFn(stats[field]);
    if (isNumber) return typeof stats[field] === 'number' ? stats[field].toLocaleString() : stats[field];
    return stats[field];
  };

  const getCardType = (originalType) => {
    if (loading) return 'text';
    return originalType;
  };

  const cardData = [
    { title: 'Server Status', value: getCardValue('server'), type: getCardType('status'), suffix: 'Node.js/Express' },
    { title: 'Redis Status', value: getCardValue('redis'), type: getCardType('status'), suffix: 'Port 6379' },
    { title: 'MongoDB Status', value: getCardValue('mongodb'), type: getCardType('status'), suffix: 'Port 27017' },
    { title: 'Current Algorithm', value: getCardValue('algorithm'), type: getCardType('text'), suffix: 'Active' },
    { title: 'Total Requests', value: getCardValue('totalRequests', true), type: getCardType('text'), suffix: 'All-time' },
    { title: 'Allowed Requests', value: getCardValue('allowedRequests', true), type: getCardType('text'), suffix: 'HTTP 2xx/3xx' },
    { title: 'Blocked Requests', value: getCardValue('blockedRequests', true), type: getCardType('text'), suffix: 'HTTP 429' },
    { title: 'Authenticated Requests', value: getCardValue('authenticatedRequests', true), type: getCardType('text'), suffix: 'JWT Verified' },
    { title: 'Anonymous Requests', value: getCardValue('anonymousRequests', true), type: getCardType('text'), suffix: 'IP Identified' },
    { title: 'Uptime', value: getCardValue('uptime', false, (val) => `${Math.floor(val)}s`), type: getCardType('text'), suffix: 'System' }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-neutral-50 p-6">
      {/* Page Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 leading-tight">System Metrics Dashboard</h1>
          <p className="text-xs text-neutral-400">Read-only real-time traffic statistics overview (wireframe mode)</p>
        </div>
        
        {/* Simple refresh control placeholder */}
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-1.5 rounded border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-400 hover:bg-neutral-50 cursor-not-allowed"
        >
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${error ? 'bg-red-400' : 'bg-green-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${error ? 'bg-red-500' : 'bg-green-500'}`}></span>
          </span>
          <span>{error ? 'Offline' : 'Auto-refreshing'}</span>
        </button>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800 shadow-sm flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
          Backend Offline
        </div>
      )}

      {/* Grid of 10 Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cardData.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            type={card.type}
            suffix={card.suffix}
          />
        ))}
      </div>

      {/* Sub-grid of charts and tables */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Traffic chart placeholder - wider */}
        <div className="xl:col-span-2">
          <ChartPlaceholder />
        </div>

        {/* Requests log table placeholder - smaller width on xl */}
        <div className="xl:col-span-1">
          <TablePlaceholder />
        </div>
      </div>
    </div>
  );
}
