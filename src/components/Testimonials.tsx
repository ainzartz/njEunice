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
    <div className="bg-black text-white py-12 overflow-hidden relative border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
        <h3 className="text-xl font-bold uppercase tracking-widest text-gray-400">Client Success Stories</h3>
      </div>

      {/* Marquee Container */}
      <div className="relative flex overflow-x-hidden">
        <div className="animate-marquee whitespace-nowrap flex space-x-12">
          {testimonials.concat(testimonials).map((text, index) => (
            <span key={index} className="text-lg md:text-2xl font-light text-gray-300 mx-4">
              “{text}”
            </span>
          ))}
        </div>

        {/* Duplicate for seamless loop (absolute positioning approach often safer or just doubling content above) */}
        <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex space-x-12">
          {testimonials.concat(testimonials).map((text, index) => (
            <span key={`dup-${index}`} className="text-lg md:text-2xl font-light text-gray-300 mx-4">
              “{text}”
            </span>
          ))}
        </div>
      </div>

      {/* Gradient Masks */}
      <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-black to-transparent z-10"></div>
      <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-black to-transparent z-10"></div>

      <style jsx>{`
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .animate-marquee2 {
          animation: marquee2 25s linear infinite;
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
