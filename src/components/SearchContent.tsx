"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PropertyCard from '@/components/PropertyCard';

export default function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/listings/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Failed to fetch listings');
        const data = await res.json();
        setListings(data.data || []);
      } catch (err) {
        console.error(err);
        setError('Unable to load listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-900 mb-2">
          Search Results {query && <span>for <span className="font-bold">"{query}"</span></span>}
        </h1>
        <p className="text-gray-500">
          {listings.length} properties found
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-[4/3] w-full mb-4"></div>
              <div className="h-4 bg-gray-200 w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 w-2/3 mb-4"></div>
              <div className="h-4 bg-gray-200 w-full"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-gray-50">
          <p className="text-red-500">{error}</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 bg-gray-50">
          <p className="text-gray-500 mb-4">No listings found matching your search.</p>
          <button
            onClick={() => window.history.back()}
            className="text-black font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((listing) => (
            <PropertyCard key={listing.ListingKey} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
