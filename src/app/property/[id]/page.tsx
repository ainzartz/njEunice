import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyDetailContent from '@/components/PropertyDetailContent';
import { getCurrentUser } from '@/lib/auth-server';

export default async function PropertyDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>,
  searchParams: Promise<{ class?: string }>
}) {
  const user = await getCurrentUser();
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const id = resolvedParams.id; // Keep as string or handle conversion later
  const mlsClass = resolvedSearchParams.class;

  return (
    <main className="min-h-screen font-sans bg-white flex flex-col">
      <Navbar user={user} />
      <PropertyDetailContent id={id} mlsClass={mlsClass} />
      <Footer />
    </main>
  );
}
