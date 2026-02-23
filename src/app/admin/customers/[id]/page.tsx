import { getCurrentUser } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import EditCustomerForm from './EditCustomerForm';
import Footer from '@/components/Footer';

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser();
  const { id } = await params;

  if (!currentUser || !currentUser.isAdmin) {
    redirect('/');
  }

  return (
    <main className="min-h-screen font-sans bg-gray-50 flex flex-col text-black">
      <Navbar theme="light" user={currentUser} />
      <div className="pt-20 flex-grow">
        <EditCustomerForm id={id} />
      </div>
      <Footer />
    </main>
  );
}
