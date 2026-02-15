
import Image from 'next/image';
import Link from 'next/link';

interface PropertyCardProps {
  listing: any; // Using any for mock simplisity, define interface later
}

const PropertyCard = ({ listing }: PropertyCardProps) => {
  const imageUrl = listing.Media && listing.Media[0]?.MediaURL
    ? listing.Media[0].MediaURL
    : '/images/placeholder-house.jpg'; // Fallback

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  return (
    <Link href={`https://www.njmls.com/listings/index.cfm?action=dsp.info&mlsnum=${listing.ListingKey}&open=1`} target="_blank" className="block group">
      <div className="bg-white border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={listing.UnparsedAddress || 'Listing Image'}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 left-2 bg-black text-white text-xs font-bold px-2 py-1 uppercase tracking-widest">
            {listing.StandardStatus}
          </div>
          <div className="absolute top-2 right-2 bg-white text-black text-xs font-bold px-2 py-1 uppercase tracking-widest">
            {listing.PropertyType === 'Lease' ? 'For Rent' : 'For Sale'}
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {formatter.format(listing.ListPrice)}
            {listing.PropertyType === 'Lease' && <span className="text-sm font-normal text-gray-500">/mo</span>}
          </h3>

          <p className="text-gray-600 text-sm mb-4 line-clamp-1">
            {listing.UnparsedAddress}, {listing.City}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-100 pt-3">
            <div className="flex items-center gap-1">
              <span className="font-bold text-black">{listing.BedroomsTotal}</span> Beds
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-black">{listing.BathroomsTotalInteger}</span> Baths
            </div>
            {listing.LivingArea && (
              <div className="flex items-center gap-1">
                <span className="font-bold text-black">{listing.LivingArea.toLocaleString()}</span> Sq Ft
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
