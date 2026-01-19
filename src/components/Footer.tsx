import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand & Address */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold tracking-widest uppercase">NJ Eunice's Real Estate</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted partner for premier real estate opportunities in New Jersey.
            </p>
            <div className="pt-6 relative h-24 w-72">
              <Image
                src="/images/footer_banner.png"
                alt="Eunice Hwang - Re/Max Now"
                fill
                className="object-contain object-left opacity-90 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6">Explore</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/buy" className="hover:text-white transition-colors">Buy</Link></li>
              <li><Link href="/sell" className="hover:text-white transition-colors">Sell</Link></li>
              <li><Link href="/lease" className="hover:text-white transition-colors">Lease</Link></li>
              <li><Link href="/commercial" className="hover:text-white transition-colors">Commercial</Link></li>
            </ul>
          </div>

          {/* Contact Info (Formerly Company) */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6">Contact Info</h4>
            <div className="space-y-4 text-sm text-gray-400">
              <p className="leading-relaxed">
                460 Bergen Blvd. Suite 120 <br />
                Palisades Park, NJ 07650
              </p>
              <p className="leading-relaxed">
                C: 201.290.5256 | O: 201.891.8000
              </p>
              <p>
                <a href="mailto:realtoreunicehwang@gmail.com" className="hover:text-white transition-colors">
                  realtoreunicehwang@gmail.com
                </a>
              </p>
            </div>
          </div>

          {/* MLS Disclaimer */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6">MLS® Disclaimer</h4>
            <div className="flex flex-col gap-4">
              {/* Logo and Text Container */}
              <div className="float-left mr-4 mb-2 w-24 h-8 relative">
                <Image
                  src="/images/njmls_logo.png"
                  alt="NJMLS Logo"
                  fill
                  className="object-contain object-left"
                />
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed text-justify">
                The data relating to the real estate for sale on this web site comes in part from the Internet Data Exchange Program of the NJMLS. Real estate listings held by brokerage firms other than RE/MAX Now are marked with the Internet Data Exchange logo and information about them includes the name of the listing brokers. Some properties listed with the participating brokers do not appear on this website at the request of the seller. Listings of brokers that do not participate in Internet Data Exchange do not appear on this website. All information deemed reliable but not guaranteed. Last date updated: January 19, 2026 2:47 PM UTC Source: New Jersey Multiple Listing Service, Inc.
              </p>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                © 2026 New Jersey Multiple Listing Service, Inc. All rights reserved.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Legal Links */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} NJ Eunice's Real Estate. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-end">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gray-500"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-label="Equal Housing Opportunity"
              >
                <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2zm1 14h-2v-2h2v2zm0-4h-2V9h2v3z" />
                {/* Note: This is a simplified House icon. For strict compliance, the official 'Equal Housing Opportunity' logo (House with Equal sign) is preferred if available as asset. 
                    Adding the specific 'Equal' sign path below to approximate the official logo. */}
                <path d="M7 14h10v2H7zM7 11h10v2H7z" fill="white" stroke="currentColor" strokeWidth="0.5" />
              </svg>
              <Link href="/fair-housing-statement" className="hover:text-white transition-colors">Fair Housing Statement</Link>
            </div>
            <Link href="/terms-of-use" className="hover:text-white transition-colors">Terms of Use</Link>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/cis" className="hover:text-white transition-colors">NJ CIS (Agency Disclosure)</Link>

            <Link href="/dmca" className="hover:text-white transition-colors">DMCA Notice</Link>
            <Link href="/accessibility" className="hover:text-white transition-colors">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
