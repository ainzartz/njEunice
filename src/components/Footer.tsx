import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand & Address */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold tracking-widest uppercase">NJ Eunice's Real Estate</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted partner for premier real estate opportunities in New Jersey.
            </p>
            <div className="pt-6 relative h-16 w-48">
              <Image
                src="/images/remax_logo.png"
                alt="Re/Max Now"
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

          {/* Compliance Text */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6">Compliance</h4>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              The data relating to real estate for sale on this web site comes in part from the Internet Data Exchange (IDX) program of the NJMLS. Real estate listings held by brokerage firms other than NJ Eunice's Real Estate are marked with the NJMLS logo and information about them includes the name of the listing brokers.
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Information deemed reliable but not guaranteed. © {new Date().getFullYear()} NJMLS, Inc. All rights reserved.
            </p>
          </div>
        </div>

        {/* Bottom Bar - Legal Links */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} NJ Eunice's Real Estate. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-end">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/cis" className="hover:text-white transition-colors">Consumer Info Statement</Link>
            <Link href="/legal" className="hover:text-white transition-colors">Legal Disclaimer</Link>
            <Link href="/dmca" className="hover:text-white transition-colors">DMCA Notice</Link>
            <Link href="/accessibility" className="hover:text-white transition-colors">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
