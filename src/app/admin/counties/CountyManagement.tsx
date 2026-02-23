'use client';

import { useState, useEffect } from 'react';

interface County {
  id: string;
  name: string;
  state: string;
  isTarget: boolean;
}

export default function CountyManagement() {
  const [counties, setCounties] = useState<County[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCounties();
  }, []);

  const fetchCounties = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/counties');
      if (!response.ok) throw new Error('Failed to fetch counties');
      const data = await response.json();
      setCounties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTarget = async (id: string, currentTarget: boolean) => {
    try {
      setUpdatingId(id);
      const response = await fetch(`/api/admin/counties/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isTarget: !currentTarget }),
      });

      if (!response.ok) throw new Error('Failed to update county');

      const updatedCounty = await response.json();
      setCounties(prev => prev.map(c => c.id === id ? updatedCounty : c));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update county');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500 uppercase tracking-widest text-sm font-bold">Loading counties...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 border border-red-100 flex items-center justify-between">
        <span className="font-semibold">{error}</span>
        <button onClick={fetchCounties} className="text-sm font-bold uppercase tracking-wider underline hover:text-red-800">Retry</button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs text-black">County Name</th>
              <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs text-black text-center w-32">State</th>
              <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs text-black text-center w-48">Is Target Market</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {counties.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-12 text-center text-gray-500 uppercase tracking-widest text-sm">
                  No counties found in database.
                </td>
              </tr>
            ) : (
              counties.map((county) => (
                <tr key={county.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-semibold text-gray-800">{county.name}</td>
                  <td className="py-4 px-6 text-center text-gray-500">{county.state}</td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => handleToggleTarget(county.id, county.isTarget)}
                      disabled={updatingId === county.id}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${county.isTarget ? 'bg-black' : 'bg-gray-200'
                        } ${(updatingId === county.id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span className="sr-only">Toggle {county.name} target status</span>
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${county.isTarget ? 'translate-x-6' : 'translate-x-1'
                          }`}
                      />
                    </button>
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
