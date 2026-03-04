import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getCurrentUser } from '@/lib/auth-server';

export default async function LeasePage() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-white font-sans flex flex-col">
      <Navbar theme="light" user={user} />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-slate-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-light tracking-tight text-slate-900 mb-8">
            Residential Lease Services <br />
            <span className="font-bold">Effortless Leasing, Trusted Partner</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl font-light leading-relaxed">
            Whether you are a tenant seeking a new home or a landlord looking for qualified residents, Eunice provides expert guidance through New Jersey&apos;s complex leasing regulations.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20">
        <div className="space-y-12">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">For Tenants</h2>
            <div className="space-y-6">
              <p className="text-gray-600 text-lg leading-relaxed font-light">
                We simplify your search and application process. Eunice helps you find the right neighborhood, understand lease terms, and navigate the necessary documentation:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-gray-600 font-light text-lg">
                <li>Comprehensive tenant screening prep</li>
                <li>Credit report and income verification assistance</li>
                <li>Strategic offer presentation for competitive units</li>
                <li>Lease review and move-in coordination</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">For Landlords</h2>
            <div className="space-y-6">
              <p className="text-gray-600 text-lg leading-relaxed font-light">
                Secure high-quality tenants and maintain your property&apos;s value. Our marketing and vetting process is designed for peace of mind:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-gray-600 font-light text-lg">
                <li>Professional rental market analysis</li>
                <li>Premium property listing and photography</li>
                <li>Rigorous applicant screening and vetting</li>
                <li>NJ-compliant lease drafting coordination</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-12 border-l-8 border-slate-900 space-y-8">
          <h2 className="text-3xl font-light">
            Legal <span className="font-bold">Compliance & Rights</span>
          </h2>
          <div className="space-y-6 text-gray-700">
            <p className="font-light leading-relaxed">
              New Jersey has strict laws regarding security deposits, fair housing, and lead-based paint notifications.
            </p>
            <div className="p-6 bg-white border border-gray-200 shadow-sm italic font-light">
              &quot;Eunice ensures all agreements adhere to the Truth in Renting Act and other local NJ regulations, protecting sowohl tenants than landlords.&quot;
            </div>
            <p className="font-light leading-relaxed pt-4">
              We guide you through current market trends, including the latest pet policies and utility responsibilities specific to different municipalities in Bergen and Hudson counties.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
