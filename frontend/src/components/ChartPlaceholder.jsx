import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { getAnalyticsData } from '../services/api';

export default function ChartPlaceholder() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchAnalytics = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const apiData = await getAnalyticsData();
      setData(apiData);
      setError(false);
    } catch (err) {
      console.error('[ChartPlaceholder] Error fetching analytics:', err.message);
      setError(true);
      setData(null);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(true);

    const intervalId = setInterval(() => {
      fetchAnalytics(false);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // Transform backend format to Recharts format
  const transformedData = React.useMemo(() => {
    if (!data || !data.labels) return [];
    return data.labels.map((label, idx) => ({
      label,
      total: data.totalRequests[idx] || 0,
      allowed: data.allowedRequests[idx] || 0,
      blocked: data.blockedRequests[idx] || 0,
    }));
  }, [data]);

  // Determine if there is any traffic (non-zero requests) in the window
  const hasTraffic = React.useMemo(() => {
    return transformedData.some((point) => point.total > 0);
  }, [transformedData]);

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      {/* Header & Legend */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-800">Traffic Over Time</h3>
          <p className="text-xs text-neutral-400">Request throughput trends (real-time)</p>
        </div>
        {!loading && !error && hasTraffic && (
          <div className="flex gap-3 text-[10px] font-medium">
            <span className="flex items-center gap-1 text-neutral-600">
              <span className="h-2 w-2 rounded-full bg-neutral-900"></span>
              Total
            </span>
            <span className="flex items-center gap-1 text-neutral-500">
              <span className="h-2 w-2 rounded-full bg-[#10b981]"></span>
              Allowed
            </span>
            <span className="flex items-center gap-1 text-neutral-400">
              <span className="h-2 w-2 rounded bg-[#a3a3a3]"></span>
              Blocked
            </span>
          </div>
        )}
      </div>

      {/* Chart Area Container */}
      <div className="relative mt-6 h-48 w-full flex items-center justify-center">
        {loading ? (
          <span className="text-xs text-neutral-400 font-medium">Loading...</span>
        ) : error ? (
          <span className="text-xs text-red-500 font-medium">Unable to load analytics</span>
        ) : !hasTraffic ? (
          <span className="text-xs text-neutral-400 font-medium">No traffic yet</span>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={transformedData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: '#a3a3a3' }}
                axisLine={false}
                tickLine={false}
                interval={9}
              />
              <YAxis
                tick={{ fontSize: 9, fill: '#a3a3a3' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ fontSize: 10, borderRadius: 6, borderColor: '#e5e5e5' }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#171717"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="allowed"
                stroke="#10b981"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="blocked"
                stroke="#a3a3a3"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
