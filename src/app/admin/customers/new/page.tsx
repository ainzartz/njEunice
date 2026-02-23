import { getCurrentUser } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import NewCustomerForm from './NewCustomerForm';
import Footer from '@/components/Footer';

export default async function NewCustomerPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || !currentUser.isAdmin) {
    redirect('/');
  }

  return (
    <main className="min-h-screen font-sans bg-gray-50 flex flex-col text-black">
      <Navbar theme="light" user={currentUser} />
      <div className="pt-20 flex-grow">
        <NewCustomerForm />
      </div>
      <Footer />
    </main>
  );
}
