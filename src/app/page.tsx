import { getCurrentUser } from '@/lib/auth-server';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import Testimonials from '@/components/Testimonials';
import Link from 'next/link';
import ScrollRevealImage from '@/components/ScrollRevealImage';

export default async function Home() {
  const user = await getCurrentUser();
  return (
    <main className="min-h-screen font-sans bg-white selection:bg-black selection:text-white">
      <Navbar user={user} />
      <Hero />

      {/* Realtor Bio Section */}
      <section id="about" className="py-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
        <div className="w-full md:w-1/2 relative h-[600px] bg-gray-100 p-8 shadow-2xl">
          <ScrollRevealImage
            src="/images/eunice.jpg"
            alt="Eunice - Professional Realtor"
            fill={true}
          />
          {/* Decorative frame */}
          <div className="absolute top-0 left-0 w-full h-full border border-black transform translate-x-4 translate-y-4 -z-10"></div>
        </div>

        <div className="w-full md:w-1/2 space-y-8">
          <h2 className="text-4xl font-light tracking-tight text-gray-900 border-l-4 border-black pl-6">
            Meet Eunice <br />
            <span className="font-bold">Your Trusted NJ Partner</span>
          </h2>

          <p className="text-gray-600 leading-relaxed text-lg font-light">
            Eunice is a professional real estate agent specializing in the New Jersey metropolitan area. With years of dedicated service, she brings a wealth of market knowledge and specific expertise in luxury homes, investment properties, and commercial real estate.
          </p>

          <p className="text-gray-600 leading-relaxed text-lg font-light">
            Her commitment to excellence is reflected in her recognition as a recipient of the <span className="font-bold text-black">NJ REALTORS® Circle of Excellence Sales Award</span>, a distinction that honors her consistent sales performance and dedication to client success.
          </p>

          <div className="pt-8 flex flex-col sm:flex-row gap-4">
            <Link href="/about" className="inline-block px-8 py-3 bg-black text-white font-medium uppercase tracking-widest hover:bg-gray-800 transition-colors text-center">
              More About Eunice
            </Link>
            <Link
              href="/market-insights"
              className="inline-block px-8 py-3 border border-black text-black font-medium uppercase tracking-widest hover:bg-black hover:text-white transition-colors text-center"
            >
              Realtor&apos;s Investment Vision
            </Link>
          </div>
        </div>
      </section>

      <Testimonials />

      {/* Featured Listings Placeholder */}
      <section className="py-20 bg-gray-50 px-6">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h3 className="text-2xl font-bold uppercase tracking-widest mb-4">Featured Properties</h3>
          <div className="h-0.5 w-16 bg-black mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[4/5] bg-white border border-gray-200 flex items-center justify-center relative group overflow-hidden cursor-pointer">
              <p className="text-gray-400 text-sm tracking-widest uppercase z-10">Listing {i}</p>
              <div className="absolute inset-0 bg-gray-100 group-hover:bg-gray-200 transition-colors"></div>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/buy" className="text-sm font-bold border-b border-black pb-1 hover:text-gray-600 transition-colors uppercase tracking-widest">
            View All Listings
          </Link>
        </div>
      </section>

      <Footer />


    </main>
  );
}
