"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PropertyCard from '@/components/PropertyCard';
import UnsupportedSearchArea from '@/components/UnsupportedSearchArea';

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
            {isFeatured ? 'Featured Properties' : (
              <>Search Results {query && <span>for <span className="font-bold italic">"{query}"</span></span>}</>
            )}
          </h1>
          <p className="text-gray-500 font-light">
            {filteredListings.length} {filteredListings.length === 1 ? 'property' : 'properties'} found
            {listings.length > filteredListings.length && ` (from ${listings.length} total)`}
          </p>
        </div>

        <div className="flex flex-wrap lg:flex-nowrap items-center justify-end gap-10">
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

      {/* Advanced Search Accordion */}
      <div className={`overflow-hidden transition-all duration-500 ease-in-out border-b border-gray-100 ${isAdvancedOpen ? 'max-h-[800px] mb-12 opacity-100 py-8' : 'max-h-0 opacity-0 py-0'}`}>
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
                  const val = e.target.value.replace(/\D/g, ''); // Strictly only digits
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
                  const val = e.target.value.replace(/\D/g, ''); // Strictly only digits
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
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Minimum Beds</h4>
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
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Minimum Baths</h4>
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

            <div className="flex gap-4 pt-4">
              <button
                onClick={handleApplyFilters}
                className="flex-grow bg-black text-white text-[10px] font-bold uppercase tracking-[0.3em] py-3 rounded-sm hover:bg-gray-800 transition-colors shadow-lg shadow-black/5"
              >
                Apply Filters
              </button>
              <button
                onClick={handleResetAdvanced}
                className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Tags */}
      {activeFilterTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mr-1">Active Filters:</span>
          {activeFilterTags.map(tag => (
            <button
              key={tag.id}
              onClick={() => removeFilter(tag.type, tag.value)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-black px-3 py-1.5 rounded-full text-xs font-medium transition-colors group"
            >
              <span>{tag.label}</span>
              <svg className="w-3 h-3 text-gray-400 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ))}
          <button
            onClick={handleResetAdvanced}
            className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors ml-2"
          >
            Clear All
          </button>
        </div>
      )}

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
            onClick={handleResetAdvanced}
            className="text-black font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-600 transition-colors"
          >
            {listings.length === 0 ? 'Go Back' : 'Clear All Filters'}
          </button>
        </div>
      ) : (
        <div className="custom-scrollbar pr-4 -mr-4 max-h-[calc(100vh-450px)] overflow-y-auto overflow-x-hidden scroll-smooth min-h-[400px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 pb-12">
            {filteredListings.map((listing) => (
              <PropertyCard key={listing.L_ListingID} property={listing} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
