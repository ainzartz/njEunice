import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SearchContent from '@/components/SearchContent';
import { getCurrentUser } from '@/lib/auth-server';

export default async function SearchPage() {
  const user = await getCurrentUser();

  return (
    <main className="h-screen bg-white font-sans flex flex-col overflow-hidden">
      <Navbar theme="light" user={user} />

      <div className="flex-grow pt-20 flex flex-col min-h-0"> {/* PT-20 for fixed navbar, flex-col and min-h-0 for proper flex sizing */}
        <Suspense fallback={<div className="p-12 text-center">Loading search...</div>}>
          <SearchContent />
        </Suspense>
      </div>
    </main>
  );
}
