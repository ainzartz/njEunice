"use client";

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Dummy Data (Shared with Search Page Ideally, but duplicated here for simplicity in this phase)
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
    description: "Stunning colonial in the heart of Closter. Featuring a gourmet kitchen, spacious master suite, and a backyard oasis perfect for entertaining. Close to top-rated schools and NYC transportation.",
    features: ["Hardwood Floors", "Central AC", "2 Car Garage", "Finished Basement", "Smart Home System"],
    images: ["/images/listing1.jpg", "/images/listing1_2.jpg", "/images/listing1_3.jpg"]
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
    description: "Modern luxury condo with breathtaking views of the George Washington Bridge. Amenities include 24/7 concierge, gym, and pool. Walking distance to shops and restaurants.",
    features: ["River View", "Concierge", "Pool", "Gym", "In-unit Laundry"],
    images: ["/images/listing2.jpg"]
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
    description: "Spectacular waterfront townhouse with private elevator and rooftop terrace. Enjoy unobstructed NYC skyline views from every floor.",
    features: ["Waterfront", "Private Elevator", "Rooftop Terrace", "Fireplace", "Gourmet Kitchen"],
    images: ["/images/listing3.jpg"]
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
    description: "Grand new construction in prestigious Tenafly. Custom details throughout, including high ceilings, intricate moldings, and chef's kitchen. Large lot with room for a pool.",
    features: ["New Construction", "High Ceilings", "Chef's Kitchen", "Large Lot", "Top Schools"],
    images: ["/images/listing4.jpg"]
  }
];

export default function PropertyDetailPage() {
  const params = useParams();
  // Ensure listingId is compared as number if dummyListings uses numbers
  const listingId = Number(params.id);
  const listing = dummyListings.find(l => l.id === listingId);

  if (!listing) {
    return (
      <main className="min-h-screen font-sans bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-light mb-4 text-black">Listing Not Found</h1>
            <p className="text-gray-500 mb-8">The property you are looking for may have been removed or does not exist.</p>
            <Link href="/search" className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-500 transition-colors">
              Back to Search
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen font-sans bg-white flex flex-col">
      <Navbar />

      <div className="pt-24 pb-20">
        {/* Basic Header */}
        <div className="bg-gray-100 py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <Link href="/search" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black mb-4 inline-block">
              &larr; Back to Listings
            </Link>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-5xl font-light text-black mb-2">{listing.address}</h1>
                <p className="text-xl text-gray-500">{listing.city}, {listing.state} {listing.zip}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl md:text-4xl font-medium text-black">{listing.price}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Image Placeholder */}
            <div className="aspect-video bg-gray-200 relative overflow-hidden shadow-lg">
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <span className="uppercase tracking-widest">Primary Listing Image</span>
              </div>
              {/* <Image src={listing.images[0]} alt={listing.address} fill className="object-cover" /> */}
            </div>

            {/* Specs */}
            <div className="grid grid-cols-3 gap-4 border-y border-gray-200 py-8 text-center">
              <div>
                <span className="block text-2xl font-bold text-black">{listing.beds}</span>
                <span className="text-xs uppercase tracking-widest text-gray-500">Bedrooms</span>
              </div>
              <div className="border-x border-gray-200">
                <span className="block text-2xl font-bold text-black">{listing.baths}</span>
                <span className="text-xs uppercase tracking-widest text-gray-500">Bathrooms</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-black">{listing.sqft}</span>
                <span className="text-xs uppercase tracking-widest text-gray-500">Sq Ft</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-bold uppercase tracking-widest mb-4 text-black">About this Home</h2>
              <p className="text-gray-600 leading-loose text-lg font-light">
                {listing.description}
              </p>
            </div>

            {/* Features */}
            <div>
              <h2 className="text-lg font-bold uppercase tracking-widest mb-4 text-black">Features & Amenities</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listing.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar / Contact */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-8 border border-gray-200 sticky top-32">
              <h3 className="text-xl font-light text-black mb-2">Interested in this property?</h3>
              <p className="text-gray-500 text-sm mb-6">Schedule a private tour with Eunice.</p>

              <form className="space-y-4">
                <input type="text" placeholder="Your Name" className="w-full bg-white border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" />
                <input type="email" placeholder="Email Address" className="w-full bg-white border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" />
                <input type="tel" placeholder="Phone Number" className="w-full bg-white border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" />
                <textarea rows={4} placeholder="I am interested in..." className="w-full bg-white border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" defaultValue={`Hi, I would like to schedule a viewing for ${listing.address}.`}></textarea>

                <button type="submit" className="w-full bg-black text-white font-bold uppercase tracking-widest py-3 hover:bg-gray-800 transition-colors">
                  Request Info
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
