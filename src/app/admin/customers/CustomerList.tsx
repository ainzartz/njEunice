"use client";

import { useState } from 'react';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  phone: string;
  address: string;
  dob: string;
  createdAt: string | Date;
  isLogin: boolean;
  isAdmin: boolean;
  isDeleted: boolean;
}

interface CustomerListProps {
  users: User[];
}

export default function CustomerList({ users }: CustomerListProps) {
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Filter logic
  const filteredUsers = users.filter(u => {
    // Active filter
    if (showOnlyActive && u.isDeleted) return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      const name = u.name.toLowerCase();
      const email = u.email.toLowerCase();
      const phone = u.phone.toLowerCase();

      return fullName.includes(query) ||
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query);
    }

    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to page 1 when filters change
  const handleFilterChange = (newActive: boolean) => {
    setShowOnlyActive(newActive);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 w-full pt-28 pb-12 flex-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 border-b-2 border-black pb-4">
        <div className="flex flex-col gap-4 w-full md:w-auto">
          <h1 className="text-3xl font-light uppercase tracking-widest inline-block">
            Customer Management
          </h1>
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={showOnlyActive}
                onChange={(e) => handleFilterChange(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="text-sm font-bold uppercase tracking-wider text-gray-700 group-hover:text-black transition-colors">
                Active Only
              </span>
            </label>

            <div className="relative flex-grow md:max-w-xs">
              <input
                type="text"
                placeholder="Search name, email, phone..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-black focus:border-black outline-none transition-all"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <Link
            href="/admin"
            className="px-6 py-2 bg-white text-black border border-gray-300 text-sm font-bold tracking-widest uppercase hover:bg-gray-100 transition-colors whitespace-nowrap"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/admin/customers/new"
            className="px-6 py-2 bg-black text-white text-sm font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            New User
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 mt-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600">
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Name</th>
                <th className="px-6 py-4 font-bold">Email</th>
                <th className="px-6 py-4 font-bold">Phone</th>
                <th className="px-6 py-4 font-bold">Address</th>
                <th className="px-6 py-4 font-bold">Registered At</th>
                <th className="px-6 py-4 font-bold text-center">General</th>
                <th className="px-6 py-4 font-bold text-center">Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {paginatedUsers.map((u) => (
                <tr key={u.id} className={`transition-colors ${u.isDeleted ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {u.isDeleted ? (
                      <span className="px-2 inline-flex text-[10px] leading-4 font-bold rounded-full bg-red-600 text-white uppercase tracking-tighter">
                        Deleted
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-[10px] leading-4 font-bold rounded-full bg-green-600 text-white uppercase tracking-tighter">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-medium">
                    <Link href={`/admin/customers/${u.id}`} className="hover:underline hover:text-blue-600 transition-colors">
                      {(u.firstName || u.lastName) ? `${u.firstName} ${u.lastName}`.trim() : (u.name || '-')}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{u.phone || '-'}</td>
                  <td className="px-6 py-4 text-gray-600 min-w-[200px]">
                    {u.address || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {new Date(u.createdAt).toLocaleString(undefined, {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {u.isLogin ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Yes
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-600">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {u.isAdmin ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-black text-white">
                        Yes
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-200 text-gray-800">
                        No
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 italic">
                    No users found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              Showing <span className="text-black">{startIndex + 1}</span> to <span className="text-black">{Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length)}</span> of <span className="text-black">{filteredUsers.length}</span> users
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-xs font-bold uppercase tracking-tighter transition-colors hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-all ${currentPage === page ? 'bg-black text-white shadow-sm' : 'hover:bg-gray-200 text-gray-600'
                      }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-xs font-bold uppercase tracking-tighter transition-colors hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
