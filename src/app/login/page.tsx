"use client";

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual login logic
    console.log("Login attempt:", email);
    alert("Login functionality is not yet implemented.");
  };

  return (
    <main className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar theme="light" />

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
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-gray-300 py-2 focus:border-black focus:outline-none transition-colors text-gray-900"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="mr-2 accent-black" />
                Remember me
              </label>
              <Link href="/forgot-password" className="hover:text-black transition-colors underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white font-bold uppercase tracking-widest py-4 hover:bg-gray-800 transition-colors"
            >
              Sign In
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

      <Footer />
    </main>
  );
}
