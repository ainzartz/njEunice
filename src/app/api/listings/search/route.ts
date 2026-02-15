import { NextRequest, NextResponse } from 'next/server';

// Mock Data for development until API credentials are available
const MOCK_LISTINGS = [
  {
    ListingKey: "99001",
    ListPrice: 850000,
    UnparsedAddress: "150 Tenafly Rd, Tenafly, NJ 07670",
    City: "Tenafly",
    BedroomsTotal: 4,
    BathroomsTotalInteger: 3,
    LivingArea: 2800,
    StandardStatus: "Active",
    PropertyType: "Residential",
    Media: [
      { MediaURL: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80" }
    ]
  },
  {
    ListingKey: "99002",
    ListPrice: 620000,
    UnparsedAddress: "25 Piermont Rd, Cresskill, NJ 07626",
    City: "Cresskill",
    BedroomsTotal: 3,
    BathroomsTotalInteger: 2,
    LivingArea: 1800,
    StandardStatus: "Active",
    PropertyType: "Residential",
    Media: [
      { MediaURL: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80" }
    ]
  },
  {
    ListingKey: "99003",
    ListPrice: 4500,
    UnparsedAddress: "500 Engle St, Englewood, NJ 07631",
    City: "Englewood",
    BedroomsTotal: 2,
    BathroomsTotalInteger: 2,
    LivingArea: 1200,
    StandardStatus: "Active",
    PropertyType: "Lease",
    Media: [
      { MediaURL: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80" }
    ]
  }
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';

  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Simple filter
  const filtered = MOCK_LISTINGS.filter(item =>
    item.UnparsedAddress.toLowerCase().includes(query.toLowerCase()) ||
    item.City.toLowerCase().includes(query.toLowerCase())
  );

  return NextResponse.json({
    data: filtered,
    meta: {
      count: filtered.length,
      source: "MOCK_DATA (Real API Pending)"
    }
  });
}
