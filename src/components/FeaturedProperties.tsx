"use client";

import { useState, useEffect } from 'react';
import PropertyCard from './PropertyCard';
import Link from 'next/link';

export default function FeaturedProperties() {
  const [listings, setListings] = useState<any[]>([]);
  const [isFallback, setIsFallback] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch('/api/mls-featured');
        const data = await res.json();
        if (data.success) {
          setListings(data.data || []);
          setIsFallback(data.isFallback || false);
        }
      } catch (error) {
        console.error('Failed to fetch featured listings:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gray-50 px-6">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h3 className="text-2xl font-bold uppercase tracking-widest mb-4">Featured Properties</h3>
          <div className="h-0.5 w-16 bg-black mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[4/5] bg-white border border-gray-200 animate-pulse"></div>
          ))}
        </div>
      </section>
    );
  }

  if (listings.length === 0) {
    return null; // Don't show the section if no featured listings found
  }

  return (
    <section className="py-20 bg-gray-50 px-6">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h3 className="text-2xl font-bold uppercase tracking-widest mb-4">
          {isFallback ? 'New Listings' : 'Featured Properties'}
        </h3>
        <p className="text-gray-400 text-sm tracking-[0.2em] mb-6 uppercase">
          {isFallback ? 'Latest to hit the market' : 'Exclusive Office Listings'}
        </p>
        <div className="h-0.5 w-16 bg-black mx-auto"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {listings.map((property) => (
          <PropertyCard key={property.L_ListingID} property={property} />
        ))}
      </div>

      <div className="text-center mt-16">
        <Link href="/buy" className="inline-flex items-center space-x-4 text-black font-bold uppercase tracking-[0.3em] group">
          <span className="border-b-2 border-black pb-2 group-hover:text-gray-500 group-hover:border-gray-500 transition-colors">
            View All Properties
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-2 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
