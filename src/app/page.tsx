import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';

export default function Home() {
  return (
    <main className="min-h-screen font-sans">
      <Navbar />
      <Hero />

      {/* Placeholder for Featured Listings */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 uppercase tracking-widest">Featured Listings</h2>
          <div className="h-1 w-20 bg-black mx-auto"></div>
          <p className="mt-4 text-gray-500">Curated properties for the discerning buyer.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-gray-400">
          <div className="h-96 bg-gray-100 flex items-center justify-center border border-gray-200">
            <span>Listing Component Placeholder 1</span>
          </div>
          <div className="h-96 bg-gray-100 flex items-center justify-center border border-gray-200">
            <span>Listing Component Placeholder 2</span>
          </div>
          <div className="h-96 bg-gray-100 flex items-center justify-center border border-gray-200">
            <span>Listing Component Placeholder 3</span>
          </div>
        </div>
      </section>
    </main>
  );
}
