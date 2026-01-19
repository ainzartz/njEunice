import Link from 'next/link';
// Minimal layout: No Navbar or Footer components

export default function AccessibilityPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-4xl space-y-10">

        {/* Header */}
        <div className="border-b border-black pb-8 text-center pt-12">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-black mb-4 inline-block">
            Accessibility Statement
          </h1>
        </div>

        {/* Content */}
        <div className="space-y-8 text-gray-700 leading-relaxed font-light text-lg text-justify max-w-4xl mx-auto">
          <p>
            We strive to provide a website in which all functionality and content are accessible to all individuals, and we are updating our site regularly to make it as accessible as possible. Our website strives to meet Level AA Success Criteria of the Web Content Accessibility Guidelines 2.1 to the greatest extent feasible.
          </p>
          <p>
            Should you require assistance in navigating our website or searching for real estate, please contact us at <span className="text-black font-medium">201-290-5256</span> or <span className="text-black font-medium">201-891-8000</span>. We are happy to assist you by phone.
          </p>
        </div>

        {/* Return Link */}
        <div className="pt-12 text-center pb-20">
          <Link href="/" className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-500 transition-colors">
            Return to Home
          </Link>
        </div>

      </div>
    </main>
  );
}
