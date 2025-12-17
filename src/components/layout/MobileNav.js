"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FaHome, FaShoppingBag, FaBook, FaEnvelope, FaUser } from 'react-icons/fa';

export default function MobileNav() {
    const pathname = usePathname();
    const { user } = useAuth();

    const isActive = (path) => pathname === path || pathname.startsWith(path + '/');

    const navItems = [
        {
            label: 'Akış',
            href: '/feed',
            icon: FaHome
        },
        {
            label: 'Mağaza',
            href: '/store',
            icon: FaShoppingBag
        },
        {
            label: 'Kitaplık',
            href: '/library',
            icon: FaBook
        },
        {
            label: 'Mesajlar',
            href: '/messages',
            icon: FaEnvelope
        },
        {
            label: 'Profil',
            href: user ? `/profile/${user.username}` : '/login',
            icon: FaUser
        }
    ];

    // Don't show on auth pages or intro
    if (pathname === '/login' || pathname === '/register' || pathname === '/') return null;

    return (
        <div className="lg:hidden fixed bottom-0 left-0 w-full bg-black/95 backdrop-blur-xl border-t border-gray-800 z-50 pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${active ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <Icon size={20} className={active ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''} />
                            <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
