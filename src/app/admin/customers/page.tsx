import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import { decrypt } from '@/lib/encryption';
import CustomerList from './CustomerList';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default async function CustomerManagementPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || !currentUser.isAdmin) {
    redirect('/');
  }

  // Fetch all users including deleted ones
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const decryptedUsers = users.map((user) => ({
    ...user,
    firstName: user.firstNameEncrypted ? decrypt(user.firstNameEncrypted) : '',
    lastName: user.lastNameEncrypted ? decrypt(user.lastNameEncrypted) : '',
    name: user.nameEncrypted ? decrypt(user.nameEncrypted) : '',
    phone: user.phoneEncrypted ? decrypt(user.phoneEncrypted) : '',
    address: user.addressEncrypted ? decrypt(user.addressEncrypted) : '',
    dob: user.dobEncrypted ? decrypt(user.dobEncrypted) : '',
    createdAt: user.createdAt.toISOString(), // Ensure string for client serialization
  }));

  return (
    <main className="min-h-screen font-sans bg-gray-50 flex flex-col text-black">
      <Navbar theme="light" user={currentUser} />
      <div className="flex-grow">
        <CustomerList users={decryptedUsers} />
      </div>
      <Footer />
    </main>
  );
}
