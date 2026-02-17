import { getCurrentUser } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar'; // Assuming Navbar is compatible
import UserProfileForm from '@/components/UserProfileForm';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar theme="light" user={user} />
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <UserProfileForm user={user} />
        </div>
      </div>
    </div>
  );
}
