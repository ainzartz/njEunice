"use client";

import { useState } from 'react';

export default function UpdatePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isLengthValid = newPassword.length >= 8;
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const isMatch = newPassword === confirmPassword && newPassword.length > 0;
  const isFormValid = isLengthValid && hasNumber && hasSpecial && isMatch && currentPassword.length > 0;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!isFormValid) {
      setError('Please meet all requirements.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Password updated successfully. Logging out...');
        // Logout via API
        await fetch('/api/auth/logout', { method: 'POST' });
        // Redirect to login
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      } else {
        setError(data.error || 'Failed to update password.');
      }
    } catch (err) {
      setError('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 shadow-xl border border-gray-100">
      <h1 className="text-3xl font-bold text-black text-center mb-8">Update Password</h1>
      <p className="text-sm text-gray-500 mb-6 text-center">
        Your password has expired or you requested a change.
      </p>

      {message && <div className="bg-green-50 text-green-600 p-3 mb-4 rounded text-sm">{message}</div>}
      {error && <div className="bg-red-50 text-red-500 p-3 mb-4 rounded text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Password */}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current Password"
            className="w-full border-b border-gray-300 py-2 pr-10 focus:border-black focus:outline-none text-black font-medium placeholder-gray-500"
            required
          />
        </div>

        {/* New Password */}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
            className="w-full border-b border-gray-300 py-2 pr-10 focus:border-black focus:outline-none text-black font-medium placeholder-gray-500"
            required
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a9.04 9.04 0 012.12-.136C18.477 3 22.268 5.943 23.543 10a9.97 9.97 0 01-1.563 3.029m-5.858 5.908a9.04 9.04 0 01-2.12.136M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
              </svg>
            )}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm New Password"
            className="w-full border-b border-gray-300 py-2 pr-10 focus:border-black focus:outline-none text-black font-medium placeholder-gray-500"
            required
          />
        </div>

        {/* Checklist */}
        <div className="text-sm space-y-1 mt-2">
          <div className={`flex items-center ${isLengthValid ? 'text-green-600' : 'text-gray-400'}`}>
            <span className="mr-2">{isLengthValid ? '✓' : '○'}</span> At least 8 characters
          </div>
          <div className={`flex items-center ${hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
            <span className="mr-2">{hasNumber ? '✓' : '○'}</span> At least one number
          </div>
          <div className={`flex items-center ${hasSpecial ? 'text-green-600' : 'text-gray-400'}`}>
            <span className="mr-2">{hasSpecial ? '✓' : '○'}</span> At least one special character
          </div>
          <div className={`flex items-center ${isMatch ? 'text-green-600' : 'text-gray-400'}`}>
            <span className="mr-2">{isMatch ? '✓' : '○'}</span> Passwords match
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !isFormValid}
          className="w-full bg-black text-white font-bold uppercase tracking-widest py-3 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
