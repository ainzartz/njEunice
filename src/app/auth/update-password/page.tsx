import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import UpdatePasswordForm from '@/components/UpdatePasswordForm';
import { getCurrentUser } from '@/lib/auth-server';

export default async function UpdatePasswordPage() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar theme="light" user={user} />
      <div className="flex-grow flex items-center justify-center px-6 pt-24 pb-12">
        <UpdatePasswordForm />
      </div>
      <Footer />
    </main>
  );
}
