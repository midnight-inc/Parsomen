"use client";
import SteamHeader from './SteamHeader';
import RefreshButton from '../ui/RefreshButton';
import BackButton from '../ui/BackButton';
import ScrollToTop from '../ui/ScrollToTop';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function MainLayout({ children }) {
  const { loading } = useAuth();
  const pathname = usePathname();

  // Pages that don't need the header (Login/Register/Maintenance)
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname?.startsWith('/maintenance');

  if (isAuthPage) return <main className="min-h-screen bg-black">{children}</main>;

  // Show loading state while checking auth
  // Non-blocking loading: We render the app immediately.
  // The Header and specific components can handle 'loading' state individually (e.g. showing skeletons).
  // This allows the UI to paint instantly.

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-black text-[#e0e0e0]" suppressHydrationWarning>
      {/* Steam Header replaces both Sidebar and Navbar */}
      <SteamHeader />

      {/* Main Content Area */}
      <main className="flex-1 relative w-full overflow-y-auto custom-scrollbar">
        <div className="container mx-auto px-4 py-8 relative z-10" suppressHydrationWarning>
          {children}
        </div>
      </main>

      <RefreshButton />
      <BackButton />
      <ScrollToTop />
    </div>
  );
}
