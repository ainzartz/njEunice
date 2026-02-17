import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyDetailContent from '@/components/PropertyDetailContent';
import { getCurrentUser } from '@/lib/auth-server';

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const id = Number(params.id);

  return (
    <main className="min-h-screen font-sans bg-white flex flex-col">
      <Navbar user={user} />
      <PropertyDetailContent id={id} />
      <Footer />
    </main>
  );
}
