'use client';

import React, { useState } from 'react';

export default function MlsTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch('/api/mls-test');
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while testing the connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">NJMLS RETS API Connection Test</h1>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            This page tests the RETS connection to the NJMLS servers (`njmls-rets.paragonrels.com`)
            using the provided Username and Password.
          </p>
          <button
            onClick={testConnection}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Testing Connection...' : 'Test RETS Login Connection'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-6 border border-red-200">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className={`p-4 rounded-lg mb-6 border ${result.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <h2 className="font-bold text-lg mb-2">
              {result.success ? '✅ Connection Successful (200 OK)' : '❌ Connection Failed'}
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div><strong>Status Code:</strong> {result.status}</div>
              <div><strong>Received Cookies:</strong> {result.cookies ? 'Yes' : 'No'}</div>
            </div>

            <h3 className="font-semibold mb-2 text-gray-700">RETS Response (Raw XML):</h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-green-400 whitespace-pre-wrap font-mono">
                {result.data}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
