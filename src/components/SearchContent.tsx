"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import PropertyCard from '@/components/PropertyCard';
import UnsupportedSearchArea from '@/components/UnsupportedSearchArea';
import Footer from '@/components/Footer';
import SearchResultsMap from '@/components/SearchResultsMap';
import { SearchSkeleton } from '@/components/SearchSkeleton';
import { Map, LayoutGrid } from 'lucide-react';

export default function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || '';
  const isFeatured = searchParams.get('featured') === 'true';

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

  // View Mode State
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Advanced Search States
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [advFilters, setAdvFilters] = useState({
    minPrice: '',
    maxPrice: '',
    beds: 0,
    baths: 0,
    selectedStyles: [] as string[]
  });
  const [appliedAdvFilters, setAppliedAdvFilters] = useState(advFilters);

  const getPropertyType = (type: string, mlsClass: string, style: string) => {
    if (mlsClass === 'CM_5' || mlsClass === 'BU_7') return 'Commercial';
    if (!type) return null;
    const isSaleClass = ['RE_1', 'CT_3', 'MF_2'].includes(mlsClass || 'RE_1');
    const s = (style || '').toLowerCase();

    // Style-based overrides
    if (s.includes('duplex')) return 'Multi-Floor';
    if (s.includes('condo')) return 'Condo';
    if (s.includes('co-op') || s.includes('coop')) return 'Co-op';
    if (s.includes('townhouse')) return 'Townhouse';
    if (s.includes('single family')) return 'Single Family';

    switch (type) {
      case '1': return 'Single Family';
      case '7':
      case '9':
      case '18':
      case '28':
        return isSaleClass ? 'Single Family' : 'Apartment';
      case '12': return 'Condo';
      case '14': return 'Co-op';
      case '16': return 'Multi-Floor';
      case '17':
        return s.includes('ranch') || s.includes('col') || s.includes('split') ? 'Single Family' : 'Multi-Floor';
      case '19': return 'Condo';
      case '20': return 'Condo';
      case '21': return 'Condo';
      case '26': return 'Townhouse';
      default: return null;
    }
  };

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
        const apiUrl = isFeatured ? '/api/mls-featured' : '/api/mls-search';
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (isFeatured) params.append('all', 'true');

        const queryString = params.toString();
        const res = await fetch(`${apiUrl}${queryString ? `?${queryString}` : ''}`);
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
        setError(err.message || 'Unable to load listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [query]);

  // Derived filtered listings memoized to prevent Map re-render on input changes
  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      const cls = item.mlsClass;
      const isRes = ['RE_1', 'CT_3', 'MF_2'].includes(cls);
      const isRent = cls === 'RN_4';
      const isComm = ['CM_5', 'BU_7'].includes(cls);

      // Basic Categories
      let match = false;
      if (filters.residential && isRes) match = true;
      if (filters.rentals && isRent) match = true;
      if (filters.commercial && isComm) match = true;

      if (!match) return false;

      // Advanced Filters
      const f = appliedAdvFilters;

      // Price
      const price = parseInt(item.L_AskingPrice || '0', 10);
      if (f.minPrice && price < parseInt(f.minPrice, 10)) return false;
      if (f.maxPrice && price > parseInt(f.maxPrice, 10)) return false;

      // Beds / Baths
      const itemBeds = parseInt(item.LM_Int1_1 || item.L_BedroomsTotal || '0', 10);
      const itemBaths = parseInt(item.LM_Int1_19 || item.L_BathsFull || '0', 10);
      if (f.beds > 0 && itemBeds < f.beds) return false;
      if (f.baths > 0 && itemBaths < f.baths) return false;

      // Style
      if (f.selectedStyles.length > 0) {
        const pType = getPropertyType(item.L_Type_, item.mlsClass, item.LM_Char10_7);
        if (!pType || !f.selectedStyles.includes(pType)) return false;
      }

      return true;
    });
  }, [listings, filters, appliedAdvFilters]);

  const handleApplyFilters = () => {
    setAppliedAdvFilters({ ...advFilters });
    setIsAdvancedOpen(false);
  };

  const handleResetAdvanced = () => {
    const defaultFilters = {
      minPrice: '',
      maxPrice: '',
      beds: 0,
      baths: 0,
      selectedStyles: []
    };
    setAdvFilters(defaultFilters);
    setAppliedAdvFilters(defaultFilters);
    // Also reset basic filters to default (all true) to ensure results show up
    setFilters({ residential: true, rentals: true, commercial: true });
  };

  const formatWithCommas = (value: string) => {
    const num = value.replace(/,/g, '');
    if (!num || isNaN(Number(num))) return '';
    return Number(num).toLocaleString('en-US');
  };

  const removeCommas = (value: string) => {
    return value.replace(/,/g, '');
  };

  const toggleFilter = (key: keyof typeof filters) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const removeFilter = (type: string, value?: string) => {
    const newFilters = { ...appliedAdvFilters };
    if (type === 'price') {
      newFilters.minPrice = '';
      newFilters.maxPrice = '';
    } else if (type === 'style' && value) {
      newFilters.selectedStyles = newFilters.selectedStyles.filter(s => s !== value);
    } else if (type === 'beds') {
      newFilters.beds = 0;
    } else if (type === 'baths') {
      newFilters.baths = 0;
    }
    setAppliedAdvFilters(newFilters);
    setAdvFilters(newFilters);
  };

  const getActiveFilterTags = () => {
    const tags: { id: string; label: string; type: string; value?: string }[] = [];
    const f = appliedAdvFilters;

    if (f.minPrice || f.maxPrice) {
      const min = f.minPrice ? `$${formatWithCommas(f.minPrice)}` : 'Min';
      const max = f.maxPrice ? `$${formatWithCommas(f.maxPrice)}` : 'Max';
      tags.push({ id: 'price', label: `${min} — ${max}`, type: 'price' });
    }

    f.selectedStyles.forEach(style => {
      tags.push({ id: `style-${style}`, label: style, type: 'style', value: style });
    });

    if (f.beds > 0) {
      tags.push({ id: 'beds', label: `${f.beds} Beds`, type: 'beds' });
    }

    if (f.baths > 0) {
      tags.push({ id: 'baths', label: `${f.baths} Baths`, type: 'baths' });
    }

    return tags;
  };

  const activeFilterTags = getActiveFilterTags();

  if (unsupportedData) {
    return <UnsupportedSearchArea supportedData={unsupportedData} />;
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Non-scrolling Header Section */}
      <div className="max-w-7xl w-full mx-auto px-6 pt-6 pb-2">
        <div className="pb-2 mb-2">
          <h1 className="text-4xl font-light text-gray-900 mb-6">
            {isFeatured ? 'Featured Properties' : (
              <>Search Results {query && <span>for <span className="font-bold italic">"{query}"</span></span>}</>
            )}
          </h1>

          <div className="flex flex-col space-y-4">
            {/* Top Row: Count and Controls */}
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <p className="text-gray-500 font-light text-sm">
                  {filteredListings.length} {filteredListings.length === 1 ? 'property' : 'properties'} found
                  {listings.length > filteredListings.length && ` (from ${listings.length} total)`}
                </p>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'list'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                      }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'map'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                      }`}
                  >
                    <Map className="w-4 h-4" />
                    Map
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-10">
                <div className="flex flex-wrap gap-4 items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mr-2">Basic Filter:</span>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.residential}
                      onChange={() => toggleFilter('residential')}
                      className="w-4 h-4 accent-black rounded border-gray-300"
                    />
                    <span className={`text-sm tracking-tight transition-colors ${filters.residential ? 'text-black font-semibold' : 'text-gray-400 group-hover:text-gray-600'}`}>Sale</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.rentals}
                      onChange={() => toggleFilter('rentals')}
                      className="w-4 h-4 accent-black rounded border-gray-300"
                    />
                    <span className={`text-sm tracking-tight transition-colors ${filters.rentals ? 'text-black font-semibold' : 'text-gray-400 group-hover:text-gray-600'}`}>Lease</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.commercial}
                      onChange={() => toggleFilter('commercial')}
                      className="w-4 h-4 accent-black rounded border-gray-300"
                    />
                    <span className={`text-sm tracking-tight transition-colors ${filters.commercial ? 'text-black font-semibold' : 'text-gray-400 group-hover:text-gray-600'}`}>Commercial</span>
                  </label>
                </div>

                <button
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 hover:text-blue-800 transition-colors py-2 group whitespace-nowrap"
                >
                  <span>Advance Filter</span>
                  <svg
                    className={`w-3 h-3 transition-transform duration-300 ${isAdvancedOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Bottom Row: Active Filter Tags (No Borders) */}
            {activeFilterTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mr-1">Applied:</span>
                {activeFilterTags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => removeFilter(tag.type, tag.value)}
                    className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-black px-2 py-1 rounded-full text-[10px] font-medium transition-colors group"
                  >
                    <span>{tag.label}</span>
                    <svg className="w-2.5 h-2.5 text-gray-400 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ))}
                <button
                  onClick={handleResetAdvanced}
                  className="text-[9px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors ml-1"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Search Accordion */}
      <div className={`max-w-7xl w-full mx-auto px-6 transition-all duration-300 ease-in-out ${isAdvancedOpen ? 'opacity-100 py-8 border-b border-gray-100 mb-8' : 'h-0 overflow-hidden opacity-0 py-0'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Price Range */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Price Range ($)</h4>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Min"
                value={formatWithCommas(advFilters.minPrice)}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setAdvFilters(prev => ({ ...prev, minPrice: val }));
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-sm px-3 py-2 text-sm text-black focus:outline-none focus:border-black focus:ring-0 placeholder:text-gray-400 transition-colors"
              />
              <span className="text-gray-300">—</span>
              <input
                type="text"
                placeholder="Max"
                value={formatWithCommas(advFilters.maxPrice)}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setAdvFilters(prev => ({ ...prev, maxPrice: val }));
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-sm px-3 py-2 text-sm text-black focus:outline-none focus:border-black focus:ring-0 placeholder:text-gray-400 transition-colors"
              />
            </div>
          </div>

          {/* Property Style */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Property Style</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6">
              {['Single Family', 'Condo', 'Co-op', 'Townhouse', 'Multi-Floor', 'Apartment'].map(style => (
                <label key={style} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={advFilters.selectedStyles.includes(style)}
                    onChange={() => {
                      const newStyles = advFilters.selectedStyles.includes(style)
                        ? advFilters.selectedStyles.filter(s => s !== style)
                        : [...advFilters.selectedStyles, style];
                      setAdvFilters(prev => ({ ...prev, selectedStyles: newStyles }));
                    }}
                    className="w-4 h-4 accent-black rounded border-gray-300"
                  />
                  <span className={`text-sm transition-colors ${advFilters.selectedStyles.includes(style) ? 'text-black font-semibold' : 'text-gray-500 group-hover:text-gray-800'}`}>{style}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Beds / Baths */}
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-8">
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Min Beds</h4>
                <div className="flex items-center border border-gray-200 rounded-sm bg-white overflow-hidden w-28">
                  <button
                    onClick={() => setAdvFilters(prev => ({ ...prev, beds: Math.max(0, prev.beds - 1) }))}
                    className="flex-1 px-3 py-2 hover:bg-gray-50 text-gray-600 transition-colors"
                  >–</button>
                  <span className="flex-1 text-center text-sm font-bold border-x border-gray-100 text-black">{advFilters.beds}</span>
                  <button
                    onClick={() => setAdvFilters(prev => ({ ...prev, beds: prev.beds + 1 }))}
                    className="flex-1 px-3 py-2 hover:bg-gray-50 text-gray-600 transition-colors"
                  >+</button>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Min Baths</h4>
                <div className="flex items-center border border-gray-200 rounded-sm bg-white overflow-hidden w-28">
                  <button
                    onClick={() => setAdvFilters(prev => ({ ...prev, baths: Math.max(0, prev.baths - 1) }))}
                    className="flex-1 px-3 py-2 hover:bg-gray-50 text-gray-600 transition-colors"
                  >–</button>
                  <span className="flex-1 text-center text-sm font-bold border-x border-gray-100 text-black">{advFilters.baths}</span>
                  <button
                    onClick={() => setAdvFilters(prev => ({ ...prev, baths: prev.baths + 1 }))}
                    className="flex-1 px-3 py-2 hover:bg-gray-50 text-gray-600 transition-colors"
                  >+</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-4">
          <button
            onClick={handleResetAdvanced}
            className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 hover:text-black transition-colors"
          >
            Clear Filters
          </button>
          <button
            onClick={handleApplyFilters}
            className="px-10 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-[0.3em] rounded-sm hover:bg-gray-800 transition-colors shadow-lg shadow-black/5"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Scrollable Listings and Footer */}
      <div className="flex-grow overflow-y-auto scroll-smooth">
        <div className="max-w-7xl mx-auto px-6 pb-12 pt-4">
          {loading ? (
            viewMode === 'map' ? (
              <div className="w-full h-[600px] bg-gray-50 rounded-lg border border-gray-200 flex flex-col items-center justify-center animate-pulse">
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-gray-500 font-medium tracking-widest uppercase text-xs">Initializing Map Search...</p>
              </div>
            ) : (
              <SearchSkeleton />
            )
          ) : error ? (
            <div className="text-center py-20 bg-gray-50 rounded-lg border border-red-100">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-black font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-6 italic text-lg">
                {listings.length === 0 ? 'No listings found matching your search.' : 'No listings match the selected filters.'}
              </p>
              <button
                onClick={handleResetAdvanced}
                className="text-black font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-600 transition-colors"
              >
                {listings.length === 0 ? 'Go Back' : 'Clear All Filters'}
              </button>
            </div>
          ) : viewMode === 'map' ? (
            <SearchResultsMap listings={filteredListings} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {filteredListings.map((listing) => (
                <PropertyCard key={listing.L_ListingID} property={listing} />
              ))}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
}
