"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FaBell, FaEnvelope, FaSearch, FaUserCircle, FaGamepad, FaBox, FaTrophy, FaHistory, FaUsers, FaNewspaper, FaCog, FaSignOutAlt, FaDownload } from 'react-icons/fa';
import UniversalSearch from './UniversalSearch';

// --- Small System Menu Data ---
const SYSTEM_MENUS = {
    'Parşomen': [
        { label: 'Hesap Değiştir', href: '/login' },
        { label: 'Çevrimdışı Ol', href: '#' },
        { label: 'Güncellemeleri Denetle', href: '#' },
        { label: 'Destek Talebi', href: '/support' }, // Added
        { label: 'Ayarlar', href: '/settings' },
        { label: 'Çıkış Yap', action: 'logout' },
    ],
    'Görünüm': [
        { label: 'Kütüphane', href: '/library' },
        { label: 'Gizlenmiş Kitaplar', href: '#' },
        { label: 'Envanter', href: '/inventory' },
        { label: 'Haberler', href: '/news' },
    ],
    'Arkadaşlar': [
        { label: 'Arkadaş Listesi', href: '/friends' },
        { label: 'Arkadaş Ekle', href: '/friends/add' },
        { label: 'Çevrimiçi', href: '#' },
        { label: 'Uzakta', href: '#' },
    ],
    'Yardım': [
        { label: 'Destek', href: '/support' },
        { label: 'Gizlilik Politikası', href: '#' },
        { label: 'Hakkında', href: '#' },
    ]
};

// --- Big Navigation Data ---
const NAV_MENUS = (username) => {
    const menus = {
        'AKIŞ': {
            href: '/feed',
            items: []
        },
        'MAĞAZA': {
            href: '/store',
            items: ['Öne Çıkanlar', 'Editör Seçimi', 'Hediye Listesi', 'Puan Dükkanı', 'Haberler', 'İstatistikler']
        },
        'KÜTÜPHANE': {
            href: '/library',
            items: ['Anasayfa', 'Koleksiyonlar', 'İndirmeler']
        },
        'TOPLULUK': {
            href: '/community',
            items: ['Anasayfa', 'Tartışmalar', 'Sıralamalar']
        }
    };

    // Only allow User Menu if logged in
    if (username) {
        menus[username.toUpperCase()] = {
            href: `/profile/${username}`,
            items: ['Aktivite', 'Profil', 'Arkadaşlar', 'Gruplar', 'Rozetler', 'Envanter']
        };
    }

    return menus;
};

export default function SteamHeader() {
    const { user, logout, loading } = useAuth();
    const [activeSysMenu, setActiveSysMenu] = useState(null);
    const [activeNavMenu, setActiveNavMenu] = useState(null);
    const pathname = usePathname();

    // Close menus on click outside
    useEffect(() => {
        const handleClick = () => { setActiveSysMenu(null); setActiveNavMenu(null); };
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    const handleSysClick = (e, menu) => {
        e.stopPropagation();
        setActiveSysMenu(activeSysMenu === menu ? null : menu);
    };

    return (
        <div className="flex flex-col w-full text-gray-300 font-sans text-sm select-none z-50" suppressHydrationWarning>

            {/* 2. Main Navigation Bar (Big) - Simplified Header */}
            <div className="bg-black/80 backdrop-blur-md border-b border-gray-800 px-4 py-4 flex items-center justify-between sticky top-0 z-50" suppressHydrationWarning>
                <div className="flex items-center gap-8" suppressHydrationWarning>
                    {/* Logo */}
                    <Link href="/store" className="text-2xl font-bold tracking-widest uppercase hover:opacity-80 transition-opacity flex items-center gap-2" style={{ fontFamily: "'Motiva Sans', sans-serif" }}>
                        <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">PARSOMEN</span>
                    </Link>

                    {/* Big Menus - Including "Parsomen" etc implicitly or via specific menus */}
                    {/* Merged View: Store, Library, Community, User */}
                    <div className="flex items-center gap-2">
                        {Object.entries(NAV_MENUS(user?.username)).map(([label, data]) => (
                            <div
                                key={label}
                                className="relative group"
                                onMouseEnter={() => setActiveNavMenu(label)}
                                onMouseLeave={() => setActiveNavMenu(null)}
                            >
                                <Link
                                    href={data.href}
                                    className={`nav-big-item px-4 py-2 text-lg font-bold uppercase tracking-wide transition-all duration-200 block rounded-sm ${pathname.startsWith(data.href) ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    {label}
                                </Link>

                                {/* Quick Hover Dropdown - Only show if has items or is user menu */}
                                {(data.items.length > 0 || (label !== 'MAĞAZA' && label !== 'KÜTÜPHANE' && label !== 'TOPLULUK' && label !== 'AKIŞ')) && (
                                    <div className={`absolute top-full left-0 pt-4 min-w-[240px] transition-all duration-200 ease-out origin-top-left overflow-hidden z-50 ${activeNavMenu === label ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                                        <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border border-[#333] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 space-y-1">
                                            {data.items.map((item, idx) => {
                                                // Special links for certain menu items
                                                const getItemHref = () => {
                                                    // Map specific items to specific routes if needed
                                                    const userProfileLink = user ? `/profile/${user.username}` : '/login';
                                                    const map = {
                                                        'Sıralamalar': '/leaderboard',
                                                        'Aktivite': `${userProfileLink}/activity`,
                                                        'Profil': userProfileLink,
                                                        'Arkadaşlar': '/friends',
                                                        'Gruplar': `${userProfileLink}/groups`,
                                                        'İçerikler': `${userProfileLink}/content`,
                                                        'Rozetler': `${userProfileLink}/badges`,
                                                        'Envanter': `${userProfileLink}/inventory`,
                                                        'Öne Çıkanlar': '/store/featured',
                                                        'Editör Seçimi': '/store/editor-choice',
                                                        'Hediye Listesi': '/store/gift-list',
                                                        'Puan Dükkanı': '/store/points-shop',
                                                        'Haberler': '/store/news',
                                                        'İstatistikler': '/store/stats',
                                                        'Tartışmalar': '/community/discussions',
                                                        'Koleksiyonlar': '/library/collections',
                                                        'İndirmeler': '/downloads',
                                                        'Anasayfa': data.href // Redirects to main category page (e.g. /store, /library)
                                                    };

                                                    if (map[item]) return map[item];

                                                    // Fallback for generic filters or sub-pages
                                                    return `${data.href}/${item.toLowerCase().replace(/\s+/g, '-')}`;
                                                };
                                                return (
                                                    <Link key={idx} href={getItemHref()} className="block px-4 py-3 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white rounded-lg transition-colors flex items-center justify-between group/link">
                                                        {item}
                                                        <span className="opacity-0 group-hover/link:opacity-100 transition-opacity text-xs text-gray-600">➜</span>
                                                    </Link>
                                                );
                                            })}
                                            {/* Special menu items for User dropdown */}
                                            {label !== 'MAĞAZA' && label !== 'KÜTÜPHANE' && label !== 'TOPLULUK' && (
                                                <div className="pt-2 mt-2 border-t border-[#222]">
                                                    {/* Admin Panel - only for admins */}
                                                    {user?.role === 'ADMIN' && (
                                                        <Link href="/admin" className="block px-4 py-3 text-sm font-medium text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 rounded-lg transition-colors">
                                                            <FaCog className="inline mr-3 opacity-70" /> Admin Panel
                                                        </Link>
                                                    )}
                                                    <Link href="/settings" className="block px-4 py-3 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                                                        <FaCog className="inline mr-3 opacity-70" /> Ayarlar
                                                    </Link>
                                                    <button onClick={logout} className="w-full text-left px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors">
                                                        <FaSignOutAlt className="inline mr-3 opacity-70" /> Çıkış Yap
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right User Area - Simplified (No Balance) */}
                <div className="flex items-center gap-6">
                    {/* Notifications */}
                    {/* Notifications */}
                    <div className="flex items-center gap-4 text-gray-500">
                        <Link href="/messages" className="hover:text-white relative transition-colors">
                            <FaEnvelope />
                        </Link>
                        <button className="hover:text-white relative transition-colors">
                            <FaBell />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full"></span>
                        </button>
                    </div>

                    {/* Points Display */}
                    {user && (
                        <Link href="/store/points-shop" className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-colors">
                            <span className="text-amber-400 text-sm">⭐</span>
                            <span className="text-amber-300 font-bold text-sm">{user.points || 0}</span>
                        </Link>
                    )}

                    {/* Search */}
                    {/* Universal Search */}
                    <UniversalSearch />

                    {/* Avatar Area */}
                    <Link href={user ? `/profile/${user.username}` : '/login'} className="flex items-center gap-3 group cursor-pointer pl-4 border-l border-gray-800">
                        {loading ? (
                            // Loading Skeleton
                            <>
                                <div className="text-right hidden md:block">
                                    <div className="w-20 h-4 bg-gray-800 rounded animate-pulse mb-1"></div>
                                    <div className="w-12 h-3 bg-gray-800 rounded animate-pulse ml-auto"></div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gray-800 animate-pulse border-2 border-gray-700"></div>
                            </>
                        ) : (
                            // Loaded State
                            <>
                                <div className="text-right hidden md:block">
                                    <div className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{user?.username || 'Giriş Yap'}</div>
                                    <div className="text-xs text-green-500">{user ? 'Çevrimiçi' : ''}</div>
                                </div>
                                <div className="w-10 h-10 rounded-full border-2 border-gray-700 relative overflow-hidden group-hover:border-white transition-colors">
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-900 flex items-center justify-center text-lg font-bold text-white">
                                            {user?.username?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </Link>
                </div>
            </div>

            {/* Remove Blue Line, replaced by simpler border-b in main div */}
        </div>
    );
}
