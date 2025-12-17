"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    FaHome,
    FaSearch,
    FaBookOpen,
    FaEnvelope,
    FaUser,
    FaTimes,
    FaShoppingBag,
    FaGift,
    FaNewspaper,
    FaChartLine,
    FaLayerGroup,
    FaStar
} from 'react-icons/fa';
import { FaBagShopping } from 'react-icons/fa6';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';

export default function MobileNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const [isLibraryMenuOpen, setIsLibraryMenuOpen] = useState(false);

    // Close menu when route changes
    useEffect(() => {
        setIsLibraryMenuOpen(false);
    }, [pathname]);

    const navItems = [
        { label: 'Akış', href: '/feed', icon: FaHome },
        { label: 'Keşfet', href: '/search', icon: FaSearch },
        { label: 'Kitaplık', action: 'menu', icon: FaBookOpen }, // Opens Menu
        { label: 'Mesajlar', href: '/messages', icon: FaEnvelope },
        { label: 'Profil', href: user ? `/profile/${user.username}` : '/login', icon: FaUser }
    ];

    const libraryMenuItems = [
        { label: 'Mağaza', href: '/store', icon: FaShoppingBag, color: 'text-blue-400' },
        { label: 'Kategoriler', href: '/store?section=categories', icon: FaLayerGroup, color: 'text-purple-400' },
        { label: 'Öne Çıkanlar', href: '/store/featured', icon: FaStar, color: 'text-yellow-400' },
        { label: 'Puan Dükkanı', href: '/store/points-shop', icon: FaBagShopping, color: 'text-green-400' },
        { label: 'Hediye Listesi', href: '/store/gift-list', icon: FaGift, color: 'text-pink-400' },
        { label: 'Haberler', href: '/store/news', icon: FaNewspaper, color: 'text-orange-400' },
        { label: 'İstatistikler', href: '/store/stats', icon: FaChartLine, color: 'text-cyan-400' },
        { label: 'Kütüphanem', href: '/library', icon: FaBookOpen, color: 'text-white' },
    ];

    const handleNavClick = (e, item) => {
        if (item.action === 'menu') {
            e.preventDefault();
            setIsLibraryMenuOpen(!isLibraryMenuOpen);
        }
    };

    if (pathname === '/login' || pathname === '/register' || pathname === '/') return null;

    return (
        <>
            {/* Library Menu Overlay */}
            {isLibraryMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-[60] flex flex-col justify-end">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in"
                        onClick={() => setIsLibraryMenuOpen(false)}
                    />

                    {/* Drawer Content */}
                    <div className="relative bg-[#121212] border-t border-white/10 rounded-t-3xl p-6 pb-24 animate-in slide-in-from-bottom-5">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <FaBookOpen className="text-purple-500" /> Kitaplık Menüsü
                            </h2>
                            <button
                                onClick={() => setIsLibraryMenuOpen(false)}
                                className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            {libraryMenuItems.map((item, idx) => (
                                <Link
                                    key={idx}
                                    href={item.href}
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-xl shadow-lg group-hover:bg-white/10 group-hover:border-purple-500/30 transition-all">
                                        <item.icon className={item.color} />
                                    </div>
                                    <span className="text-[10px] text-center font-medium text-gray-400 group-hover:text-white leading-tight">
                                        {item.label}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Nav Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10 z-[70] pb-safe safe-area-bottom">
                <div className="flex justify-around items-center h-16 px-2">
                    {navItems.map((item) => {
                        const isActive = item.href ? pathname === item.href : isLibraryMenuOpen && item.action === 'menu';

                        return (
                            <Link
                                key={item.label}
                                href={item.href || '#'}
                                onClick={(e) => handleNavClick(e, item)}
                                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all active:scale-90 ${isActive ? 'text-purple-400' : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                <div className={`relative p-1.5 rounded-xl transition-all ${isActive && item.action !== 'menu' ? 'bg-purple-500/10' : ''
                                    }`}>
                                    <item.icon size={20} className={isActive ? 'drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : ''} />
                                    {item.label === 'Mesajlar' && user?.unreadCount > 0 && (
                                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-black"></span>
                                    )}
                                </div>
                                <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
