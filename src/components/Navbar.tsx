"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-4' : 'bg-transparent py-6'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-widest uppercase">
          <span className={isScrolled ? 'text-black' : 'text-white'}>NJNY</span>
          <span className="text-gray-500">Realty</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8 items-center">
          {['Buy', 'Sell', 'Communities', 'About', 'Contact'].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className={`text-sm font-medium uppercase tracking-wider hover:text-gray-400 transition-colors ${isScrolled ? 'text-black' : 'text-white'
                }`}
            >
              {item}
            </Link>
          ))}
          <Link
            href="/login"
            className={`px-5 py-2 border text-sm font-medium uppercase tracking-wider transition-all ${isScrolled
              ? 'border-black text-black hover:bg-black hover:text-white'
              : 'border-white text-white hover:bg-white hover:text-black'
              }`}
          >
            Login
          </Link>
        </div>

        {/* Mobile Menu Button (Hamburger) - Placeholder */}
        <div className="md:hidden">
          <button className={isScrolled ? 'text-black' : 'text-white'}>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
