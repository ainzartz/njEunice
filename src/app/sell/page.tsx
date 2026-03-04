import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getCurrentUser } from '@/lib/auth-server';

export default async function SellPage() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-white font-sans flex flex-col">
      <Navbar user={user} />

      {/* Hero Section */}
      <div className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/sell_hero.png"
            alt="Staged Luxury Interior"
            className="w-full h-full object-cover scale-105 animate-subtle-zoom"
          />
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center px-6 pt-20">
          <h1 className="text-5xl md:text-7xl font-normal tracking-tight text-white mb-6 animate-fade-in-up [text-shadow:0_2px_10px_rgba(0,0,0,0.3)]">
            Selling Your Property <br />
            <span className="font-bold">Expert NJ Market Positioning</span>
          </h1>
          <p className="text-gray-300 max-w-3xl mx-auto text-xl font-light leading-relaxed animate-fade-in-up delay-200">
            Maximize the value of your asset with a strategic marketing approach and professional representation. Eunice ensures your property stands out in the competitive New Jersey market.
          </p>
        </div>
      </div>

      {/* Sell Process Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20">
        <div className="bg-slate-900 text-white p-12 shadow-2xl space-y-8 h-fit">
          <h2 className="text-3xl font-light border-l-4 border-white pl-6">
            The <span className="font-bold">Seller&apos;s Strategy</span>
          </h2>

          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-200 underline">Comparative Market Analysis</h3>
            <p className="text-gray-400 font-light leading-relaxed">
              We provide a data-driven valuation that considers recent sales, current competition, and specific property merits to set a competitive yet profitable price point.
            </p>

            <h3 className="text-xl font-bold text-gray-200 underline">Professional Presentation</h3>
            <p className="text-gray-400 font-light leading-relaxed">
              From professional staging to high-end photography and 3D virtual tours, we ensure your property makes an exceptional first impression across all major listing platforms.
            </p>

            <h3 className="text-xl font-bold text-gray-200 underline">Global Network Exposure</h3>
            <p className="text-gray-400 font-light leading-relaxed">
              As part of the RE/MAX NOW network, your property gains exposure to a global audience, attracting qualified buyers from local and international markets.
            </p>
          </div>
        </div>

        <div className="space-y-12 py-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center justify-end gap-4 text-right">
              Preparation & Listing
              <span className="flex items-center justify-center w-10 h-10 border-2 border-black text-black text-sm rounded-full">01</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed font-light text-right">
              Optimizing your property&apos;s condition and completing necessary disclosures before going live to streamline the process and avoid future complications.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center justify-end gap-4 text-right">
              Negotiation & Selection
              <span className="flex items-center justify-center w-10 h-10 border-2 border-black text-black text-sm rounded-full">02</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed font-light text-right">
              Vetting offers based on financial qualifications, terms, and closing timelines. We negotiate firmly to ensure the best possible outcome for you.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center justify-end gap-4 text-right">
              Closing Coordination
              <span className="flex items-center justify-center w-10 h-10 border-2 border-black text-black text-sm rounded-full">03</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed font-light text-right">
              Handling inspections, managing appraisal requirements, and coordinating with attorneys to ensure a smooth, professional closing experience.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
