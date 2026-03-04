
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
          console.error("Error fetching image for", listing.L_ListingID, err);
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
      console.error("Error formatting date", dateStr, e);
    }
  }

  return (
    <Link href={`/property/${listing.L_ListingID}`} className="block group">
      <div className="bg-white border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
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
              unoptimized
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-gray-100 border-b border-gray-100">
              <div className="bg-white/50 backdrop-blur-sm p-4 rounded-full mb-3 shadow-sm border border-gray-100">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-500 tracking-wider uppercase">Photo Unavailable</span>
            </div>
          )}
          <div className={`absolute top-3 left-3 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-sm uppercase tracking-widest shadow-lg ${isSold ? 'bg-red-600/90' : 'bg-black/80'}`}>
            {statusLabel}
          </div>
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-black text-[10px] font-bold px-3 py-1.5 rounded-sm uppercase tracking-widest shadow-lg">
            {isRent ? 'For Rent' : 'For Sale'}
          </div>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-baseline mb-1">
            <h4 className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors">
              {displayPrice}
            </h4>
            <span className="text-xs font-normal text-gray-500">MLS: {listing.L_ListingID}</span>
          </div>

          <p className="text-gray-600 text-sm line-clamp-1">
            {address}, {city} {state} {zip}
          </p>
          {formattedDate && (
            <p className="text-[10px] text-gray-400 mt-1 mb-3 uppercase tracking-wider font-medium">
              Listed on {formattedDate}
            </p>
          )}

        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
