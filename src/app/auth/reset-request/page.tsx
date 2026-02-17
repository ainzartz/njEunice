import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ResetRequestForm from '@/components/ResetRequestForm';
import { getCurrentUser } from '@/lib/auth-server';

export default async function ResetRequestPage() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar theme="light" user={user} />
      <div className="flex-grow flex items-center justify-center px-6 pt-24 pb-12">
        <Suspense fallback={<div>Loading...</div>}>
          <ResetRequestForm />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
