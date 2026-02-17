import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MarketInsightsContent from '@/components/MarketInsightsContent';
import { getCurrentUser } from '@/lib/auth-server';

export default async function MarketInsightsPage() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-white font-sans selection:bg-black selection:text-white">
      <Navbar theme="light" user={user} />
      <MarketInsightsContent />
      <Footer />
    </main>
  );
}
