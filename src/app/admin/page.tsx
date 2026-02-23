import { getCurrentUser } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || !currentUser.isAdmin) {
    redirect('/');
  }

  const managementAreas = [
    {
      title: 'Customer Management',
      description: 'View, search, edit, and manage all users and subscribers.',
      href: '/admin/customers',
      icon: (
        <svg className="w-8 h-8 text-black mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
      )
    },
    {
      title: 'Major County Management',
      description: 'Manage and toggle target status for operational counties.',
      href: '/admin/counties',
      icon: (
        <svg className="w-8 h-8 text-black mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
      )
    },
    {
      title: 'Message Log',
      description: 'Review inbound messages and outbound communications.',
      href: '/admin/messages',
      icon: (
        <svg className="w-8 h-8 text-black mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
      )
    }
  ];

  return (
    <main className="min-h-screen font-sans bg-gray-50 flex flex-col text-black">
      <Navbar theme="light" user={currentUser} />

      <div className="pt-32 pb-20 px-8 flex-grow">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 border-b border-gray-200 pb-6">
            <h1 className="text-4xl font-bold uppercase tracking-wider mb-2">Administrator Dashboard</h1>
            <p className="text-gray-500 text-lg">Select a section to manage the application&apos;s data and settings.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {managementAreas.map((area) => (
              <Link
                key={area.href}
                href={area.href}
                className="group bg-white p-8 border border-gray-200 shadow-sm hover:shadow-md hover:border-black transition-all duration-300 flex flex-col h-full"
              >
                {area.icon}
                <h2 className="text-xl font-bold uppercase tracking-widest mb-3 group-hover:text-black transition-colors">{area.title}</h2>
                <p className="text-gray-600 flex-grow leading-relaxed">{area.description}</p>

                <div className="mt-6 flex items-center text-sm font-bold tracking-widest uppercase">
                  <span className="group-hover:mr-2 transition-all">Enter</span>
                  <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
