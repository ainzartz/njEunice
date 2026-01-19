"use client";

import { useState } from 'react';

export default function OptOutPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send a POST request to the API
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-xl w-full space-y-8">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-black border-b border-black pb-8 inline-block">
          Marketing Opt-Out
        </h1>

        {!submitted ? (
          <>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base font-light">
              Please enter your information below to be removed from our marketing communications.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6 text-left mt-8">
              <div>
                <label htmlFor="name" className="block text-sm font-bold uppercase tracking-wider text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  required
                  className="w-full border border-gray-300 p-3 rounded-none focus:outline-none focus:border-black transition-colors"
                  placeholder="Your Full Name"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-bold uppercase tracking-wider text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  required
                  className="w-full border border-gray-300 p-3 rounded-none focus:outline-none focus:border-black transition-colors"
                  placeholder="Your Phone Number"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-bold uppercase tracking-wider text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  id="email"
                  required
                  className="w-full border border-gray-300 p-3 rounded-none focus:outline-none focus:border-black transition-colors"
                  placeholder="Your Email Address"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-black text-white font-bold uppercase tracking-widest py-4 hover:bg-gray-800 transition-colors"
                >
                  Opt Out (수신 거부)
                </button>
              </div>
            </form>

            <div className="pt-8 border-t border-gray-100 mt-8">
              <a href="/" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
                Return to Home
              </a>
            </div>
          </>
        ) : (
          <div className="bg-gray-100 p-8 border border-gray-200 mt-8">
            <h3 className="text-2xl font-light text-black mb-4">Request Received</h3>
            <p className="text-gray-600">
              You have been successfully removed from our marketing list. <br />
              Please allow up to 48 hours for this change to take full effect.
            </p>
            <div className="pt-8">
              <button onClick={() => window.location.href = '/'} className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-500 transition-colors">
                Return to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
