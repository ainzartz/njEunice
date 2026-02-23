"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface City {
  id: string;
  name: string;
  zipCodes: { code: string }[];
}

interface County {
  id: string;
  name: string;
  cities: City[];
}

interface EditCustomerFormProps {
  id: string;
}

export default function EditCustomerForm({ id }: EditCustomerFormProps) {
  const router = useRouter();

  const [counties, setCounties] = useState<County[]>([]);
  const [selectedCountyId, setSelectedCountyId] = useState<string>('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    dob: '',
    autoEmail: false,
    autoSms: false,
    isAdmin: false,
    isLogin: false,
    isDeleted: false,
    interestedCityIds: [] as string[]
  });
  const [hasPassword, setHasPassword] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password Policy Validation
  const isLengthValid = formData.password.length >= 8;
  const hasNumber = /[0-9]/.test(formData.password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
  const isMatch = formData.password === formData.passwordConfirm && formData.password.length > 0;
  const isPasswordValid = isLengthValid && hasNumber && hasSpecial && isMatch;
  const isPasswordProvided = formData.password.length > 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countiesRes, userRes] = await Promise.all([
          fetch('/api/counties'),
          fetch(`/api/admin/customers/${id}`)
        ]);

        if (!countiesRes.ok || !userRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const countiesData = await countiesRes.json();
        const userData = await userRes.json();

        setCounties(countiesData);
        if (countiesData.length > 0) {
          setSelectedCountyId(countiesData[0].id);
        }

        setFormData({
          email: userData.email || '',
          password: '',
          passwordConfirm: '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phone: userData.phone || '',
          address: userData.address || '',
          dob: userData.dob ? new Date(userData.dob).toISOString().split('T')[0] : '',
          autoEmail: userData.autoEmail || false,
          autoSms: userData.autoSms || false,
          isAdmin: userData.isAdmin || false,
          isLogin: userData.isLogin || false,
          isDeleted: userData.isDeleted || false,
          interestedCityIds: userData.interestedCityIds || []
        });
        setHasPassword(userData.hasPassword || false);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;

    if (type === 'checkbox') {
      if (name === 'interestedCityIds') {
        setFormData(prev => ({
          ...prev,
          interestedCityIds: checked
            ? [...prev.interestedCityIds, value]
            : prev.interestedCityIds.filter(c => c !== value)
        }));
      } else {
        setFormData(prev => {
          const newState = { ...prev, [name]: checked };
          if (name === 'isAdmin' && checked) newState.isLogin = false;
          if (name === 'isLogin' && checked) newState.isAdmin = false;

          if (!newState.isAdmin && !newState.isLogin) {
            newState.password = '';
            newState.passwordConfirm = '';
          }
          return newState;
        });
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    const needsPassword = (formData.isAdmin || formData.isLogin) && !hasPassword;

    if (needsPassword && !isPasswordProvided) {
      setError('Password is required when enabling login for this user');
      setSubmitting(false);
      return;
    }

    if (isPasswordProvided && !isPasswordValid) {
      setError('Password does not meet the security policy requirements');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update user');
      }

      setSuccess('User updated successfully');
      router.push('/admin/customers');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto py-24 text-center italic text-gray-500">Loading user data...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-light uppercase tracking-widest border-b-2 border-black pb-2">
            Edit User Profile
          </h1>
          {formData.isDeleted && (
            <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
              Deleted Account
            </span>
          )}
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => router.back()}
            className="text-sm font-bold tracking-widest uppercase hover:text-gray-600 transition-colors underline"
          >
            Back
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-md text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
              <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
              <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black outline-none" placeholder="e.g., 201-555-0123" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black outline-none" />
          </div>

          <div className="p-4 border border-red-200 bg-red-50 rounded-md">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isDeleted"
                checked={formData.isDeleted}
                onChange={handleChange}
                className="w-4 h-4 mt-1 text-red-600 focus:ring-red-600 rounded cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-red-600 uppercase tracking-wider">Mark Account as Deleted</span>
                <span className="text-xs text-red-500 mt-1">Checking this box will soft-delete the user, preventing login while retaining records. Uncheck to restore an active account.</span>
              </div>
            </label>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium mb-4">Settings & Permissions</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input type="checkbox" name="autoEmail" checked={formData.autoEmail} onChange={handleChange} className="w-4 h-4 text-black focus:ring-black" />
                <span className="text-sm">Opt-in to automated Email communications</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" name="autoSms" checked={formData.autoSms} onChange={handleChange} className="w-4 h-4 text-black focus:ring-black" />
                <span className="text-sm">Opt-in to automated SMS communications</span>
              </label>

              <div className="pt-2 pb-2">
                <label className="flex items-center gap-3 mb-4">
                  <input type="checkbox" name="isLogin" checked={formData.isLogin} onChange={handleChange} className="w-4 h-4 text-black focus:ring-black" />
                  <span className="text-sm font-semibold">Allow General User Login</span>
                </label>

                <label className="flex items-center gap-3 mb-4">
                  <input type="checkbox" name="isAdmin" checked={formData.isAdmin} onChange={handleChange} className="w-4 h-4 text-black focus:ring-black" />
                  <span className="text-sm font-bold text-red-600">Grant Administrator Access</span>
                </label>

                {(formData.isLogin || formData.isAdmin) && (
                  <div className="pt-4 border-t border-gray-100">
                    {!showPasswordFields ? (
                      <button
                        type="button"
                        onClick={() => setShowPasswordFields(true)}
                        className="text-sm font-bold tracking-widest uppercase text-blue-600 hover:text-blue-800 transition-colors underline"
                      >
                        Change Password
                      </button>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-md border border-gray-100 relative">
                        <button
                          type="button"
                          onClick={() => {
                            setShowPasswordFields(false);
                            setFormData(prev => ({ ...prev, password: '', passwordConfirm: '' }));
                          }}
                          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                          title="Cancel password change"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <p className="text-xs text-gray-500 mb-3 italic">Leave password blank if you do not wish to change it.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input
                              type="password"
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <input
                              type="password"
                              name="passwordConfirm"
                              value={formData.passwordConfirm}
                              onChange={handleChange}
                              className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black outline-none"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2 mt-4 border-t border-gray-100 pt-3">
                          <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Password Security Policy</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                            <div className={`flex items-center text-xs ${isLengthValid ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                              <span className="mr-2 text-sm">{isLengthValid ? '✓' : '○'}</span> At least 8 characters
                            </div>
                            <div className={`flex items-center text-xs ${hasNumber ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                              <span className="mr-2 text-sm">{hasNumber ? '✓' : '○'}</span> At least one number
                            </div>
                            <div className={`flex items-center text-xs ${hasSpecial ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                              <span className="mr-2 text-sm">{hasSpecial ? '✓' : '○'}</span> At least one special character
                            </div>
                            <div className={`flex items-center text-xs ${isMatch ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                              <span className="mr-2 text-sm">{isMatch ? '✓' : '○'}</span> Passwords match
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium mb-4">Interest Regions (Cities & Zip Codes)</h3>
            {counties.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No regions found or loading...</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select County</label>
                  <select
                    value={selectedCountyId}
                    onChange={(e) => setSelectedCountyId(e.target.value)}
                    className="w-full md:w-1/2 p-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black outline-none"
                  >
                    {counties.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-2">
                  {counties.filter(c => c.id === selectedCountyId).map(county => (
                    <div key={county.id}>
                      <h4 className="font-bold text-sm uppercase tracking-wider mb-3 text-gray-800 border-b border-gray-100 pb-1">{county.name} County Cities</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {county.cities.map(city => (
                          <label key={city.id} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded">
                            <input
                              type="checkbox"
                              name="interestedCityIds"
                              value={city.id}
                              checked={formData.interestedCityIds.includes(city.id)}
                              onChange={handleChange}
                              className="w-4 h-4 mt-0.5 text-black focus:ring-black"
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{city.name}</span>
                              <span className="text-xs text-gray-500">
                                {city.zipCodes.map(z => z.code).join(', ')}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-gray-200 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-12 py-3 bg-black text-white font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
