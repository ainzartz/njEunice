import { getCurrentUser } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MessageLog from './MessageLog';

export const dynamic = 'force-dynamic';

export default async function MessageLogPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || !currentUser.isAdmin) {
    redirect('/');
  }

  return (
    <main className="min-h-screen font-sans bg-gray-50 flex flex-col text-black">
      <Navbar theme="light" user={currentUser} />
      <div className="flex-grow pt-24 pb-12 px-6 sm:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-6">
            <div>
              <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">Message Log</h1>
              <p className="text-gray-500 uppercase tracking-widest text-sm font-semibold">
                Review inbound and outbound communications
              </p>
            </div>
            <a
              href="/admin"
              className="text-sm font-bold uppercase tracking-wider border border-gray-300 px-4 py-2 hover:bg-gray-100 transition-colors"
            >
              Back to Dashboard
            </a>
          </div>

          <MessageLog />
        </div>
      </div>
      <Footer />
    </main>
  );
}
