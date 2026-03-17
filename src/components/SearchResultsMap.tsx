"use client";

import { useMemo, useState, useEffect, useRef } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import Image from 'next/image';
import Link from 'next/link';

interface SearchResultsMapProps {
  listings: any[];
}

const libraries: "places"[] = ["places"];

export default function SearchResultsMap({ listings }: SearchResultsMapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [geocodedListings, setGeocodedListings] = useState<any[]>([]);
  const geocodeCache = useRef<Map<string, google.maps.LatLngLiteral>>(new Map());
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [isGeocodingComplete, setIsGeocodingComplete] = useState(false);

  // Default center to Fort Lee if no coordinates are available
  const defaultCenter = useMemo(() => ({ lat: 40.8509, lng: -73.9701 }), []);

  useEffect(() => {
    if (!isLoaded) return;
    if (listings.length === 0) {
      setGeocodedListings([]);
      setIsGeocodingComplete(true);
      return;
    }

    let isActive = true;
    setIsGeocodingComplete(false);
    const processGeocoding = async () => {
      const geocoder = new window.google.maps.Geocoder();
      const newGeocodedListings: any[] = [];
      const listingsToGeocode: any[] = [];

      // 1. Process Cached Immediately
      for (const listing of listings) {
        const address = `${listing.L_AddressNumber || ''} ${listing.L_AddressStreet || ''}, ${listing.L_City || ''}, NJ ${listing.L_Zip || ''}`;
        if (geocodeCache.current.has(address)) {
          newGeocodedListings.push({ ...listing, position: geocodeCache.current.get(address) });
        } else {
          listingsToGeocode.push({ listing, address });
        }
      }

      // Update UI immediately with cached listings
      if (newGeocodedListings.length > 0) {
        setGeocodedListings([...newGeocodedListings]);
      }

      // 2. Process uncached in batches
      const batchSize = 10;
      for (let i = 0; i < listingsToGeocode.length; i += batchSize) {
        if (!isActive) break;

        const batch = listingsToGeocode.slice(i, i + batchSize);

        const batchPromises = batch.map(async (item) => {
          try {
            const res = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
              const geocodeReq: google.maps.GeocoderRequest = { address: item.address };

              const zip = item.listing.L_Zip || '';
              if (zip) {
                // Force Google Maps to search within the specific zip code
                geocodeReq.componentRestrictions = {
                  postalCode: zip,
                  administrativeArea: 'NJ',
                  country: 'US'
                };
              }

              geocoder.geocode(geocodeReq, (results, status) => {
                if (status === 'OK' && results) {
                  resolve(results);
                } else {
                  reject(status);
                }
              });
            });

            if (res && res[0]) {
              const location = res[0].geometry.location;
              const position = { lat: location.lat(), lng: location.lng() };
              geocodeCache.current.set(item.address, position);
              return { ...item.listing, position };
            }
          } catch (error) {
            console.warn(`Geocode failed for ${item.address}:`, error);
          }
          return null;
        });

        const results = await Promise.all(batchPromises);

        results.forEach(res => {
          if (res) newGeocodedListings.push(res);
        });

        // Update UI incrementally after each batch
        setGeocodedListings([...newGeocodedListings]);

        // Very small delay between batches
        await new Promise(r => setTimeout(r, 50));
      }

      if (isActive) {
        setIsGeocodingComplete(true);
      }
    };

    processGeocoding();

    return () => { isActive = false; };
  }, [isLoaded, listings]);

  useEffect(() => {
    if (mapInstance && geocodedListings.length > 0 && isGeocodingComplete) {
      const bounds = new window.google.maps.LatLngBounds();
      let hasValidPoints = false;

      geocodedListings.forEach(l => {
        if (l.position && l.position.lat && l.position.lng) {
          bounds.extend(l.position);
          hasValidPoints = true;
        }
      });

      if (hasValidPoints) {
        mapInstance.fitBounds(bounds);
        // Optional: Ensure it doesn't zoom in *too* far if there's only 1 or 2 pins
        const listener = window.google.maps.event.addListener(mapInstance, 'idle', () => {
          if (mapInstance.getZoom()! > 16) {
            mapInstance.setZoom(16);
          }
          window.google.maps.event.removeListener(listener);
        });
      }
    }
  }, [mapInstance, geocodedListings, isGeocodingComplete]);

  if (loadError) {
    return (
      <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center text-red-500">
          <p>Error loading maps.</p>
          <p className="text-sm mt-2 text-gray-500">Please check your Google Maps API Key.</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 animate-pulse">
        <p className="text-gray-400 font-medium">Loading Map...</p>
      </div>
    );
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border border-gray-200 shadow-sm relative">
      <GoogleMap
        mapContainerClassName="w-full h-full"
        center={defaultCenter}
        zoom={11}
        onLoad={map => setMapInstance(map)}
        options={{
          styles: [
            // Subtle, clean map style
            { featureType: "all", elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
            { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
            { featureType: "all", elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9e2f5" }] },
            // Hide POIs to keep map clean for property pins
            { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
            { featureType: "poi", elementType: "geometry", stylers: [{ visibility: "off" }] },
            { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
          ],
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
        }}
        onClick={() => setActiveMarker(null)} // Close info window when clicking on map
      >
        {geocodedListings.map((listing) => {
          const isRent = listing.propertyType === 'rent' || listing.L_SaleRent === 'R';
          const price = listing.L_AskingPrice ? parseInt(listing.L_AskingPrice, 10) : 0;
          const displayPrice = isRent ? `${formatter.format(price)}/mo` : formatter.format(price);

          return (
            <Marker
              key={listing.L_ListingID}
              position={listing.position}
              onMouseOver={() => setActiveMarker(listing.L_ListingID)}
              onClick={() => {
                // Clicking the pin directly navigates to the property
                window.location.href = `/property/${listing.L_ListingID}?class=${listing.mlsClass || 'RE_1'}`;
              }}
              icon={{
                path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                fillColor: '#1a56db',
                fillOpacity: 1,
                strokeWeight: 1,
                strokeColor: '#ffffff',
                scale: 1.5,
                anchor: new window.google.maps.Point(12, 24),
              }}
            >
              {activeMarker === listing.L_ListingID && (
                <InfoWindow
                  position={listing.position}
                  onCloseClick={() => setActiveMarker(null)}
                >
                  <div
                    className="p-1 max-w-[200px]"
                    onMouseLeave={() => setActiveMarker(null)}
                  >
                    <MapInfoWindowContent listing={listing} displayPrice={displayPrice} />
                  </div>
                </InfoWindow>
              )}
            </Marker>
          );
        })}
      </GoogleMap>

    </div>
  );
}

// Separate component for the InfoWindow content to handle image fetching separately
function MapInfoWindowContent({ listing, displayPrice }: { listing: any, displayPrice: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(listing.cachedImageUrl || null);

  useEffect(() => {
    if (listing.cachedImageUrl) {
      setImageUrl(listing.cachedImageUrl);
      return;
    }
    fetch(`/api/mls-image?id=${listing.L_ListingID}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.images && data.images.length > 0) {
          setImageUrl(data.images[0]);
        }
      })
      .catch(() => { });
  }, [listing.L_ListingID, listing.cachedImageUrl]);

  const address = `${listing.L_AddressNumber || ''} ${listing.L_AddressStreet || ''}`.trim() || 'Address Unavailable';

  return (
    <Link href={`/property/${listing.L_ListingID}?class=${listing.mlsClass || 'RE_1'}`} className="block group">
      <div className="w-[180px] rounded overflow-hidden">
        <div className="w-full h-24 bg-gray-100 relative mb-2 rounded overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={address}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="180px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 uppercase font-medium">
              No Photo
            </div>
          )}
        </div>
        <div className="px-1 pb-1">
          <h4 className="font-bold text-sm text-gray-900 leading-tight mb-1">{displayPrice}</h4>
          <p className="text-xs text-gray-600 leading-tight line-clamp-1 mb-1">{address}</p>
          <div className="flex justify-between items-center text-[10px] text-gray-400 uppercase tracking-widest mt-2 border-t border-gray-100 pt-1">
            <span>#{listing.L_ListingID}</span>
            <div className="relative h-3 w-12 ml-2">
              <Image
                src="/images/njmls_logo.png"
                alt="NJMLS IDX"
                fill
                className="object-contain opacity-70"
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
