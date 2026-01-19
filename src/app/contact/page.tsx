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

  // Consent and CAPTCHA State
  const [consentChecked, setConsentChecked] = useState(false);
  const [captchaTarget, setCaptchaTarget] = useState<number | null>(null);
  const [captchaInput, setCaptchaInput] = useState('');

  // Generate random 4-digit number on mount
  useEffect(() => {
    setCaptchaTarget(Math.floor(1000 + Math.random() * 9000));
  }, []);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                    placeholder="your@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-bold uppercase tracking-wider text-gray-700">Phone (Optional)</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                    placeholder="(555) 555-5555"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-bold uppercase tracking-wider text-gray-700">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors resize-none"
                    placeholder="How can we help you?"
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
                        onChange={(e) => setConsentChecked(e.target.checked)}
                        className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                      />
                    </div>
                    <div className="text-sm">
                      <label htmlFor="consent" className="font-bold text-gray-900 block mb-1">
                        I consent to receive text messages and phone calls.
                      </label>
                      <p className="text-xs text-gray-500 leading-relaxed text-justify">
                        By providing my phone number above and checking this box, I expressly consent to RE/MAX Now, directly or by a third party vendor, InsideRE, LLC, acting on RE/MAX Now's behalf, contacting me at this number by calling me or sending me text messages, including marketing and promotional messages, using an automatic telephone dialing system, related to our products and services for real estate transactions, even if my name appears on the "Do Not Call" list. Providing my consent is not required to obtain our products or services. Message and data rates may apply. Message frequency varies. Text HELP for help or STOP to unsubscribe. My information will be handled in accordance with RE/MAX Now's <a href="/privacy-policy" className="underline hover:text-black">Privacy Policy</a> and RE/MAX Now's <a href="/terms-of-use" className="underline hover:text-black">Terms & Conditions</a>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* CAPTCHA Verification */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-700">Verification</label>
                  <div className="flex items-center space-x-4">
                    {/* Display Random Number */}
                    <div className="bg-gray-100 border border-gray-300 px-6 py-2 rounded text-xl font-mono font-bold tracking-widest text-gray-700 select-none">
                      {captchaTarget}
                    </div>
                    {/* User Input */}
                    <input
                      type="text"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      placeholder="Enter number"
                      maxLength={4}
                      className="w-40 px-4 py-2 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Please enter the number above to verify you are human.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!consentChecked || captchaInput !== captchaTarget?.toString()}
                  className={`w-full py-4 font-bold uppercase tracking-widest transition-colors ${(!consentChecked || captchaInput !== captchaTarget?.toString())
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
                  onClick={() => setSubmitted(false)}
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
