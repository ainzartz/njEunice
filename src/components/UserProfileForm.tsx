"use client";

import { useState } from 'react';
import Link from 'next/link';

interface UserProfileFormProps {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    address: string | null;
    dob: string | null;
    autoEmail: boolean;
    autoSms: boolean;
  };
}

export default function UserProfileForm({ user }: UserProfileFormProps) {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    phone: user.phone || '',
    address: user.address || '',
    dob: user.dob || '',
    autoEmail: user.autoEmail || false,
    autoSms: user.autoSms || false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">My Profile</h2>

      {message && (
        <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-gray-400 text-xs">(Read-only)</span></label>
          <div className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed">
            {user.email}
          </div>
          <div className="mt-2 flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="autoEmail"
                name="autoEmail"
                type="checkbox"
                checked={formData.autoEmail}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="autoEmail" className="font-medium text-gray-700">
                Email Consent
              </label>
              <p className="text-gray-500">I agree to receive marketing emails and updates about my account.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="John"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="Doe"
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
            placeholder="123-456-7890"
          />
          <div className="mt-2 flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="autoSms"
                name="autoSms"
                type="checkbox"
                checked={formData.autoSms}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="autoSms" className="font-medium text-gray-700">
                SMS Consent
              </label>
              <p className="text-gray-500">I agree to receive SMS text messages for updates and notifications.</p>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
            placeholder="123 Main St, City, ST 12345"
          />
        </div>

        <div>
          <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <input
            type="date"
            id="dob"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="flex items-center gap-4">
            <input
              type="password"
              value="********"
              disabled
              className="flex-grow px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
            />
            <Link
              href="/auth/update-password"
              className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium whitespace-nowrap"
            >
              Change Password
            </Link>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
