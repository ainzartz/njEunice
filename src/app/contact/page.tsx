import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import { getCurrentUser } from '@/lib/auth-server';

export default async function ContactPage() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-white">
      <Navbar user={user} />

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
          <ContactForm />

        </div>
      </div>

      <Footer />
    </main>
  );
}
