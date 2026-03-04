import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getCurrentUser } from '@/lib/auth-server';

export default async function CommercialPage() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-white font-sans flex flex-col">
      <Navbar theme="light" user={user} />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-8">
            Commercial & <br />
            <span className="font-bold whitespace-nowrap">Investment Real Estate</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl font-light leading-relaxed">
            Professional brokerage services for business owners, investors, and developers in the New Jersey metropolitan area.
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-b border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-black pl-4">Business Brokerage</h2>
            <p className="text-gray-600 font-light leading-relaxed">
              We facilitate the sale and acquisition of businesses across various sectors, ensuring meticulous valuation and confidential handling of all transactions.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-black pl-4">Commercial Leasing</h2>
            <p className="text-gray-600 font-light leading-relaxed">
              Strategic tenant representation and landlord services for retail, office, and industrial spaces, with a focus on favorable lease terms and long-term viability.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-black pl-4">Asset Management</h2>
            <p className="text-gray-600 font-light leading-relaxed">
              Our investment-focused approach helps you identify high-yield properties and manage your portfolio for maximum performance in the NJ market.
            </p>
          </div>
        </div>
      </section>

      {/* Professional Edge Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        <div className="space-y-8">
          <h2 className="text-4xl font-light text-slate-900">
            Expert <span className="font-bold">Transaction Support</span>
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed font-light">
            Commercial real estate involves complex due diligence, zoning considerations, and financial analysis. Eunice brings a sophisticated understanding of these elements to every deal.
          </p>
          <ul className="space-y-4 text-gray-700 font-light">
            <li className="flex items-start gap-3 italic">
              <span className="text-black font-bold">✓</span>
              Detailed financial modeling and ROI projections
            </li>
            <li className="flex items-start gap-3 italic">
              <span className="text-black font-bold">✓</span>
              Zoning and land use feasibility assessments
            </li>
            <li className="flex items-start gap-3 italic">
              <span className="text-black font-bold">✓</span>
              Environmental (Phase I/II) coordination
            </li>
            <li className="flex items-start gap-3 italic">
              <span className="text-black font-bold">✓</span>
              Sophisticated lease and contract negotiation
            </li>
          </ul>
        </div>

        <div className="bg-slate-50 p-12 shadow-sm border border-gray-100 space-y-8">
          <h3 className="text-2xl font-bold text-slate-900">Market Specialized Knowledge</h3>
          <p className="text-gray-600 font-light leading-relaxed">
            Our team maintains a proprietary database of market data and local insights, allowing us to identify emerging opportunities before they hit the broader market.
          </p>
          <div className="grid grid-cols-2 gap-8 text-center pt-8 border-t border-gray-200">
            <div>
              <div className="text-3xl font-bold text-black">15+</div>
              <div className="text-xs uppercase tracking-widest text-gray-500 mt-2">Years Exp.</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-black">NJ</div>
              <div className="text-xs uppercase tracking-widest text-gray-500 mt-2">Certified</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
