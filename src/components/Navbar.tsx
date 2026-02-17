"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';


interface NavbarProps {
  theme?: 'transparent' | 'light';
  user?: {
    firstName: string | null;
    email: string;
    isAdmin: boolean;
  } | null;
}

const Navbar = ({ theme = 'transparent', user }: NavbarProps) => {
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
        }
      } else {
        window.location.href = '/#about';
      }
    }
  };

  const isLightMode = theme === 'light' || isScrolled;



  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${isLightMode ? 'bg-white shadow-md py-4' : 'bg-transparent py-6'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-[129px] h-10">
            {/* If logo is white-only, invert filter can help in light mode. If colored, leave as is. Assuming colored. */}
            <Image
              src="/images/remax_now_Increase2.svg"
              alt="RE/MAX NOW"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className={`text-xl font-bold tracking-widest uppercase ${isLightMode ? '!text-black' : 'text-white'}`}>
              Eunice
            </span>
            <span className={`text-[10px] tracking-widest uppercase ${isLightMode ? '!text-gray-600' : 'text-gray-300'}`}>
              BEST REALTOR
            </span>
          </div>
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
                className={`text-sm font-medium uppercase tracking-wider hover:text-gray-400 transition-colors ${isLightMode ? '!text-black' : 'text-white'
                  }`}
              >
                {item}
              </Link>
            );
          })}

          {/* User Profile / Logout */}
          {user ? (
            <div className="relative group">
              <button
                className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${isLightMode ? '!text-black' : 'text-white'}`}
              >
                {user.firstName || user.email.split('@')[0]}
              </button>
              {/* Dropdown */}
              <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block">
                <div className="bg-white text-black shadow-lg rounded-md overflow-hidden border border-gray-200">
                  <Link
                    href="/profile"
                    className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 transition-colors uppercase tracking-wider text-gray-800"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      fetch('/api/auth/logout', { method: 'POST' }).then(() => {
                        window.location.href = '/';
                      });
                    }}
                    className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 transition-colors uppercase tracking-wider text-gray-800"
                  >
                    Log out
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Mobile Menu Button (Hamburger) - Placeholder */}
        <div className="md:hidden">
          <button className={isLightMode ? '!text-black' : 'text-white'}>
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
