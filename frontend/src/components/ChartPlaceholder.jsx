import React from 'react';

export default function ChartPlaceholder() {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-800">Traffic Over Time</h3>
          <p className="text-xs text-neutral-400">Request throughput trends (dummy data)</p>
        </div>
        <div className="flex gap-2 text-[10px] font-medium">
          <span className="flex items-center gap-1 text-neutral-600">
            <span className="h-2 w-2 rounded-full bg-neutral-900"></span>
            Total Hits
          </span>
          <span className="flex items-center gap-1 text-neutral-400">
            <span className="h-2 w-2 rounded bg-neutral-300"></span>
            Blocked (429)
          </span>
        </div>
      </div>

      {/* SVG Mock Chart Area */}
      <div className="relative mt-6 flex h-48 w-full items-end gap-1 px-2">
        {/* Simple Grayscale Mock Chart Gridlines */}
        <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-between pointer-events-none">
          <div className="w-full border-t border-dashed border-neutral-100"></div>
          <div className="w-full border-t border-dashed border-neutral-100"></div>
          <div className="w-full border-t border-dashed border-neutral-100"></div>
          <div className="w-full border-t border-dashed border-neutral-100"></div>
        </div>

        {/* Mock Line/Path Trend Chart using SVG */}
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          {/* Main trend line (total requests) */}
          <path
            d="M 0 80 Q 20 30 40 60 T 80 20 T 100 45"
            fill="none"
            stroke="#171717"
            strokeWidth="2"
          />
          {/* Shadow trend line (blocked requests) */}
          <path
            d="M 0 95 Q 20 85 40 90 T 80 75 T 100 85"
            fill="none"
            stroke="#d4d4d4"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
        </svg>

        {/* X-Axis labels */}
        <div className="absolute inset-x-0 -bottom-6 flex justify-between text-[10px] text-neutral-400 px-1">
          <span>10:00</span>
          <span>10:15</span>
          <span>10:30</span>
          <span>10:45</span>
          <span>11:00</span>
        </div>
      </div>
    </div>
  );
}
