import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image
            // Using a placeholder or potentially the same hero bg for now 
            // Ideally we'd have a specific different image
            src="/images/hero-bg.png"
            alt="New Jersey Skyline"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-4xl md:text-6xl font-serif mb-4">About Eunice Hwang</h1>
          <p className="text-lg md:text-xl font-light tracking-wide uppercase">Your New Jersey Real Estate Expert</p>
        </div>
      </section>

      {/* Main Bio Content */}
      <section className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="relative h-[600px] w-full rounded-sm overflow-hidden shadow-2xl">
          <Image
            src="/images/eunice.jpg" // Ensuring we use the existing asset
            alt="Eunice Hwang"
            fill
            className="object-cover"
          />
        </div>
        <div className="space-y-8">
          <h2 className="text-3xl font-serif text-black">A Commitment to Excellence</h2>
          <div className="w-20 h-1 bg-black"></div>
          <p className="text-gray-600 leading-relaxed text-lg font-light">
            With years of experience in the New Jersey real estate market, Eunice Hwang has established herself as a premier agent known for her integrity, market knowledge, and unwavering dedication to her clients.
          </p>
          <p className="text-gray-600 leading-relaxed text-lg font-light">
            Specializing in luxury residential properties in Bergen County and surrounding areas, Eunice combines traditional real estate expertise with modern marketing strategies. Whether you are buying your first home, selling a luxury estate, or looking for an investment property, Eunice provides a tailored experience that ensures your goals are met with precision and care.
          </p>
          <p className="text-gray-600 leading-relaxed text-lg font-light">
            "Real estate is more than just transactions; it's about building relationships and helping people find their place in the world. I am honored to be a part of that journey for my clients."
          </p>

          <div className="grid grid-cols-2 gap-8 pt-8">
            <div>
              <span className="block text-4xl font-serif text-black mb-2">10+</span>
              <span className="text-sm font-bold uppercase tracking-widest text-gray-500">Years Active</span>
            </div>
            <div>
              <span className="block text-4xl font-serif text-black mb-2">$50M+</span>
              <span className="text-sm font-bold uppercase tracking-widest text-gray-500">Sales Volume</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services / Philosophy */}
      <section className="bg-neutral-950 text-white py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-12">
          <h2 className="text-3xl md:text-4xl font-serif">The NJ Eunice Standard</h2>
          <p className="text-gray-400 leading-loose text-lg font-light">
            We believe that luxury is an experience, not a price point. Every client receives our full attention, access to exclusive listings, and a strategic partner who navigates the complexities of the market on their behalf. From initial consultation to closing and beyond, we are with you every step of the way.
          </p>
          <div className="pt-8">
            <a href="/contact" className="inline-block border border-white px-10 py-4 text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
              Work With Me
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
