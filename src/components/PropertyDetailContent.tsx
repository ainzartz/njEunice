"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PropertyDetailContent({ id, mlsClass }: { id: number | string, mlsClass?: string }) {
  const [listing, setListing] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [lang, setLang] = useState<'en' | 'ko'>('en');
  const [koreanRemarks, setKoreanRemarks] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showCounter, setShowCounter] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: `Hi, I would like to schedule a viewing for property ID ${id}.`
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const router = useRouter();

  // Email Verification State
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'idle' | 'sent' | 'verified'>('idle');
  const [verificationCodeInput, setVerificationCodeInput] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        headers: { 'Content-Type': 'application/json' },
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

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch Details
        const detailsRes = await fetch(`/api/mls-details?id=${id}${mlsClass ? `&class=${mlsClass}` : ''}`);
        const detailsData = await detailsRes.json();

        if (detailsData.success && detailsData.data) {
          setListing(detailsData.data);
        } else {
          setError(detailsData.error || 'Failed to load property details.');
        }

        // Fetch Images
        const imagesRes = await fetch(`/api/mls-image?id=${id}`);
        const imagesData = await imagesRes.json();

        if (imagesData.success && imagesData.images) {
          setImages(imagesData.images);
        }

      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        <p className="text-sm font-bold uppercase tracking-widest text-gray-500">Loading Property Details...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h1 className="text-4xl font-light mb-4 text-black">Listing Not Found</h1>
          <p className="text-gray-500 mb-8">{error || "The property you are looking for may have been removed or does not exist."}</p>
          <Link href="/search" className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-500 transition-colors">
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  const price = listing.L_AskingPrice ? parseInt(listing.L_AskingPrice, 10) : 0;
  const address = `${listing.L_AddressNumber || ''} ${listing.L_AddressStreet || ''}`.trim() || 'Address Unavailable';
  const city = listing.L_City || '';
  const state = listing.L_State || 'NJ';
  const zip = listing.L_Zip || '';
  const isRent = listing.L_SaleRent === 'R' || listing.L_SaleRent === 'Rent' || listing.mlsClass === 'RN_4';

  const isResidential = ['RE_1', 'CT_3', 'RN_4', 'MF_2'].includes(listing.mlsClass || 'RE_1');
  const beds = isResidential && (!listing.L_BedroomsTotal || listing.L_BedroomsTotal === '0') && (!listing.LM_Int1_1 || listing.LM_Int1_1 === '0')
    ? 'Studio'
    : (listing.L_BedroomsTotal || listing.LM_Int1_1 || '-');
  const bathsFull = listing.L_BathsFull || listing.LM_Int1_19 || '-';
  const bathsHalf = listing.L_BathsHalf || listing.LM_Int1_20 || '0';
  const sqft = listing.L_SquareFeet || listing.LM_Int4_4 || 'N/A'; // NJMLS SandBox often omits SqFt, so 'N/A' is expected
  const agentPhone = listing.LA1_PhoneNumber1 || listing.LA1_PhoneNumber2 || '';
  const agentEmail = listing.LA1_Email || '';
  const officePhone = listing.LO1_PhoneNumber1 || '';
  const agentName = listing.LA1_UserFirstName ? `${listing.LA1_UserFirstName} ${listing.LA1_UserLastName}` : (listing.L_ListAgent1 || 'Unknown');
  const officeName = listing.LO1_OrganizationName || listing.L_ListOffice1 || 'Unknown';

  const rawRemarks = listing.LR_remarks11 || listing.L_Remarks || 'No formal description provided by the listing agent for this property.';
  const englishRemarks = rawRemarks.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

  const handleTranslate = async () => {
    if (lang === 'ko') return;
    setLang('ko');
    if (koreanRemarks) return;

    try {
      setIsTranslating(true);
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: englishRemarks })
      });
      const data = await res.json();
      if (data.success) {
        setKoreanRemarks(data.translation);
      } else {
        setKoreanRemarks('번역을 불러오는 중 오류가 발생했습니다.');
      }
    } catch (err) {
      setKoreanRemarks('번역을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentChecked || !emailVerified || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/property-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          propertyAddress: `${listing?.L_AddressNumber || ''} ${listing?.L_AddressStreet || ''}`.trim(),
          propertyMlsId: listing?.L_ListingID,
          propertyZip: listing?.L_Zip,
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
        alert(data.error || 'Failed to send inquiry. Please try again later.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPropertyType = (type: string, mlsClass?: string, style?: string) => {
    if (mlsClass === 'CM_5' || mlsClass === 'BU_7') return 'Commercial';

    // Normalize style for checking
    const s = (style || '').toLowerCase();

    // Direct style overrides
    if (s.includes('duplex')) return 'Multi-Floor';
    if (s.includes('condo')) return 'Condo';
    if (s.includes('co-op') || s.includes('coop')) return 'Co-op';
    if (s.includes('townhouse')) return 'Townhouse';
    if (s.includes('single family')) return 'Single Family';

    const isSaleClass = ['RE_1', 'CT_3', 'MF_2'].includes(mlsClass || '');

    switch (type) {
      case '1': return 'Single Family';
      case '7':
      case '9':
      case '18':
      case '28':
        return isSaleClass ? 'Single Family' : 'Apartment';
      case '12': return 'Condo';
      case '14': return 'Co-op';
      case '16': return 'Multi-Floor';
      case '17':
        // For Type 17, if it's not explicitly a duplex in style, it's often a single family in rental class
        return s.includes('ranch') || s.includes('col') || s.includes('split') ? 'Single Family' : 'Multi-Floor';
      case '19': return 'Condo';
      case '20': return 'Condo';
      case '21': return 'Condo';
      case '26': return 'Townhouse';
      default: return null;
    }
  };

  const propertyTypeName = getPropertyType(listing.L_Type_, listing.mlsClass, listing.LM_Char10_7);
  const unit = listing.L_AddressUnit ? `, Unit ${listing.L_AddressUnit}` : '';

  // Status Labels
  const statusMap: Record<string, string> = {
    '1': 'Active',
    '2': 'Sold',
    '3': 'Under Contract',
    '4': 'Expired',
    '5': 'Withdrawn',
    '6': 'Leased'
  };
  const statusLabel = statusMap[listing.L_StatusCatID] || 'Active';
  const isSold = listing.L_StatusCatID === '2' || listing.L_StatusCatID === '6';

  return (
    <div className="pb-20 flex-grow">
      {/* Basic Header (Dark Background for Transparent Navbar) */}
      <div className="bg-gray-900 pt-32 pb-16 px-6 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <Link href="/search" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white mb-6 inline-block transition-colors">
            &larr; Back to Listings
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {statusLabel !== 'Active' && (
                  <span className={`text-white text-xs font-bold px-3 py-1 uppercase tracking-widest ${isSold ? 'bg-red-600' : 'bg-orange-500'}`}>
                    {statusLabel}
                  </span>
                )}
                <span className="bg-transparent border border-gray-500 text-white text-xs font-bold px-3 py-1 uppercase tracking-widest">{isRent ? 'For Lease' : 'For Sale'}</span>
                {propertyTypeName && (
                  <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-widest">{propertyTypeName}</span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-light text-white mb-2">{address}{unit}</h1>
              <p className="text-xl text-gray-400 mb-6">{city}, {state} {zip}</p>

              <div className="flex flex-col gap-1 border-l-2 border-gray-600 pl-4 py-1">
                <p className="text-sm text-gray-400">
                  <span className="uppercase tracking-widest text-[10px] mr-2">Listing Agent</span>
                  <span className="font-semibold text-white">{agentName}</span>
                  {(agentPhone || agentEmail) && (
                    <span className="ml-2 text-gray-400 font-normal">
                      ({agentPhone}{agentPhone && agentEmail && ' | '}{agentEmail})
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-400">
                  <span className="uppercase tracking-widest text-[10px] mr-2">Listing Office</span>
                  <span className="font-semibold text-white">{officeName}</span>
                  {officePhone && (
                    <span className="ml-2 text-gray-400 font-normal">
                      ({officePhone})
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="text-left md:text-right mt-6 md:mt-0">
              <p className="text-3xl md:text-4xl font-medium text-white">
                {formatter.format(price)}
                {isRent && <span className="text-xl text-gray-400 font-normal">/mo</span>}
              </p>
              <p className="text-sm text-gray-400 mt-2 uppercase tracking-widest font-medium">MLS# {listing.L_ListingID}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">

          {/* Image Gallery */}
          <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
            {images.length > 0 ? (
              <div className="relative aspect-[16/9] w-full bg-white">
                <Image
                  src={images[activeImageIndex]}
                  alt={address}
                  fill
                  unoptimized
                  className="object-contain"
                />
                <div className={`absolute bottom-4 right-4 bg-black/70 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-sm font-medium tracking-widest uppercase transition-opacity duration-300 ${showCounter ? 'opacity-100' : 'opacity-0'}`}>
                  {activeImageIndex + 1} of {images.length} Photos
                </div>
              </div>
            ) : (
              <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-indigo-50 to-gray-100 flex flex-col items-center justify-center space-y-4 p-8 text-center">
                <div className="bg-white/50 backdrop-blur-sm p-5 rounded-full shadow-sm border border-gray-100">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div className="flex flex-col gap-2">
                  {listing.L_ListingDate === '2026-03-04' && (
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-[0.2em]">New Listing</span>
                  )}
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Photo Coming Soon</span>
                </div>
              </div>
            )}

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div
                className="relative flex gap-2 p-3 overflow-x-auto bg-gray-50 border-t border-gray-100"
                onMouseEnter={() => setShowCounter(true)}
                onMouseLeave={() => setShowCounter(false)}
              >
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    onMouseEnter={() => setActiveImageIndex(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveImageIndex(idx);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View photo ${idx + 1}`}
                    className={`relative w-24 h-16 flex-shrink-0 rounded overflow-hidden cursor-pointer hover:opacity-100 transition-opacity border-2 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 ${idx === activeImageIndex ? 'border-indigo-600 opacity-100' : 'border-transparent opacity-60'}`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx + 1}`} fill unoptimized className="object-cover" />
                  </div>
                ))}

              </div>
            )}
          </div>

          {/* Specs */}
          {isResidential && (
            <div className="grid grid-cols-3 gap-4 border-y border-gray-200 py-8 text-center">
              <div>
                <span className="block text-2xl font-bold text-black">{beds}</span>
                <span className="text-xs uppercase tracking-widest text-gray-500">Bedrooms</span>
              </div>
              <div className="border-x border-gray-200">
                <span className="block text-2xl font-bold text-black">{bathsFull}{bathsHalf !== '0' ? '.5' : ''}</span>
                <span className="text-xs uppercase tracking-widest text-gray-500">Bathrooms</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-black">{sqft}</span>
                <span className="text-xs uppercase tracking-widest text-gray-500">Sq Ft</span>
              </div>
            </div>
          )}

          {!isResidential && sqft !== 'N/A' && (
            <div className="border-y border-gray-200 py-8 text-center">
              <div>
                <span className="block text-2xl font-bold text-black">{sqft}</span>
                <span className="text-xs uppercase tracking-widest text-gray-500">Sq Ft</span>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold uppercase tracking-widest text-black">About this Home</h2>
              <div className="flex bg-gray-100 rounded-md p-1">
                <button
                  onClick={() => setLang('en')}
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-sm transition-colors ${lang === 'en' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}
                >
                  EN
                </button>
                <button
                  onClick={handleTranslate}
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-sm transition-colors ${lang === 'ko' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}
                >
                  KO
                </button>
              </div>
            </div>
            {isTranslating ? (
              <div className="animate-pulse flex flex-col gap-3 py-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-[90%]"></div>
                <div className="h-4 bg-gray-200 rounded w-[95%]"></div>
                <div className="h-4 bg-gray-200 rounded w-[80%]"></div>
                <div className="h-4 bg-gray-200 rounded w-[60%]"></div>
              </div>
            ) : (
              <p className="text-gray-600 leading-loose text-lg font-light text-justify whitespace-pre-line">
                {lang === 'en' ? englishRemarks : koreanRemarks}
              </p>
            )}
            <hr className="my-8 border-gray-100" />
            <p className="text-xs text-gray-400 italic">
              Information is deemed reliable but not guaranteed. NJMLS and the listing agent assume no responsibility for typographical errors, misprints, or misinformation.
            </p>
          </div>

        </div>

        {/* Sidebar / Contact */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-8 border border-gray-200 sticky top-32">
            <h3 className="text-xl font-light text-black mb-2">Interested in this property?</h3>
            <p className="text-gray-500 text-sm mb-6">Schedule a private tour with Eunice for {address}.</p>

            {!submitted ? (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="firstName" className="text-xs font-bold uppercase tracking-wider text-gray-700">First Name *</label>
                    <input type="text" id="firstName" name="firstName" required value={formData.firstName} onChange={handleFormChange} placeholder="First" className="w-full bg-white border border-gray-300 p-2 text-sm text-gray-900 focus:outline-none focus:border-black placeholder-gray-400 block" />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="lastName" className="text-xs font-bold uppercase tracking-wider text-gray-700">Last Name *</label>
                    <input type="text" id="lastName" name="lastName" required value={formData.lastName} onChange={handleFormChange} placeholder="Last" className="w-full bg-white border border-gray-300 p-2 text-sm text-gray-900 focus:outline-none focus:border-black placeholder-gray-400 block" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-gray-700">Email Address *</label>
                  <div className="flex gap-2">
                    <input type="email" id="email" name="email" required disabled={emailVerified} value={formData.email} onChange={handleFormChange} placeholder="your@email.com" className={`flex-1 min-w-0 bg-white border border-gray-300 p-2 text-sm text-black focus:outline-none focus:border-black placeholder-gray-400 block ${emailVerified ? 'bg-gray-100' : ''}`} />
                    {!emailVerified ? (
                      <button type="button" onClick={handleVerifyEmail} disabled={resendCountdown > 0 || !formData.email} className={`flex-shrink-0 px-3 font-bold uppercase tracking-wider text-xs transition-colors whitespace-nowrap min-w-[80px] ${resendCountdown > 0 || !formData.email ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-900'}`}>
                        {resendCountdown > 0 ? `Wait (${resendCountdown}s)` : (verificationStep === 'sent' ? 'Resend' : 'Verify')}
                      </button>
                    ) : (
                      <div className="flex items-center px-3 bg-green-50 border border-green-200 text-green-700 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap">
                        Verified
                      </div>
                    )}
                  </div>
                </div>

                {/* Email Verification Code Input */}
                {verificationStep === 'sent' && (
                  <div className="space-y-2 bg-gray-100 p-3 mt-1 relative">
                    <label htmlFor="code" className="text-xs font-bold uppercase tracking-wider text-gray-700 block">Enter Code</label>
                    <div className="flex gap-2">
                      <input type="text" id="code" value={verificationCodeInput} onChange={(e) => setVerificationCodeInput(e.target.value)} className="w-full px-2 py-1.5 bg-white border border-gray-300 focus:border-black text-sm text-black block outline-none" placeholder="6-digit code" maxLength={6} />
                      <button type="button" onClick={handleConfirmCode} className="bg-black text-white px-3 font-bold uppercase tracking-wider text-xs hover:bg-gray-900 transition-colors">
                        Confirm
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-1 mt-2">
                  <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-gray-700">Phone (Optional)</label>
                  <input type="tel" id="phone" name="phone" disabled={!emailVerified} value={formData.phone} onChange={handleFormChange} placeholder={!emailVerified ? "Verify email to unlock" : "(555) 555-5555"} className={`w-full bg-white border border-gray-300 p-2 text-sm text-black focus:outline-none focus:border-black placeholder-gray-400 block ${!emailVerified ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`} />
                </div>

                <div className="space-y-1 mt-2">
                  <label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-gray-700">Message *</label>
                  <textarea id="message" name="message" required disabled={!emailVerified} rows={3} value={formData.message} onChange={handleFormChange} placeholder={!emailVerified ? "Verify email to unlock" : "I'm interested in this property."} className={`w-full bg-white border border-gray-300 p-2 text-sm text-black focus:outline-none focus:border-black placeholder-gray-400 block resize-none ${!emailVerified ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`} />
                </div>

                {/* Consent Checkbox */}
                <div className="flex items-start space-x-2 mt-4">
                  <div className="flex items-center h-4 mt-0.5">
                    <input id="consent" name="consent" type="checkbox" checked={consentChecked} disabled={!formData.message || formData.message.length === 0} onChange={(e) => setConsentChecked(e.target.checked)} className={`h-3 w-3 text-black border-gray-300 rounded focus:ring-black ${(!formData.message || formData.message.length === 0) ? 'cursor-not-allowed opacity-50' : ''}`} />
                  </div>
                  <div className={`text-[10px] leading-tight ${(!formData.message || formData.message.length === 0) ? 'opacity-50' : ''}`}>
                    <label htmlFor="consent" className="font-bold text-gray-900 block mb-0.5">
                      I consent to receive text messages and phone calls.
                    </label>
                    <p className="text-gray-500 text-justify">
                      By checking this box, I consent to RE/MAX Now contacting me at this number. Message frequency varies. Data rates may apply. See <a href="/privacy-policy" className="underline hover:text-black">Privacy Policy</a> & <a href="/terms-of-use" className="underline hover:text-black">Terms</a>.
                    </p>
                  </div>
                </div>

                <button type="submit" disabled={!consentChecked || isSubmitting} className={`w-full font-bold uppercase tracking-widest py-3 mt-4 transition-colors ${(!consentChecked || isSubmitting) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'}`}>
                  {isSubmitting ? 'Sending...' : 'Request Info'}
                </button>
              </form>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Inquiry Sent!</h3>
                <p className="text-sm text-gray-600">Thank you. Eunice will be in touch shortly regarding {address}.</p>
                <button onClick={() => { setSubmitted(false); setEmailVerified(false); setVerificationStep('idle'); setConsentChecked(false); setFormData(p => ({ ...p, message: `Hi, I would like to schedule a viewing for property ID ${id}.` })); }} className="mt-4 text-xs font-medium text-black border-b border-black pb-0.5 hover:text-gray-600 hover:border-gray-600 transition-colors">
                  Request Info
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
