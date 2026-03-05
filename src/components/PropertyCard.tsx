
import Image from 'next/image';
import Link from 'next/link';

interface PropertyCardProps {
  listing: any; // Using any for mock simplisity, define interface later
}

import { useEffect, useState } from 'react';

const PropertyCard = ({ property: listing }: any) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    if (listing.L_ListingID) {
      setIsImageLoading(true);
      fetch(`/api/mls-image?id=${listing.L_ListingID}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.images && data.images.length > 0) {
            setImageUrl(data.images[0]); // Best practice: Use the first image as the cover
          } else {
            setImageUrl(null); // Explicitly no image
          }
        })
        .catch(err => {
          setImageUrl(null);
        })
        .finally(() => {
          setIsImageLoading(false);
        });
    } else {
      setIsImageLoading(false);
    }
  }, [listing.L_ListingID]);

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  // Safely parse price
  const price = listing.L_AskingPrice ? parseInt(listing.L_AskingPrice, 10) : 0;
  const formattedPrice = price > 0 ? formatter.format(price) : 'Price Upon Request';

  // Format Address
  const address = `${listing.L_AddressNumber || ''} ${listing.L_AddressStreet || ''}`.trim() || 'Address Unavailable';
  const city = listing.L_City || '';
  const state = listing.L_State || 'NJ';
  const zip = listing.L_Zip || '';

  // Determine Sale/Rent
  const isRent = listing.propertyType === 'rent' || listing.L_SaleRent === 'R' || listing.L_SaleRent === 'Rent';
  const displayPrice = isRent ? `${formattedPrice}/mo` : formattedPrice;

  // Status Labels
  const statusMap: Record<string, string> = {
    '1': 'Active',
    '2': 'Sold',
    '3': 'Under Contract',
    '4': 'Expired',
    '5': 'Withdrawn',
    '6': 'Leased'
  };
  const statusLabel = statusMap[listing.L_StatusCatID] || 'Active';
  const isSold = listing.L_StatusCatID === '2' || listing.L_StatusCatID === '6';

  const dateStr = listing.L_ListingDate;
  let formattedDate = '';
  if (dateStr) {
    try {
      const date = new Date(dateStr);
      formattedDate = date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      // Quietly fail
    }
  }

  const getPropertyType = (type: string, mlsClass?: string, style?: string) => {
    if (mlsClass === 'CM_5' || mlsClass === 'BU_7') return 'Commercial';

    // Normalize style for checking
    const s = (style || '').toLowerCase();

    // Direct style overrides
    if (s.includes('duplex')) return 'Multi-Floor';
    if (s.includes('condo')) return 'Condo';
    if (s.includes('co-op') || s.includes('coop')) return 'Co-op';
    if (s.includes('townhouse')) return 'Townhouse';
    if (s.includes('single family')) return 'Single Family';

    const isSaleClass = ['RE_1', 'CT_3', 'MF_2'].includes(mlsClass || '');

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
        // For Type 17, if it's not explicitly a duplex in style, it's often a single family in rental class
        return s.includes('ranch') || s.includes('col') || s.includes('split') ? 'Single Family' : 'Multi-Floor';
      case '19': return 'Condo';
      case '20': return 'Condo';
      case '21': return 'Condo';
      case '26': return 'Townhouse';
      default: return null;
    }
  };

  const propertyTypeName = getPropertyType(listing.L_Type_, listing.mlsClass, listing.LM_Char10_7);
  const unit = listing.L_AddressUnit ? `, Unit ${listing.L_AddressUnit}` : '';

  const isResidential = ['RE_1', 'CT_3', 'RN_4', 'MF_2'].includes(listing.mlsClass || 'RE_1');
  const isStudio = isResidential && (!listing.LM_Int1_1 || listing.LM_Int1_1 === '0') && (!listing.L_BedroomsTotal || listing.L_BedroomsTotal === '0');

  return (
    <Link href={`/property/${listing.L_ListingID}?class=${listing.mlsClass || 'RE_1'}`} className="group block h-full">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 flex flex-col h-full group-hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {isImageLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 animate-pulse">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
          ) : imageUrl ? (
            <Image
              src={imageUrl}
              alt={address}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-3 px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div className="flex flex-col gap-1">
                {listing.L_ListingDate === '2026-03-04' && (
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">New Listing</span>
                )}
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Photo Coming Soon</span>
              </div>
            </div>
          )}
          {statusLabel !== 'Active' && (
            <div className={`absolute top-3 left-3 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-sm uppercase tracking-widest shadow-lg ${isSold ? 'bg-red-600/90' : 'bg-orange-500/90'}`}>
              {statusLabel}
            </div>
          )}
          <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
            <div className="bg-white/90 backdrop-blur-md text-black text-[10px] font-bold px-3 py-1.5 rounded-sm uppercase tracking-widest shadow-lg">
              {isRent ? 'For Lease' : 'For Sale'}
            </div>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-baseline mb-1">
            <h4 className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors">
              {displayPrice}
            </h4>
            {isResidential && (
              <div className="flex gap-3 text-xl font-bold text-slate-900 tracking-tight">
                <span>
                  {isStudio ? 'Studio' : `${listing.LM_Int1_1 || listing.L_BedroomsTotal || '-'} Bed`}
                </span>
                <span>
                  {listing.LM_Int1_19 || listing.L_BathsFull || '-'}
                  {listing.LM_Int1_20 && listing.LM_Int1_20 !== '0' ? '.5' : ''} Bath
                </span>
              </div>
            )}
          </div>

          <p className="text-gray-600 text-sm line-clamp-1">
            {address}{unit}, {city} {state} {zip}
          </p>

          {propertyTypeName && (
            <div className="mt-2">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em]">
                {propertyTypeName}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-50">
            {formattedDate ? (
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                Listed on {formattedDate}
              </p>
            ) : <div />}
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">MLS: {listing.L_ListingID}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
