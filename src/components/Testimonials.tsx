"use client";

import { useEffect, useState } from 'react';

const testimonials = [
  "Eunice helped us find our dream home in Closter! Highly recommended.",
  "Professional, knowledgeable, and patient. Best realtor in NJ.",
  "Sold our house in Fort Lee above asking price in record time!",
  "Eunice's market insights were invaluable for our investment property.",
  "A seamless experience from start to finish. Thank you, Eunice!",
  "Truly cares about her clients and goes the extra mile.",
];

const Testimonials = () => {
  return (
    <div className="bg-neutral-950 text-white py-24 overflow-hidden relative border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">Excellence in Service</h3>
        <h2 className="text-3xl md:text-5xl font-serif text-white">What Our Clients Say</h2>
      </div>

      {/* Marquee Container */}
      <div className="relative flex overflow-x-hidden">
        <div className="animate-marquee whitespace-nowrap flex space-x-24 items-center">
          {testimonials.concat(testimonials).map((text, index) => (
            <div key={index} className="mx-8 flex items-center">
              <span className="text-4xl text-gray-700 font-serif opacity-30 mr-4">“</span>
              <span className="text-xl md:text-3xl font-serif text-gray-200 tracking-wide leading-relaxed">
                {text}
              </span>
              <span className="text-4xl text-gray-700 font-serif opacity-30 ml-4">”</span>
            </div>
          ))}
        </div>

        {/* Duplicate for seamless loop */}
        <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex space-x-24 items-center">
          {testimonials.concat(testimonials).map((text, index) => (
            <div key={`dup-${index}`} className="mx-8 flex items-center">
              <span className="text-4xl text-gray-700 font-serif opacity-30 mr-4">“</span>
              <span className="text-xl md:text-3xl font-serif text-gray-200 tracking-wide leading-relaxed">
                {text}
              </span>
              <span className="text-4xl text-gray-700 font-serif opacity-30 ml-4">”</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gradient Masks */}
      <div className="absolute top-0 left-0 h-full w-32 bg-gradient-to-r from-neutral-950 to-transparent z-10"></div>
      <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-neutral-950 to-transparent z-10"></div>

      <style jsx>{`
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
        .animate-marquee2 {
          animation: marquee2 60s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes marquee2 {
          0% { transform: translateX(100%); }
          100% { transform: translateX(0%); }
        }
      `}</style>
    </div>
  );
};

export default Testimonials;
