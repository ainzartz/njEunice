"use client";

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// Dummy Data
const dummyListings = [
  {
    id: 1,
    address: "123 Alpine Dr",
    city: "Closter",
    state: "NJ",
    zip: "07624",
    price: "$1,250,000",
    beds: 4,
    baths: 3.5,
    sqft: 3200,
    image: "/images/listing1.jpg" // Placeholder
  },
  {
    id: 2,
    address: "450 Main St",
    city: "Fort Lee",
    state: "NJ",
    zip: "07024",
    price: "$850,000",
    beds: 2,
    baths: 2,
    sqft: 1500,
    image: "/images/listing2.jpg"
  },
  {
    id: 3,
    address: "789 River Rd",
    city: "Edgewater",
    state: "NJ",
    zip: "07020",
    price: "$1,800,000",
    beds: 3,
    baths: 3,
    sqft: 2800,
    image: "/images/listing3.jpg"
  },
  {
    id: 4,
    address: "55 Euclid Ave",
    city: "Tenafly",
    state: "NJ",
    zip: "07670",
    price: "$2,100,000",
    beds: 5,
    baths: 4.5,
    sqft: 4500,
    image: "/images/listing4.jpg"
  }
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');

  // Simple filter logic (for demo)
  const filteredListings = query
    ? dummyListings.filter(l =>
      l.city.toLowerCase().includes(query.toLowerCase()) ||
      l.zip.includes(query) ||
      l.address.toLowerCase().includes(query.toLowerCase())
    )
    : dummyListings;

  return (
    <main className="min-h-screen font-sans bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-grow pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl font-light text-black border-b border-black pb-4">
              {query ? `Search Results for "${query}"` : "Featured Listings"}
            </h1>
            <p className="text-gray-500 mt-2 text-sm uppercase tracking-widest leading-relaxed">
              {filteredListings.length} Properties Found
            </p>
          </div>

          {/* Listings Grid */}
          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredListings.map((listing) => (
                <Link href={`/property/${listing.id}`} key={listing.id} className="group block bg-white shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="relative h-64 bg-gray-200 overflow-hidden">
                    {/* Fallback image if file not found */}
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-200">
                      <span className="uppercase tracking-widest text-xs">Image Placeholder</span>
                    </div>
                    {/* <Image src={listing.image} alt={listing.address} fill className="object-cover group-hover:scale-105 transition-transform duration-700" /> */}
                    <div className="absolute top-4 left-4 bg-black text-white text-xs font-bold uppercase tracking-widest py-1 px-3">
                      For Sale
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-light text-black mb-1">{listing.price}</h3>
                    <p className="text-gray-600 font-medium mb-4">{listing.address}, {listing.city}</p>

                    <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-black">{listing.beds}</span> Beds
                      </div>
                      <div className="w-px h-4 bg-gray-300"></div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-black">{listing.baths}</span> Baths
                      </div>
                      <div className="w-px h-4 bg-gray-300"></div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-black">{listing.sqft}</span> Sq Ft
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-xl text-gray-400 font-light">No properties found matching your criteria.</p>
              <button onClick={() => window.location.href = '/search'} className="mt-8 text-sm font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-500 transition-colors">
                View All Listings
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
