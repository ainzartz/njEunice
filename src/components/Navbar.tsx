"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

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

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === '/#about') {
      e.preventDefault();
      // Use window.location.hash logic or just scroll if we are on home
      if (pathname === '/') {
        const element = document.getElementById('about');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          // Update URL without jump if desired, or just let it be.
          // window.history.pushState({}, '', '/#about');
        }
      } else {
        // If not on home, just follow the link which will load home and scroll (handled by css smooth scroll)
        window.location.href = '/#about';
      }
    }
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-4' : 'bg-transparent py-6'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-widest uppercase">
          <span className={isScrolled ? 'text-black' : 'text-white'}>NJ Eunice's</span>
          <span className="text-gray-500 ml-2">Real Estate</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8 items-center">
          {['Buy', 'Sell', 'Lease', 'Commercial', 'About', 'Contact'].map((item) => {
            const href = item === 'About' ? '/#about' : `/${item.toLowerCase()}`;
            return (
              <Link
                key={item}
                href={href}
                onClick={(e) => handleLinkClick(e, href)}
                className={`text-sm font-medium uppercase tracking-wider hover:text-gray-400 transition-colors ${isScrolled ? 'text-black' : 'text-white'
                  }`}
              >
                {item}
              </Link>
            );
          })}
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
