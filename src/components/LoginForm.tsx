"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    if (showPassword) {
      setShowPassword(false);
    } else {
      setShowPassword(true);
      setTimeout(() => {
        setShowPassword(false);
      }, 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.mustChangePassword && data.redirect) {
          window.location.href = data.redirect;
        } else {
          window.location.href = '/';
        }
      } else if (res.status === 403 && data.resetRequired) {
        alert(data.error);
        window.location.href = '/auth/reset-request';
      } else {
        setError(data.error || 'Login failed');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {error && (
        <div className="fixed top-24 left-0 w-full flex justify-center z-50 pointer-events-none">
          <div className="bg-black text-white px-6 py-4 rounded-lg shadow-xl flex items-center space-x-3 pointer-events-auto animate-toast">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <span className="font-medium text-sm">{error}</span>
          </div>
        </div>
      )}

      <div className="flex-grow flex items-center justify-center px-6 pt-24 pb-12">
        <div className="w-full max-w-md bg-white p-8 md:p-12 shadow-2xl border border-gray-100">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-light text-gray-900 tracking-wide mb-2">
              Welcome Back
            </h1>
            <p className="text-sm text-gray-500 uppercase tracking-widest">
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b border-gray-300 py-2 focus:border-black focus:outline-none transition-colors text-gray-900"
                placeholder="name@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-b border-gray-300 py-2 pr-10 focus:border-black focus:outline-none transition-colors text-gray-900"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a9.04 9.04 0 012.12-.136C18.477 3 22.268 5.943 23.543 10a9.97 9.97 0 01-1.563 3.029m-5.858 5.908a9.04 9.04 0 01-2.12.136M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="mr-2 accent-black" />
                Remember me
              </label>
              <Link
                href={email ? `/auth/reset-request?email=${encodeURIComponent(email)}` : '#'}
                className={`${email ? 'hover:text-black underline cursor-pointer' : 'pointer-events-none text-gray-300 cursor-not-allowed'} transition-colors ml-auto text-xs`}
                aria-disabled={!email}
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white font-bold uppercase tracking-widest py-4 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-gray-500">
            <p>Don't have an account?</p>
            <Link href="/register" className="font-bold text-black border-b border-black mt-2 inline-block hover:text-gray-600 transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
