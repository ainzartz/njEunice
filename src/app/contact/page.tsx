"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  // Consent State
  const [consentChecked, setConsentChecked] = useState(false);

  // Email Verification State
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'idle' | 'sent' | 'verified'>('idle');
  const [generatedCode, setGeneratedCode] = useState('');
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVerifyEmail = () => {
    if (!formData.email) {
      alert("Please enter an email address first.");
      return;
    }
    // Generate 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setVerificationStep('sent');
    setResendCountdown(15);

    // Mock Send
    console.log("--------------------------------");
    console.log(`[MOCK EMAIL SEND] To: ${formData.email}`);
    console.log(`[MOCK EMAIL SEND] Verification Code: ${code}`);
    console.log("--------------------------------");
    alert(`Testing Mode: Verification code is ${code}`);
  };

  const handleConfirmCode = () => {
    if (verificationCodeInput === generatedCode) {
      setEmailVerified(true);
      setVerificationStep('verified');
      setVerificationCodeInput('');
      setResendCountdown(0);
      alert("Email verified successfully!");
    } else {
      alert("Incorrect code. Please try again.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    console.log('Form submitted:', formData);
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero / Header Section */}
      <div className="relative bg-black text-white pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-widest mb-4">Contact Us</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Ready to start your real estate journey? Get in touch with us today.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Contact Information */}
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-wider mb-6">Get In Touch</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Whether you're looking to buy, sell, or simply have questions about the New Jersey market,
                I'm here to help. Reach out directly or use the form to send a message.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 mt-1 flex-shrink-0">
                    <svg className="w-full h-full text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Office Location</h3>
                    <p className="text-gray-600">
                      460 Bergen Blvd. Suite 120<br />
                      Palisades Park, NJ 07650
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 mt-1 flex-shrink-0">
                    <svg className="w-full h-full text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Phone</h3>
                    <p className="text-gray-600">
                      <span className="font-medium text-black">Mobile:</span> 201.290.5256
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium text-black">Office:</span> 201.891.8000
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 mt-1 flex-shrink-0">
                    <svg className="w-full h-full text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Email</h3>
                    <a href="mailto:realtoreunicehwang@gmail.com" className="text-gray-600 hover:text-black transition-colors underline">
                      realtoreunicehwang@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 p-8 md:p-12 rounded-lg border border-gray-100 shadow-sm">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-2xl font-bold uppercase tracking-wider mb-6">Send a Message</h3>

                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-bold uppercase tracking-wider text-gray-700">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                    placeholder="Your Name"
                  />
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
                      className={`w-full px-4 py-3 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors ${emailVerified ? 'bg-gray-100 text-gray-500' : ''}`}
                      placeholder="your@email.com"
                    />
                    {!emailVerified ? (
                      <button
                        type="button"
                        onClick={handleVerifyEmail}
                        disabled={resendCountdown > 0 || !formData.email}
                        className={`px-6 font-bold uppercase tracking-wider text-sm transition-colors whitespace-nowrap min-w-[120px] ${resendCountdown > 0 || !formData.email
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
                  disabled={!consentChecked}
                  className={`w-full py-4 font-bold uppercase tracking-widest transition-colors ${!consentChecked
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-900'
                    }`}
                >
                  Send Message
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
                    setFormData({ name: '', email: '', phone: '', message: '' });
                    setConsentChecked(false);
                  }}
                  className="mt-8 text-sm font-medium text-black border-b border-black pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors"
                >
                  Send another message
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
