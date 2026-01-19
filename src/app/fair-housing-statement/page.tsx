import Link from 'next/link';

export default function FairHousingStatement() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-3xl space-y-8">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-black border-b border-black pb-8 inline-block">
          Fair Housing Statement
        </h1>

        <p className="text-gray-600 leading-loose text-lg font-light text-justify">
          RE/MAX Now and its technology provider, Inside Real Estate, fully support the principles of the Fair Housing Act (Title VIII of the Civil Rights Act of 1968), as amended, which generally prohibits discrimination in the sale, rental, and financing of dwellings, and in other housing-related transactions, based on race, color, national origin, religion, sex, familial status (including children under the age of 18 living with parents of legal custodians, pregnant women, and people securing custody of children under the age of 18), and handicap (disability). As an adjunct to the foregoing commitment, both RE/MAX Now and Inside Real Estate actively promote, and are committed to, creating and fostering an environment of diversity throughout their respective organizations and franchise systems, and each views such a concept as a critical component to the on-going success of their business operations.
        </p>

        <div className="pt-12">
          <Link href="/" className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-500 transition-colors">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
