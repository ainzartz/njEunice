
import React from 'react';

const PropertyCardSkeleton = () => (
  <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full animate-pulse">
    {/* Image Container Skeleton */}
    <div className="relative aspect-[4/3] bg-gray-100 flex items-center justify-center">
      <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>
    </div>

    {/* Content Skeleton */}
    <div className="p-4 flex flex-col flex-grow">
      <div className="flex justify-between items-baseline mb-3">
        <div className="h-7 w-32 bg-gray-100 rounded"></div>
        <div className="h-6 w-24 bg-gray-100 rounded"></div>
      </div>

      <div className="h-4 w-full bg-gray-50 rounded mb-2"></div>
      <div className="h-4 w-2/3 bg-gray-50 rounded mb-4"></div>

      <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
        <div className="h-3 w-16 bg-gray-100 rounded"></div>
        <div className="h-3 w-16 bg-gray-100 rounded"></div>
      </div>
    </div>
  </div>
);

export const SearchSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
      {[...Array(6)].map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
};
