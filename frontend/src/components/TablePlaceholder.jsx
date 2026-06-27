import React, { useState, useEffect } from 'react';
import { getRequestLogs } from '../services/api';

export default function TablePlaceholder() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(false);

  const fetchLogs = async () => {
    try {
      const data = await getRequestLogs();
      setLogs(data || []);
      setError(false);
    } catch (err) {
      console.error('[TablePlaceholder] Error fetching request logs:', err.message);
      setError(true);
      setLogs([]); // Ensure we clear old logs and display the fallback
    }
  };

  useEffect(() => {
    fetchLogs();

    const intervalId = setInterval(() => {
      fetchLogs();
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  const formatTimestamp = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (err) {
      return isoString;
    }
  };

  const getStatusBadgeStyle = (status) => {
    if (status >= 200 && status < 400) {
      return 'bg-neutral-100 text-neutral-800';
    }
    if (status === 429) {
      return 'bg-neutral-900 text-neutral-100 font-bold';
    }
    if (status >= 500) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-neutral-200 text-neutral-600';
  };

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="border-b border-neutral-100 pb-4 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold text-neutral-800">Recent Requests Log</h3>
          <p className="text-xs text-neutral-400">List of last 100 API requests received (real-time)</p>
        </div>
        <span className="text-[10px] text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded flex items-center gap-1">
          <span className={`h-1.5 w-1.5 rounded-full ${error ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></span>
          3s Polling
        </span>
      </div>

      {/* Grid Table Container */}
      <div className="mt-4 overflow-x-auto max-h-[350px] overflow-y-auto">
        <table className="w-full text-left text-xs text-neutral-500 table-layout-fixed">
          <thead className="bg-neutral-50 text-[10px] uppercase font-bold text-neutral-400 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2 bg-neutral-50">Method</th>
              <th className="px-4 py-2 bg-neutral-50">Endpoint</th>
              <th className="px-4 py-2 bg-neutral-50">Client ID/IP</th>
              <th className="px-4 py-2 bg-neutral-50">Latency</th>
              <th className="px-4 py-2 bg-neutral-50">Timestamp</th>
              <th className="px-4 py-2 text-right bg-neutral-50">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {error || logs.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-neutral-400 font-medium">
                  No request data available
                </td>
              </tr>
            ) : (
              logs.map((req, index) => (
                <tr key={`${req.timestamp}-${index}`} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-semibold text-neutral-800">{req.method}</td>
                  <td className="px-4 py-3 text-neutral-600 font-mono truncate max-w-[120px]" title={req.endpoint}>
                    {req.endpoint}
                  </td>
                  <td className="px-4 py-3 text-neutral-500 truncate max-w-[100px]" title={req.client}>
                    {req.client}
                  </td>
                  <td className="px-4 py-3 text-neutral-400">
                    {req.latency !== undefined ? `${req.latency}ms` : '--'}
                  </td>
                  <td className="px-4 py-3 text-neutral-400">
                    {formatTimestamp(req.timestamp)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium leading-none ${getStatusBadgeStyle(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
