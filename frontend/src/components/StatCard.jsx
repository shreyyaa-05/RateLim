import React from 'react';

export default function StatCard({ title, value, type, suffix }) {
  const isStatus = type === 'status';

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      {/* Title */}
      <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider">{title}</h3>

      {/* Value */}
      <div className="mt-2 flex items-baseline justify-between">
        {isStatus ? (
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${value === 'UP' || value === 'Active' ? 'bg-neutral-900' : 'bg-neutral-300'}`}></span>
            <span className="text-xl font-semibold text-neutral-800 uppercase leading-none">{value}</span>
          </div>
        ) : (
          <span className="text-3xl font-bold tracking-tight text-neutral-900 leading-none">{value}</span>
        )}

        {/* Suffix / metadata label */}
        {suffix && (
          <span className="text-[10px] font-medium text-neutral-400 bg-neutral-100 rounded px-1.5 py-0.5">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
