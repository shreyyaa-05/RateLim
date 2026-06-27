import React from 'react';
import StatCard from '../components/StatCard';
import ChartPlaceholder from '../components/ChartPlaceholder';
import TablePlaceholder from '../components/TablePlaceholder';

export default function Dashboard() {
  // Dummy dashboard status metrics
  const cardData = [
    { title: 'Server Status', value: 'UP', type: 'status', suffix: 'Node.js/Express' },
    { title: 'Redis Status', value: 'UP', type: 'status', suffix: 'Port 6379' },
    { title: 'MongoDB Status', value: 'UP', type: 'status', suffix: 'Port 27017' },
    { title: 'Current Algorithm', value: 'Sliding Window', type: 'text', suffix: 'Default' },
    { title: 'Total Requests', value: '12,504', type: 'text', suffix: 'All-time' },
    { title: 'Blocked Requests', value: '382', type: 'text', suffix: 'HTTP 429' }
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
          <span>Auto-refreshing</span>
        </button>
      </div>

      {/* Grid of 6 Stat Cards */}
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
