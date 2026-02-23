"use client";

import { useState, useEffect } from 'react';

export default function ContactForm() {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (data.success) {
        setServerCodeHash(data.hash);
      } else {
        alert("Failed to send email: " + (data.error || "Unknown error"));
        setVerificationStep('idle');
        setResendCountdown(0); // Reset timer on failure
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
      alert("Email verified successfully!");
    } else {
      alert("Incorrect code. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentChecked || !emailVerified) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
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
          <h3 className="text-2xl font-bold uppercase tracking-wider mb-6">Send a Message</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-bold uppercase tracking-wider text-gray-700">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                placeholder="First Name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-bold uppercase tracking-wider text-gray-700">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                placeholder="Last Name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-bold uppercase tracking-wider text-gray-700">Email Address</label>
            <div className="flex gap-2">
              <input
                type="email"
                id="email"
                name="email"
                required
                disabled={emailVerified}
                value={formData.email}
                onChange={handleChange}
                className={`flex-1 min-w-0 px-4 py-3 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors ${emailVerified ? 'bg-gray-100 text-gray-500' : ''}`}
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
                  className="w-full px-4 py-2 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
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
            <label htmlFor="phone" className="text-sm font-bold uppercase tracking-wider text-gray-700">Phone (Optional)</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              disabled={!emailVerified}
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors ${!emailVerified ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
              placeholder={!emailVerified ? "Verify email to unlock" : "(555) 555-5555"}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-bold uppercase tracking-wider text-gray-700">Message</label>
            <textarea
              id="message"
              name="message"
              required
              disabled={!emailVerified}
              rows={5}
              value={formData.message}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors resize-none ${!emailVerified ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
              placeholder={!emailVerified ? "Verify email to unlock" : "How can we help you?"}
            />
          </div>

          {/* Consent Checkbox */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex items-center h-5">
                <input
                  id="consent"
                  name="consent"
                  type="checkbox"
                  checked={consentChecked}
                  disabled={!formData.message || formData.message.length === 0}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className={`h-4 w-4 text-black border-gray-300 rounded focus:ring-black ${(!formData.message || formData.message.length === 0) ? 'cursor-not-allowed opacity-50' : ''}`}
                />
              </div>
              <div className={`text-sm ${(!formData.message || formData.message.length === 0) ? 'opacity-50' : ''}`}>
                <label htmlFor="consent" className="font-bold text-gray-900 block mb-1">
                  I consent to receive text messages and phone calls.
                </label>
                <p className="text-xs text-gray-500 leading-relaxed text-justify">
                  By providing my phone number above and checking this box, I expressly consent to RE/MAX Now, directly or by a third party vendor, InsideRE, LLC, acting on RE/MAX Now's behalf, contacting me at this number by calling me or sending me text messages, including marketing and promotional messages, using an automatic telephone dialing system, related to our products and services for real estate transactions, even if my name appears on the "Do Not Call" list. Providing my consent is not required to obtain our products or services. Message and data rates may apply. Message frequency varies. Text HELP for help or STOP to unsubscribe. My information will be handled in accordance with RE/MAX Now's <a href="/privacy-policy" className="underline hover:text-black">Privacy Policy</a> and RE/MAX Now's <a href="/terms-of-use" className="underline hover:text-black">Terms & Conditions</a>.
                </p>
              </div>
            </div>
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
