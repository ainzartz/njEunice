import Link from 'next/link';

export default function DMCAPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-4xl space-y-10">

        {/* Header */}
        <div className="border-b border-black pb-8 text-center pt-12">
          <h1 className="text-3xl md:text-5xl font-light tracking-tight text-black mb-4 inline-block">
            DMCA Notice <br className="hidden md:block" /> (Digital Millennium Copyright Act)
          </h1>
        </div>

        {/* Content */}
        <div className="space-y-8 text-gray-700 leading-relaxed font-light text-lg text-justify max-w-4xl mx-auto">
          <p>
            Eunice Hwang and RE/MAX Now respect the intellectual property rights of others and expect you to do the same. Per the DMCA, we will respond expeditiously to claims of copyright infringement on the Site if submitted to our Copyright Agent as described below.
          </p>

          <div>
            <h2 className="text-black font-bold uppercase tracking-wide text-sm mb-4">Reporting Claims of Copyright Infringement</h2>
            <p className="mb-4">
              If you believe that your intellectual property rights have been violated by content on our website, please provide the following information to our Designated Agent:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-base">
              <li>A physical or electronic signature of the person authorized to act on behalf of the owner of the copyright interest.</li>
              <li>A description of the copyrighted work that you claim has been infringed.</li>
              <li>A description of where the material that you claim is infringing is located on the site.</li>
              <li>Your address, telephone number, and email address.</li>
              <li>A statement by you that you have a good faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law.</li>
              <li>A statement by you, made under penalty of perjury, that the above information in your notice is accurate and that you are the copyright owner or authorized to act on the copyright owner's behalf.</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-8 border border-gray-100 text-center">
            <h3 className="text-black font-bold uppercase tracking-wide text-sm mb-4">Designated Agent for DMCA Notices</h3>
            <div className="space-y-1 text-base">
              <p className="font-bold text-black">Eunice Hwang</p>
              <p className="text-gray-600">RE/MAX Now</p>
              <p>
                <span className="font-bold text-black text-xs uppercase tracking-wide mr-2">Email:</span>
                <a href="mailto:realtoreunicehwang@gmail.com" className="hover:text-black transition-colors underline">realtoreunicehwang@gmail.com</a>
              </p>
              <p>
                <span className="font-bold text-black text-xs uppercase tracking-wide mr-2">Phone:</span>
                201-290-5256
              </p>
            </div>
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
