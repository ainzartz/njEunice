"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Minus } from 'lucide-react';

function ContactFormContent() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Consent State
  const [consentChecked, setConsentChecked] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Email Verification State
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'idle' | 'sent' | 'verified'>('idle');
  const [verificationCodeInput, setVerificationCodeInput] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  // Real Estate Preferences State
  const [counties, setCounties] = useState<any[]>([]);
  const [preferences, setPreferences] = useState({
    interestType: '' as '' | 'BUY' | 'SELL' | 'LEASE' | 'COMMERCIAL',
    minPrice: '',
    maxPrice: '',
    minBeds: '',
    minBaths: ''
  });
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [showPreferences, setShowPreferences] = useState(false);

  // Auto-select interestType from query param
  useEffect(() => {
    const typeFromQuery = searchParams.get('type');
    if (typeFromQuery) {
      const upperType = typeFromQuery.toUpperCase();
      if (['BUY', 'SELL', 'LEASE', 'COMMERCIAL'].includes(upperType)) {
        setPreferences(p => ({ ...p, interestType: upperType as any }));
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchCounties = async () => {
      try {
        const response = await fetch('/api/counties');
        if (response.ok) {
          const data = await response.json();
          setCounties(data);
        }
      } catch (error) {
        console.error('Error fetching counties:', error);
      }
    };
    fetchCounties();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCountdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let { name, value } = e.target;

    // Only allow numbers for phone field
    if (name === 'phone') {
      value = value.replace(/\D/g, '');
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleVerifyEmail = async () => {
    if (!formData.email) {
      alert("Please enter an email address first.");
      return;
    }

    setVerificationStep('sent');
    setResendCountdown(180);
    setVerificationCodeInput('');

    try {
      const response = await fetch('/api/email/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (data.success) {
        // Code sent successfully
      } else {
        alert("Failed to send email: " + (data.error || "Unknown error"));
        setVerificationStep('idle');
        setResendCountdown(0);
      }
    } catch (error) {
      console.error("Error verifying email:", error);
      alert("An error occurred. Please try again.");
      setVerificationStep('idle');
      setResendCountdown(0);
    }
  };

  const handleConfirmCode = async () => {
    if (!verificationCodeInput) return;

    try {
      const response = await fetch('/api/email/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          code: verificationCodeInput
        }),
      });

      const data = await response.json();

      if (data.success) {
        setEmailVerified(true);
        setVerificationStep('verified');
        setVerificationCodeInput('');
        setResendCountdown(0);
      } else {
        alert(data.message || "Incorrect or expired code. Please try again.");
      }
    } catch (error) {
      console.error("Error confirming code:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (!consentChecked || !emailVerified) return;

    if (!preferences.interestType) {
      alert("Please select what you are looking for.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          preferences: showPreferences ? preferences : undefined,
          interestCities: showPreferences ? selectedCities : undefined,
          consent: consentChecked
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        alert(data.error || 'Failed to send message. Please try again later.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-8 md:p-12 rounded-lg border border-gray-100 shadow-sm">
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <h3 className="text-2xl font-bold uppercase tracking-wider mb-6 text-black">Send a Message</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-bold uppercase tracking-wider text-black">First Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all duration-300 text-black placeholder:text-gray-400"
                placeholder="First Name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-bold uppercase tracking-wider text-black">Last Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all duration-300 text-black placeholder:text-gray-400"
                placeholder="Last Name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-bold uppercase tracking-wider text-black">Email Address <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <input
                type="email"
                id="email"
                name="email"
                required
                disabled={emailVerified}
                value={formData.email}
                onChange={handleChange}
                className={`flex-1 min-w-0 px-4 py-3 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all duration-300 text-black placeholder:text-gray-400 ${emailVerified ? 'bg-gray-100' : ''}`}
                placeholder="your@email.com"
              />
              {!emailVerified ? (
                <button
                  type="button"
                  onClick={handleVerifyEmail}
                  disabled={resendCountdown > 0 || !formData.email}
                  className={`flex-shrink-0 px-4 sm:px-6 font-bold uppercase tracking-wider text-sm transition-colors whitespace-nowrap min-w-[100px] sm:min-w-[140px] ${resendCountdown > 0 || !formData.email
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-900'
                    }`}
                >
                  {resendCountdown > 0
                    ? `Resend (${resendCountdown}s)`
                    : (verificationStep === 'sent' ? 'Resend' : 'Verify')}
                </button>
              ) : (
                <div className="flex items-center px-4 bg-green-50 border border-green-200 text-green-700 font-bold uppercase tracking-wider text-xs whitespace-nowrap">
                  Verified
                </div>
              )}
            </div>
          </div>

          {/* Email Verification Code Input */}
          {verificationStep === 'sent' && (
            <div className="space-y-2 bg-gray-100 p-4 rounded border border-gray-200 animate-fadeIn">
              <label htmlFor="code" className="text-sm font-bold uppercase tracking-wider text-gray-700">Enter Verification Code</label>
              <p className="text-xs text-gray-500 mb-2">A 6-digit code has been sent to your email.</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="code"
                  value={verificationCodeInput}
                  onChange={(e) => setVerificationCodeInput(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors text-black"
                  placeholder="123456"
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={handleConfirmCode}
                  className="bg-black text-white px-6 font-bold uppercase tracking-wider text-sm hover:bg-gray-900 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          )}


          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-bold uppercase tracking-wider text-black">Phone (Optional)</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              disabled={!emailVerified}
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all duration-300 text-black placeholder:text-gray-400 ${!emailVerified ? 'bg-gray-50 cursor-not-allowed opacity-60' : ''}`}
              placeholder={!emailVerified ? "Verify email to unlock" : "2015550123"}
              pattern="[0-9]*"
              inputMode="numeric"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="interestType" className="text-sm font-bold uppercase tracking-wider text-black flex items-center gap-2">
              What are you looking for? <span className="text-red-500 font-bold">*</span>
            </label>
            <select
              id="interestType"
              name="interestType"
              required
              disabled={!emailVerified}
              value={preferences.interestType}
              onChange={(e) => {
                const newType = e.target.value as any;
                setPreferences(p => ({ ...p, interestType: newType }));
                if (newType === 'SELL') {
                  setShowPreferences(false);
                }
              }}
              className={`w-full px-4 py-3 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all duration-300 text-black appearance-none cursor-pointer ${!emailVerified ? 'bg-gray-50 cursor-not-allowed opacity-60' : ''}`}
            >
              <option value="">Select Type</option>
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
              <option value="LEASE">Lease</option>
              <option value="COMMERCIAL">Commercial</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-bold uppercase tracking-wider text-black">Message <span className="text-red-500">*</span></label>
            <textarea
              id="message"
              name="message"
              required
              disabled={!emailVerified || !preferences.interestType}
              rows={5}
              value={formData.message}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all duration-300 resize-none text-black placeholder:text-gray-400 ${(!emailVerified || !preferences.interestType) ? 'bg-gray-50 cursor-not-allowed opacity-60' : ''}`}
              placeholder={!emailVerified ? "Verify email to unlock" : !preferences.interestType ? "Select interest type to unlock" : "How can we help you?"}
            />
          </div>

          {/* Consent Checkbox */}
          <div className="space-y-4">
            {/* Validation Check: FirstName, LastName, Email, InterestType, Message */}
            {(() => {
              const isMandatoryFilled =
                formData.firstName.trim() !== '' &&
                formData.lastName.trim() !== '' &&
                emailVerified &&
                preferences.interestType !== '' &&
                formData.message.trim() !== '';

              return (
                <div className="flex items-start space-x-3">
                  <div className="flex items-center h-5">
                    <input
                      id="consent"
                      name="consent"
                      type="checkbox"
                      disabled={!isMandatoryFilled}
                      checked={consentChecked && isMandatoryFilled}
                      onChange={(e) => setConsentChecked(e.target.checked)}
                      className={`h-4 w-4 text-black border-gray-300 rounded focus:ring-black cursor-pointer ${!isMandatoryFilled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  </div>
                  <div className="text-sm">
                    <label htmlFor="consent" className={`font-bold block mb-1 ${!isMandatoryFilled ? 'text-gray-400' : 'text-gray-900'}`}>
                      I consent to receive text messages and phone calls. <span className="text-red-500">*</span>
                    </label>
                    {!isMandatoryFilled && (
                      <p className="text-[10px] text-red-500 font-bold uppercase mb-1">Please fill all mandatory fields (*) above to unlock consent.</p>
                    )}
                    <p className="text-xs text-gray-500 leading-relaxed text-justify">
                      By providing my phone number above and checking this box, I expressly consent to RE/MAX Now, directly or by a third party vendor, InsideRE, LLC, acting on RE/MAX Now's behalf, contacting me at this number by calling me or sending me text messages, including marketing and promotional messages, using an automatic telephone dialing system, related to our products and services for real estate transactions, even if my name appears on the "Do Not Call" list. Providing my consent is not required to obtain our products or services. Message and data rates may apply. Message frequency varies. Text HELP for help or STOP to unsubscribe. My information will be handled in accordance with RE/MAX Now's <a href="/privacy-policy" className="underline hover:text-black">Privacy Policy</a> and RE/MAX Now's <a href="/terms-of-use" className="underline hover:text-black">Terms & Conditions</a>.
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* AI Agent Marketing & Preference Toggle */}
          <div className="pt-4 border-t border-gray-100 space-y-4">
            <div className={`flex items-start space-x-3 p-4 ${showPreferences ? 'bg-black text-white' : 'bg-gray-50 border border-black'} rounded-lg shadow-md transition-all duration-300`}>
              <div className="flex items-center h-5">
                <input
                  id="showPreferences"
                  name="showPreferences"
                  type="checkbox"
                  disabled={!emailVerified || !preferences.interestType || preferences.interestType === 'SELL'}
                  checked={showPreferences && !!preferences.interestType && preferences.interestType !== 'SELL'}
                  onChange={(e) => setShowPreferences(e.target.checked)}
                  className={`h-4 w-4 rounded cursor-pointer ${showPreferences ? 'text-white border-white focus:ring-white' : 'text-black border-gray-300 focus:ring-black'} ${(!emailVerified || !preferences.interestType || preferences.interestType === 'SELL') ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
              <div className="text-sm">
                <label htmlFor="showPreferences" className={`font-bold block mb-1 cursor-pointer ${showPreferences ? 'text-white' : 'text-gray-900'}`}>
                  AI-Powered Property Matching
                </label>
                <p className={`text-xs leading-relaxed italic ${showPreferences ? 'text-gray-300' : 'text-gray-600'}`}>
                  "Experience a smarter way to find your next home. Our AI Agent scans new listings in real-time to identify properties that align with your unique criteria. Opt-in now to receive personalized alerts for the most relevant opportunities."
                </p>
              </div>
            </div>

            {showPreferences && (
              <div className="animate-fadeIn">
                {/* Real Estate Preferences (Repositioned) */}
                <div className={`space-y-6 ${!emailVerified ? 'p-6 bg-gray-50 border border-gray-100 opacity-50' : 'p-6 bg-white border border-black shadow-sm'} rounded-lg transition-all duration-500`}>
                  <h4 className="text-xl font-bold uppercase tracking-widest text-black border-b border-black pb-2 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    Real Estate Preferences
                  </h4>

                  {!emailVerified && (
                    <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-4 animate-pulse">
                      Please verify your email to unlock these options
                    </p>
                  )}

                  <div className="space-y-6">
                    {/* Row 1: Price Range (Full Width) */}
                    {(preferences.interestType === 'BUY' || preferences.interestType === 'LEASE' || preferences.interestType === 'COMMERCIAL') && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-black block">Price Range</label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              placeholder="Min Price"
                              disabled={!emailVerified}
                              value={preferences.minPrice ? new Intl.NumberFormat('en-US').format(parseInt(preferences.minPrice)) : ''}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setPreferences(p => ({ ...p, minPrice: val }));
                              }}
                              className="w-full h-12 px-4 bg-white border border-gray-300 focus:border-black outline-none text-black text-sm font-bold shadow-sm disabled:cursor-not-allowed"
                            />
                          </div>
                          <span className="text-gray-400 font-bold">~</span>
                          <div className="relative flex-1">
                            <input
                              type="text"
                              placeholder="Max Price"
                              disabled={!emailVerified}
                              value={preferences.maxPrice ? new Intl.NumberFormat('en-US').format(parseInt(preferences.maxPrice)) : ''}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setPreferences(p => ({ ...p, maxPrice: val }));
                              }}
                              className="w-full h-12 px-4 bg-white border border-gray-300 focus:border-black outline-none text-black text-sm font-bold shadow-sm disabled:cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Row 2: Beds & Baths */}
                    {(preferences.interestType === 'BUY' || preferences.interestType === 'LEASE') && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-black block">Min Bedrooms</label>
                          <div className="relative h-12 flex border border-gray-300 bg-white group hover:border-black transition-colors shadow-sm">
                            <div className="flex-1 flex items-center px-4 font-bold text-black text-sm">
                              {preferences.minBeds || '0'}
                            </div>
                            <div className="w-10 flex flex-col border-l border-gray-300">
                              <button
                                type="button"
                                disabled={!emailVerified}
                                onClick={() => setPreferences(p => ({ ...p, minBeds: (parseInt(p.minBeds || '0') + 1).toString() }))}
                                className="flex-1 flex items-center justify-center border-b border-gray-300 hover:bg-black hover:text-white transition-colors"
                              >
                                <Plus size={12} strokeWidth={3} />
                              </button>
                              <button
                                type="button"
                                disabled={!emailVerified}
                                onClick={() => setPreferences(p => ({ ...p, minBeds: Math.max(0, parseInt(p.minBeds || '0') - 1).toString() }))}
                                className="flex-1 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                              >
                                <Minus size={12} strokeWidth={3} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-black block">Min Bathrooms</label>
                          <div className="relative h-12 flex border border-gray-300 bg-white group hover:border-black transition-colors shadow-sm">
                            <div className="flex-1 flex items-center px-4 font-bold text-black text-sm">
                              {parseFloat(preferences.minBaths || '0').toFixed(1)}
                            </div>
                            <div className="w-10 flex flex-col border-l border-gray-300">
                              <button
                                type="button"
                                disabled={!emailVerified}
                                onClick={() => setPreferences(p => ({ ...p, minBaths: (parseFloat(p.minBaths || '0') + 0.5).toFixed(1) }))}
                                className="flex-1 flex items-center justify-center border-b border-gray-300 hover:bg-black hover:text-white transition-colors"
                              >
                                <Plus size={12} strokeWidth={3} />
                              </button>
                              <button
                                type="button"
                                disabled={!emailVerified}
                                onClick={() => setPreferences(p => ({ ...p, minBaths: Math.max(0, parseFloat(p.minBaths || '0') - 0.5).toFixed(1) }))}
                                className="flex-1 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                              >
                                <Minus size={12} strokeWidth={3} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* City Selection */}
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <label className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Interested Cities (New Jersey)
                      </label>

                      <div className="max-h-64 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                        {counties.map(county => (
                          <div key={county.id} className="space-y-3 border-l-2 border-gray-100 pl-4">
                            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{county.name} County</h5>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {county.cities.map((city: any) => (
                                <label key={city.id} className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-all border ${selectedCities.includes(city.id) ? 'bg-black border-black text-white' : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-gray-300'} ${!emailVerified ? 'pointer-events-none opacity-50' : ''}`}>
                                  <input
                                    type="checkbox"
                                    className="hidden"
                                    disabled={!emailVerified}
                                    checked={selectedCities.includes(city.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedCities(prev => [...prev, city.id]);
                                      } else {
                                        setSelectedCities(prev => prev.filter(id => id !== city.id));
                                      }
                                    }}
                                  />
                                  <span className="text-[10px] font-bold uppercase leading-none truncate">{city.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!consentChecked || isSubmitting}
            className={`w-full py-4 font-bold uppercase tracking-widest transition-colors ${(!consentChecked || isSubmitting)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-black text-white hover:bg-gray-900'
              }`}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      ) : (
        <div className="text-center py-12 space-y-6">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Message Sent!</h3>
          <p className="text-gray-600">
            Thank you for reaching out. We'll get back to you as soon as possible.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setEmailVerified(false);
              setVerificationStep('idle');
              setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
              setConsentChecked(false);
            }}
            className="mt-8 text-sm font-medium text-black border-b border-black pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors"
          >
            Send another message
          </button>
        </div>
      )}
    </div>
  );
}

export default function ContactForm() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500 animate-pulse">Loading contact form...</div>}>
      <ContactFormContent />
    </Suspense>
  );
}
