"use client";

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ResetRequestForm() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Check your email for the reset link.');
      } else {
        setError(data.error || 'Failed to request reset.');
      }
    } catch (err) {
      setError('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 shadow-xl border border-gray-100">
      <h1 className="text-3xl font-bold text-black text-center mb-8">Reset Password</h1>
      <p className="text-sm text-gray-500 mb-6 text-center">
        Enter your email to receive a password reset link.
      </p>

      {message && <div className="bg-green-50 text-green-600 p-3 mb-4 rounded text-sm">{message}</div>}
      {error && <div className="bg-red-50 text-red-500 p-3 mb-4 rounded text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address"
          className="w-full border-b border-gray-300 py-2 focus:border-black focus:outline-none text-black font-medium placeholder-gray-500"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white font-bold uppercase tracking-widest py-3 hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Link'}
        </button>
      </form>
    </div>
  );
}
