import Link from 'next/link';

export default function CISPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-4xl space-y-10">

        {/* Header */}
        <div className="border-b border-black pb-8 text-center pt-12">
          <h1 className="text-3xl md:text-5xl font-light tracking-tight text-black mb-4 inline-block">
            New Jersey Real Estate Relationships
          </h1>
        </div>

        {/* Content */}
        <div className="space-y-8 text-gray-700 leading-relaxed font-light text-lg text-justify max-w-4xl mx-auto">
          <p>
            In New Jersey, real estate licensees are required to disclose how they intend to work with buyers and sellers in a real estate transaction.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-gray-50 p-6 border border-gray-100">
              <h3 className="text-black font-bold uppercase tracking-wide text-sm mb-2">Seller’s Agent</h3>
              <p className="text-sm">Represents the seller and must put the seller's interests first.</p>
            </div>
            <div className="bg-gray-50 p-6 border border-gray-100">
              <h3 className="text-black font-bold uppercase tracking-wide text-sm mb-2">Buyer’s Agent</h3>
              <p className="text-sm">Represents the buyer and must put the buyer's interests first.</p>
            </div>
            <div className="bg-gray-50 p-6 border border-gray-100">
              <h3 className="text-black font-bold uppercase tracking-wide text-sm mb-2">Disclosed Dual Agent</h3>
              <p className="text-sm">Represents both the buyer and the seller in the same transaction with the informed consent of both parties.</p>
            </div>
            <div className="bg-gray-50 p-6 border border-gray-100">
              <h3 className="text-black font-bold uppercase tracking-wide text-sm mb-2">Transaction Broker</h3>
              <p className="text-sm">Does not represent either the buyer or the seller but works to facilitate the transaction.</p>
            </div>
          </div>

          <p>
            As a real estate licensee, Eunice Hwang is required to comply with the New Jersey Real Estate Commission's rules and regulations. Unless a specific agency relationship is established, I am acting as a Transaction Broker.
          </p>

          <div className="pt-6">
            <a
              href="https://www.nj.gov/dobi//bulletins/blt24_11Info.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-black font-bold uppercase tracking-widest border-b-2 border-black hover:text-gray-600 hover:border-gray-600 transition-colors pb-1"
            >
              Link to Official NJ CIS Form (PDF)
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
          </div>
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
