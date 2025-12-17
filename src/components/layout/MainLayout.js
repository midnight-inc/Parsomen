"use client";
import { FaFire, FaTrophy } from 'react-icons/fa';
import SteamHeader from './SteamHeader';
import MobileNav from './MobileNav';
import RefreshButton from '../ui/RefreshButton';
import BackButton from '../ui/BackButton';
import ScrollToTop from '../ui/ScrollToTop';
import ToastProvider from '../ui/ToastProvider';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import LiveStatsTicker from '../ui/LiveStatsTicker';

export default function MainLayout({ children }) {
  const { loading, user } = useAuth();
  const pathname = usePathname();

  // Daily Check Logic
  useEffect(() => {
    if (!user) return;
    const checkDaily = async () => {
      try {
        const res = await fetch('/api/gamification/daily-check', { method: 'POST' });
        const data = await res.json();

        if (data.success && data.firstTimeToday) {
          toast.success(
            <div className="flex flex-col">
              <span className="font-bold text-lg flex items-center gap-2"><FaFire className="text-orange-500" /> Seri: {data.streak} Gün!</span>
              <span className="text-sm">+{data.pointsEarned} Puan Kazandın</span>
            </div>,
            {
              duration: 5000,
              icon: <FaTrophy className="text-yellow-500" />,
              style: {
                borderRadius: '12px',
                background: '#1a1a2e',
                color: '#fff',
                border: '1px solid #7c3aed',
              },
            }
          );
        }
      } catch (e) { }
    };
    checkDaily();
  }, [user]);

  // Pages that don't need the header
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname?.startsWith('/maintenance');
  const isAdminPage = pathname?.startsWith('/admin');

  if (isAuthPage) return <main className="min-h-screen bg-black">{children}</main>;

  if (isAdminPage) {
    return (
      <div className="min-h-screen bg-black text-[#e0e0e0]" suppressHydrationWarning>
        {children}
        <ToastProvider />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-black text-[#e0e0e0]" suppressHydrationWarning>

      {/* Steam Header replaces both Sidebar and Navbar */}
      <SteamHeader />

      {/* Live Activity Ticker - Sticky below header */}
      <div className="sticky top-0 z-40 hidden lg:block">
        <LiveStatsTicker />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 relative w-full overflow-y-auto custom-scrollbar pb-20 lg:pb-0">
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 relative z-10" suppressHydrationWarning>
          {children}
        </div>
      </main>

      <MobileNav />

      <div className="hidden lg:block">
        <RefreshButton />
        <BackButton />
        <ScrollToTop />
      </div>
    </div>
  );
}
