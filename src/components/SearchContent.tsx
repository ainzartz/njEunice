"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PropertyCard from '@/components/PropertyCard';
import UnsupportedSearchArea from '@/components/UnsupportedSearchArea';

export default function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unsupportedData, setUnsupportedData] = useState<any>(null);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError('');
      setUnsupportedData(null);
      try {
        const res = await fetch(`/api/mls-search?q=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (data.errorType === 'UNSUPPORTED_REGION') {
          setUnsupportedData(data.supportedData);
          setListings([]);
        } else if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch listings');
        } else {
          setListings(data.data || []);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Unable to load listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [query]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8 animate-pulse">
          <div className="h-10 bg-gray-100 w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-100 w-1/4"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-100 aspect-[4/3] w-full mb-4 rounded-xl"></div>
              <div className="h-4 bg-gray-100 w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-100 w-2/3 mb-4"></div>
              <div className="h-4 bg-gray-100 w-full mb-1"></div>
              <div className="h-4 bg-gray-100 w-5/6"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (unsupportedData) {
    return <UnsupportedSearchArea supportedData={unsupportedData} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-900 mb-2">
          Search Results {query && <span>for <span className="font-bold italic">"{query}"</span></span>}
        </h1>
        <p className="text-gray-500">
          {listings.length} properties found
        </p>
      </div>

      {error ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-black font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500 mb-6 italic text-lg">No listings found matching your search.</p>
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
            <PropertyCard key={listing.L_ListingID} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
