"use client";

import Script from 'next/script';

const Testimonials = () => {
  return (
    <div className="bg-white text-black py-24 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">Excellence in Service</h3>
        <h2 className="text-3xl md:text-5xl font-serif text-black">What Our Clients Say</h2>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Elfsight Widget Container */}
        <div className="elfsight-app-7ca6fcc3-8d8d-470b-a491-e89641e59ee7" data-elfsight-app-lazy></div>
      </div>

      {/* Load Elfsight Platform Script */}
      <Script src="https://elfsightcdn.com/platform.js" strategy="lazyOnload" />
    </div>
  );
};

export default Testimonials;
