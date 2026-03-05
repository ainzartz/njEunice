import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getCurrentUser } from '@/lib/auth-server';

export default async function BuyPage() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-white font-sans flex flex-col">
      <Navbar user={user} />

      {/* Hero Section */}
      <div className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/buy_hero.png"
            alt="Luxury NJ Home Exterior"
            className="w-full h-full object-cover scale-105 animate-subtle-zoom"
          />
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center px-6 pt-20">
          <h1 className="text-5xl md:text-7xl font-normal tracking-tight text-white mb-6 animate-fade-in-up [text-shadow:0_2px_10px_rgba(0,0,0,0.3)]">
            Buying a Home <br />
            <span className="font-bold">Your NJ Journey Starts Here</span>
          </h1>
          <p className="text-gray-300 max-w-3xl mx-auto text-xl font-light leading-relaxed animate-fade-in-up delay-200">
            Navigating the New Jersey real estate market requires precision, expertise, and a deep understanding of local legal procedures. Eunice provides comprehensive support through every step of your purchase.
          </p>
        </div>
      </div>

      {/* Process Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20">
        <div className="space-y-12">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-4">
              <span className="flex items-center justify-center w-10 h-10 border-2 border-black text-black text-sm rounded-full">01</span>
              Pre-Approval & Planning
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed font-light">
              Understand your budget and the NJ mortgage landscape. We recommend connecting with trusted local lenders to secure a pre-approval, which is essential for a competitive offer in today's market.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-4">
              <span className="flex items-center justify-center w-10 h-10 border-2 border-black text-black text-sm rounded-full">02</span>
              Focused Property Search
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed font-light">
              We leverage deep local knowledge to find properties that match your lifestyle and investment goals, including off-market opportunities and upcoming listings in Bergen and Hudson counties.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-4">
              <span className="flex items-center justify-center w-10 h-10 border-2 border-black text-black text-sm rounded-full">03</span>
              Offer & Negotiation
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed font-light">
              Crafting a winning offer involves more than just price. We analyze comparable sales and market trends to ensure your terms are strong while protecting your interests.
            </p>
          </div>
        </div>

        <div className="bg-black text-white p-12 shadow-2xl space-y-8">
          <h2 className="text-3xl font-light border-l-4 border-white pl-6">
            The <span className="font-bold">NJ Closing Process</span>
          </h2>

          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-200">Attorney Review Period</h3>
            <p className="text-gray-400 font-light leading-relaxed">
              In New Jersey, once a contract is signed, there is typically a 3-day attorney review period. This allows both parties' legal counsel to review and potentially modify the contract terms.
            </p>

            <h3 className="text-xl font-bold text-gray-200">Inspections & Diligence</h3>
            <p className="text-gray-400 font-light leading-relaxed">
              We guide you through professional home inspections, radon testing, and wood-destroying insect surveys to ensure the property's integrity.
            </p>

            <h3 className="text-xl font-bold text-gray-200">Closing & Recording</h3>
            <p className="text-gray-400 font-light leading-relaxed">
              The final step involves the transfer of funds and deed recording. Eunice ensures all documentation is meticulous for a seamless transition.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-8 tracking-tight">
            Ready to Find Your <span className="font-bold">Next Chapter?</span>
          </h2>
          <p className="text-xl text-gray-300 font-light leading-relaxed mb-12">
            Your journey to the perfect address begins with a conversation. Let Eunice guide you through the sophisticated New Jersey market with unparalleled expertise.
          </p>
          <a
            href="/contact?type=buy"
            className="inline-block bg-white text-black px-12 py-4 font-bold uppercase tracking-widest hover:bg-gray-200 transition-all duration-300 shadow-xl hover:scale-105"
          >
            Connect with Eunice
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
