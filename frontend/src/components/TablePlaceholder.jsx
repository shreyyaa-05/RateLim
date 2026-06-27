import React from 'react';

export default function TablePlaceholder() {
  const dummyRequests = [
    { id: 1, method: 'GET', endpoint: '/test', status: 200, client: '192.168.1.1', time: '12ms', stamp: 'Just now' },
    { id: 2, method: 'POST', endpoint: '/auth/login', status: 200, client: 'user_6a3f8ea3', time: '87ms', stamp: '1 min ago' },
    { id: 3, method: 'GET', endpoint: '/sliding-test', status: 429, client: '10.0.0.3', time: '4ms', stamp: '2 mins ago' },
    { id: 4, method: 'GET', endpoint: '/admin/health', status: 200, client: 'user_6a3f8ea3', time: '6ms', stamp: '5 mins ago' },
    { id: 5, method: 'GET', endpoint: '/test', status: 429, client: '192.168.10.10', time: '2ms', stamp: '8 mins ago' }
  ];

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="border-b border-neutral-100 pb-4">
        <h3 className="text-sm font-semibold text-neutral-800">Recent Requests Log</h3>
        <p className="text-xs text-neutral-400">List of last 5 API requests received (dummy data)</p>
      </div>

      {/* Grid Table Container */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs text-neutral-500">
          <thead className="bg-neutral-50 text-[10px] uppercase font-bold text-neutral-400">
            <tr>
              <th className="px-4 py-2">Method</th>
              <th className="px-4 py-2">Endpoint</th>
              <th className="px-4 py-2">Client ID/IP</th>
              <th className="px-4 py-2">Latency</th>
              <th className="px-4 py-2">Timestamp</th>
              <th className="px-4 py-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {dummyRequests.map((req) => (
              <tr key={req.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-semibold text-neutral-800">{req.method}</td>
                <td className="px-4 py-3 text-neutral-600 font-mono">{req.endpoint}</td>
                <td className="px-4 py-3 text-neutral-500">{req.client}</td>
                <td className="px-4 py-3 text-neutral-400">{req.time}</td>
                <td className="px-4 py-3 text-neutral-400">{req.stamp}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium leading-none ${
                    req.status === 200
                      ? 'bg-neutral-100 text-neutral-800'
                      : 'bg-neutral-900 text-neutral-100 font-bold'
                  }`}>
                    {req.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
