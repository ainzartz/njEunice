"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const Hero = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const [bgImage, setBgImage] = useState("/images/hero-bg.png");

  useEffect(() => {
    const heroImages = [
      '/images/hero-bg.png',
      '/images/hero-bg-1.png',
      '/images/hero-bg-2.png',
      '/images/hero-bg-3.png',
      '/images/hero-bg-4.png',
      '/images/hero-bg-5.png',
      '/images/hero-bg-6.png',
      '/images/hero-bg-7.png',
      '/images/hero-bg-8.png',
      '/images/hero-bg-9.png',
      '/images/hero-bg-10.png',
      '/images/hero-bg-11.png',
      '/images/hero-bg-12.png',
      '/images/hero-bg-13.png',
      '/images/hero-bg-14.png',
    ];
    const randomImage = heroImages[Math.floor(Math.random() * heroImages.length)];
    setBgImage(randomImage);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    } else {
      router.push('/search');
    }
  };

  return (
    <div className="relative h-screen min-h-[600px] w-full flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage}
          alt="Luxury Interior"
          fill
          className="object-cover brightness-75"
          priority
        />
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl w-full">
        <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-4">
          Discover Your <span className="font-bold">Dream Home</span>
        </h1>
        <p className="text-lg md:text-xl font-light tracking-wide mb-10 text-gray-200">
          Premier Real Estate in New Jersey
        </p>

        {/* Search Bar - Modern & Minimal */}
        <form onSubmit={handleSearch} className="bg-white p-2 rounded-lg shadow-2xl max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-2">
          <div className="flex-1 w-full relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Enter an address, neighborhood, city, or ZIP code"
              className="w-full pl-10 pr-4 py-3 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full md:w-auto bg-black text-white font-medium uppercase tracking-wider py-3 px-8 rounded-md hover:bg-gray-800 transition-colors"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
};

export default Hero;
