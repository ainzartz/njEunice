"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';


interface NavbarProps {
  theme?: 'transparent' | 'light';
  user?: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    isAdmin: boolean;
  } | null;
}

const Navbar = ({ theme = 'transparent', user }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    setIsMenuOpen(false); // Close mobile menu on click
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const isLightMode = theme === 'light' || isScrolled;



  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isLightMode ? 'bg-white shadow-md py-4' : 'bg-transparent py-6'
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
                {(user.firstName || user.lastName) ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : user.email.split('@')[0]}
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
                  {user.isAdmin && (
                    <Link
                      href="/admin"
                      className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 transition-colors uppercase tracking-wider text-gray-800"
                    >
                      Administrator
                    </Link>
                  )}
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

        {/* Mobile Menu Button (Hamburger) */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className={`transition-colors ${isLightMode ? '!text-black' : 'text-white'}`}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed inset-0 bg-white z-[60] transform transition-transform duration-500 ease-in-out md:hidden ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'
          }`}
      >
        <div className="flex flex-col h-full bg-white">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
            <span className="text-xl font-bold tracking-widest uppercase text-black">Menu</span>
            <button onClick={toggleMenu} className="text-black p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-grow flex flex-col items-center justify-center space-y-8 py-12 px-6">
            {['Buy', 'Sell', 'Lease', 'Commercial', 'About', 'Contact'].map((item) => {
              const href = item === 'About' ? '/#about' : `/${item.toLowerCase()}`;
              return (
                <Link
                  key={item}
                  href={href}
                  onClick={(e) => handleLinkClick(e, href)}
                  className="text-2xl font-light uppercase tracking-[0.2em] text-black hover:text-gray-500 transition-colors"
                >
                  {item}
                </Link>
              );
            })}

            {user && (
              <>
                <div className="w-12 h-[1px] bg-gray-200 my-4"></div>
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-sm font-bold uppercase tracking-widest text-black"
                >
                  Profile
                </Link>
                {user.isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-sm font-bold uppercase tracking-widest text-black"
                  >
                    Administrator
                  </Link>
                )}
                <button
                  onClick={() => {
                    fetch('/api/auth/logout', { method: 'POST' }).then(() => {
                      window.location.href = '/';
                    });
                  }}
                  className="text-sm font-bold uppercase tracking-widest text-red-600 pt-4"
                >
                  Log out
                </button>
              </>
            )}
          </div>

          <div className="p-8 text-center bg-gray-50">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-loose">
              460 Bergen Blvd. Suite 120 <br />
              Palisades Park, NJ 07650 <br />
              C: 201.290.5256
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
