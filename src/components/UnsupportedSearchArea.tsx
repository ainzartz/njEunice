
"use client";

import React from 'react';

interface UnsupportedSearchAreaProps {
  supportedData: {
    name: string;
    cities: string[];
  }[];
}

export default function UnsupportedSearchArea({ supportedData }: UnsupportedSearchAreaProps) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20 text-center">
      <div className="mb-16">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <h1 className="text-4xl font-light text-gray-900 mb-6 italic tracking-tight">
          Search Area Not Supported
        </h1>
        <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
          Our website currently specializes in select premium regions of New Jersey.<br />
          Please find our current target service areas listed below by county.
        </p>
      </div>

      <div className="space-y-12 text-left">
        {supportedData.map((county) => (
          <div key={county.name} className="bg-gray-50 rounded-3xl p-10 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-8 border-b border-gray-200 pb-6">
              <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-bold mr-4">
                {county.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{county.name} County</h2>
                <p className="text-sm text-gray-400 uppercase tracking-widest font-bold mt-1">
                  {county.cities.length} Supported Cities
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
              {county.cities.map(city => (
                <div key={city} className="flex items-center text-gray-600 hover:text-black transition-colors group">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-3 group-hover:bg-black transition-colors"></span>
                  <span className="text-lg font-light tracking-tight">{city}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-24">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center space-x-4 text-black font-bold uppercase tracking-[0.3em] group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 group-hover:-translate-x-2 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          <span className="border-b-2 border-black pb-2 hover:text-gray-500 hover:border-gray-500 transition-colors">
            Return to Search
          </span>
        </button>
      </div>
    </div>
  );
}

