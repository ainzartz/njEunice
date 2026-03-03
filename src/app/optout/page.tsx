"use client";

import { useState, useEffect } from 'react';

export default function OptOutPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email Verification State
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'idle' | 'sent' | 'verified'>('idle');
  const [verificationCodeInput, setVerificationCodeInput] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [serverCodeHash, setServerCodeHash] = useState('');

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const sha256 = async (message: string) => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleVerifyEmail = async () => {
    if (!formData.email) {
      alert("Please enter an email address first.");
      return;
    }

    setVerificationStep('sent');
    setResendCountdown(60);

    try {
      const response = await fetch('/api/email/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (data.success) {
        setServerCodeHash(data.hash);
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

    if (!serverCodeHash) {
      alert("Please wait a moment while the email is being sent.");
      return;
    }

    const inputHash = await sha256(verificationCodeInput);

    if (inputHash === serverCodeHash) {
      setEmailVerified(true);
      setVerificationStep('verified');
      setVerificationCodeInput('');
      setResendCountdown(0);
    } else {
      alert("Incorrect code. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailVerified || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/opt-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
      } else {
        alert(data.error || 'Failed to process request. Please try again later.');
      }
    } catch (error) {
      console.error('Error submitting opt-out:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-xl w-full space-y-8">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-black border-b border-black pb-8 inline-block">
          Marketing Opt-Out
        </h1>

        {!submitted ? (
          <>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base font-light">
              Please verify your email address to be removed from our marketing communications.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6 text-left mt-8">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-xs font-bold uppercase tracking-widest text-gray-900 mb-2">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full border-b border-gray-300 py-2 bg-transparent focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-xs font-bold uppercase tracking-widest text-gray-900 mb-2">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full border-b border-gray-300 py-2 bg-transparent focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-gray-900 mb-2">Email Address</label>
                <div className="flex gap-2 relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    disabled={emailVerified || verificationStep === 'sent'}
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`flex-grow border-b border-gray-300 py-2 bg-transparent focus:outline-none focus:border-black transition-colors ${emailVerified ? 'text-gray-400' : 'text-black'}`}
                  />
                  {!emailVerified && verificationStep !== 'sent' && (
                    <button
                      type="button"
                      onClick={handleVerifyEmail}
                      className="text-[11px] font-bold uppercase tracking-widest border border-black px-4 py-1.5 hover:bg-black hover:text-white transition-all h-fit self-end mb-1 text-black"
                    >
                      Verify
                    </button>
                  )}
                  {emailVerified && (
                    <span className="absolute right-0 bottom-2 text-[10px] font-bold uppercase tracking-widest text-green-600 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>
              </div>

              {verificationStep === 'sent' && !emailVerified && (
                <div className="bg-gray-50 p-4 border border-gray-100 flex flex-col gap-3">
                  <p className="text-[11px] uppercase font-bold tracking-widest text-gray-900">
                    Verification code sent to {formData.email}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ENTER 6-DIGIT CODE"
                      maxLength={6}
                      value={verificationCodeInput}
                      onChange={(e) => setVerificationCodeInput(e.target.value.replace(/\D/g, ''))}
                      className="flex-grow border border-gray-300 p-2 text-sm focus:outline-none focus:border-black text-black font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleConfirmCode}
                      className="bg-black text-white text-[11px] font-bold uppercase tracking-widest px-6 py-2 hover:bg-gray-800"
                    >
                      Confirm
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      disabled={resendCountdown > 0}
                      onClick={handleVerifyEmail}
                      className={`text-[10px] font-bold uppercase tracking-widest ${resendCountdown > 0 ? 'text-gray-300 cursor-not-allowed' : 'text-black underline'}`}
                    >
                      Resend Code {resendCountdown > 0 && `(${resendCountdown}s)`}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setVerificationStep('idle'); setResendCountdown(0); }}
                      className="text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:text-black hover:underline transition-colors"
                    >
                      Change Email
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-gray-100 italic text-[11px] text-gray-500 leading-relaxed">
                By clicking "Opt Out" below, you confirm that you wish to be removed from NJ Eunice
                Real Estate's email and SMS marketing databases. Please note that this action is legally
                binding upon our organization, and we will cease all automated promotional communications
                to the verified email address and associated mobile numbers within 48 hours.
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!emailVerified || isSubmitting}
                  className={`w-full font-bold uppercase tracking-widest py-4 transition-colors ${(!emailVerified || isSubmitting) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'}`}
                >
                  {isSubmitting ? 'Processing...' : 'Opt Out (수신 거부)'}
                </button>
              </div>
            </form>

            <div className="pt-8 border-t border-gray-100 mt-8">
              <a href="/" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
                Return to Home
              </a>
            </div>
          </>
        ) : (
          <div className="bg-gray-50 p-12 border border-gray-100 mt-8 space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-light text-black">Opt-Out Confirmed</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              We have received your requested removal from our marketing list. <br />
              <strong>Official Notice:</strong> Automated Email and SMS communications to <strong>{formData.email}</strong>
              have been legally terminated in our system. Please allow up to 48 hours for global propagation.
              A formal confirmation has been sent to your email address.
            </p>
            <div className="pt-4">
              <button onClick={() => window.location.href = '/'} className="text-xs font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-500 transition-colors">
                Return to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
