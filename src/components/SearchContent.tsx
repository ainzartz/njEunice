"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PropertyCard from '@/components/PropertyCard';
import UnsupportedSearchArea from '@/components/UnsupportedSearchArea';

export default function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || '';

  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unsupportedData, setUnsupportedData] = useState<any>(null);

  // Filter States
  const [filters, setFilters] = useState({
    residential: true,
    rentals: true,
    commercial: true
  });

  useEffect(() => {
    if (initialType === 'rent') {
      setFilters({ residential: false, rentals: true, commercial: false });
    } else if (initialType === 'sale') {
      setFilters({ residential: true, rentals: false, commercial: false });
    } else if (initialType === 'commercial') {
      setFilters({ residential: false, rentals: false, commercial: true });
    }
  }, [initialType]);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError('');
      setUnsupportedData(null);
      try {
        const url = new URL('/api/mls-search', window.location.origin);
        if (query) url.searchParams.append('q', query);
        // We fetch everything to allow client-side filtering

        const res = await fetch(url.toString());
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

  // Derived filtered listings
  const filteredListings = listings.filter(item => {
    const cls = item.mlsClass;
    const isRes = ['RE_1', 'CT_3', 'MF_2'].includes(cls);
    const isRent = cls === 'RN_4';
    const isComm = ['CM_5', 'BU_7'].includes(cls);

    if (filters.residential && isRes) return true;
    if (filters.rentals && isRent) return true;
    if (filters.commercial && isComm) return true;

    return false;
  });

  const toggleFilter = (key: keyof typeof filters) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-4xl font-light text-gray-900 mb-2">
            Search Results {query && <span>for <span className="font-bold italic">"{query}"</span></span>}
          </h1>
          <p className="text-gray-500 font-light">
            {filteredListings.length} {filteredListings.length === 1 ? 'property' : 'properties'} found
            {listings.length > filteredListings.length && ` (from ${listings.length} total)`}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mr-2">Filter by:</span>

          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.residential}
              onChange={() => toggleFilter('residential')}
              className="w-4 h-4 accent-black rounded border-gray-300"
            />
            <span className={`text-sm tracking-tight transition-colors ${filters.residential ? 'text-black font-bold' : 'text-gray-400 group-hover:text-gray-600'}`}>Residential</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.rentals}
              onChange={() => toggleFilter('rentals')}
              className="w-4 h-4 accent-black rounded border-gray-300"
            />
            <span className={`text-sm tracking-tight transition-colors ${filters.rentals ? 'text-black font-bold' : 'text-gray-400 group-hover:text-gray-600'}`}>Rentals</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.commercial}
              onChange={() => toggleFilter('commercial')}
              className="w-4 h-4 accent-black rounded border-gray-300"
            />
            <span className={`text-sm tracking-tight transition-colors ${filters.commercial ? 'text-black font-bold' : 'text-gray-400 group-hover:text-gray-600'}`}>Commercial</span>
          </label>
        </div>
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
      ) : filteredListings.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500 mb-6 italic text-lg">
            {listings.length === 0 ? 'No listings found matching your search.' : 'No listings match the selected filters.'}
          </p>
          <button
            onClick={() => {
              if (listings.length === 0) window.history.back();
              else setFilters({ residential: true, rentals: true, commercial: true });
            }}
            className="text-black font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-600 transition-colors"
          >
            {listings.length === 0 ? 'Go Back' : 'Clear Filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {filteredListings.map((listing) => (
            <PropertyCard key={listing.L_ListingID} property={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
