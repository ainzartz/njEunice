import { getCurrentUser } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import NewCustomerForm from './page';

export const dynamic = 'force-dynamic';

export default async function NewCustomerLayout() {
  const currentUser = await getCurrentUser();

  if (!currentUser || !currentUser.isAdmin) {
    redirect('/');
  }

  return (
    <main className="min-h-screen font-sans bg-gray-50 flex flex-col text-black">
      <Navbar theme="light" user={currentUser} />
      <div className="pt-24 flex-1">
        <NewCustomerForm />
      </div>
    </main>
  );
}
