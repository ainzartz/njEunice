import Image from 'next/image';

const Hero = () => {
  return (
    <div className="relative h-screen min-h-[600px] w-full flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.png"
          alt="Luxury Interior"
          fill
          className="object-cover brightness-75"
          priority
        />
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl w-full">
        <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-4">
          Discover Your <span className="font-bold">Dream Home</span>
        </h1>
        <p className="text-lg md:text-xl font-light tracking-wide mb-10 text-gray-200">
          Premier Real Estate in New Jersey
        </p>

        {/* Search Bar - Modern & Minimal */}
        <div className="bg-white p-2 rounded-lg shadow-2xl max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-2">
          <div className="flex-1 w-full relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Enter an address, neighborhood, city, or ZIP code"
              className="w-full pl-10 pr-4 py-3 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none"
            />
          </div>

          <button className="w-full md:w-auto bg-black text-white font-medium uppercase tracking-wider py-3 px-8 rounded-md hover:bg-gray-800 transition-colors">
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
