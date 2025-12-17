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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    // Close menus on click outside
    useEffect(() => {
        const handleClick = () => { setActiveSysMenu(null); setActiveNavMenu(null); };
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    const handleSysClick = (e, menu) => {
        e.stopPropagation();
        setActiveSysMenu(activeSysMenu === menu ? null : menu);
    };

    const navMenus = NAV_MENUS(user?.username);

    return (
        <div className="flex flex-col w-full text-gray-300 font-sans text-sm select-none z-50 transition-all" suppressHydrationWarning>

            {/* 2. Main Navigation Bar (Big) - Simplified Header */}
            <div className="bg-black/90 backdrop-blur-md border-b border-gray-800 px-4 py-4 sticky top-0 z-50" suppressHydrationWarning>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 lg:gap-8" suppressHydrationWarning>
                        {/* Mobile Menu Toggle */}
                        <button
                            className="lg:hidden text-2xl text-gray-300 hover:text-white p-2"
                            onClick={(e) => {
                                e.stopPropagation();
                                setMobileMenuOpen(!mobileMenuOpen);
                            }}
                        >
                            {mobileMenuOpen ? <div className='text-3xl'>&times;</div> : <div>&#9776;</div>}
                        </button>

                        {/* Logo */}
                        <Link href="/store" className="text-xl md:text-2xl font-bold tracking-widest uppercase hover:opacity-80 transition-opacity flex items-center gap-2" style={{ fontFamily: "'Motiva Sans', sans-serif" }}>
                            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">PARSOMEN</span>
                        </Link>

                        {/* Desktop Menus */}
                        <div className="hidden lg:flex items-center gap-2">
                            {Object.entries(navMenus).map(([label, data]) => (
                                <div
                                    key={label}
                                    className="relative group"
                                    onMouseEnter={() => setActiveNavMenu(label)}
                                    onMouseLeave={() => setActiveNavMenu(null)}
                                >
                                    <Link
                                        href={data.href}
                                        className={`nav-big-item px-3 py-2 text-base xl:text-lg font-bold uppercase tracking-wide transition-all duration-200 block rounded-sm ${pathname.startsWith(data.href) ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        {label}
                                    </Link>

                                    {/* Quick Hover Dropdown - Desktop */}
                                    {(data.items.length > 0 || (label !== 'MAĞAZA' && label !== 'KÜTÜPHANE' && label !== 'TOPLULUK' && label !== 'AKIŞ')) && (
                                        <div className={`absolute top-full left-0 pt-4 min-w-[240px] transition-all duration-200 ease-out origin-top-left overflow-hidden z-50 ${activeNavMenu === label ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                                            <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border border-[#333] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 space-y-1">
                                                {data.items.map((item, idx) => {
                                                    // Link generation logic (same as original)
                                                    const getItemHref = () => {
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
                                                            'Anasayfa': data.href
                                                        };
                                                        if (map[item]) return map[item];
                                                        return `${data.href}/${item.toLowerCase().replace(/\s+/g, '-')}`;
                                                    };
                                                    return (
                                                        <Link key={idx} href={getItemHref()} className="block px-4 py-3 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white rounded-lg transition-colors flex items-center justify-between group/link">
                                                            {item}
                                                            <span className="opacity-0 group-hover/link:opacity-100 transition-opacity text-xs text-gray-600">➜</span>
                                                        </Link>
                                                    );
                                                })}
                                                {/* User Dropdown Links */}
                                                {label !== 'MAĞAZA' && label !== 'KÜTÜPHANE' && label !== 'TOPLULUK' && (
                                                    <div className="pt-2 mt-2 border-t border-[#222]">
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

                    {/* Right User Area */}
                    <div className="flex items-center gap-3 md:gap-6">
                        {/* Mobile Search Icon Only */}
                        <div className='md:hidden'>
                            <FaSearch className="text-gray-400 text-lg" />
                        </div>
                        {/* Desktop Search */}
                        <div className='hidden md:block'>
                            <UniversalSearch />
                        </div>

                        {/* Notifications */}
                        <div className="flex items-center gap-4 text-gray-500">
                            <Link href="/messages" className="hover:text-white relative transition-colors hidden sm:block">
                                <FaEnvelope />
                            </Link>
                            <button className="hover:text-white relative transition-colors">
                                <FaBell />
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full"></span>
                            </button>
                        </div>

                        {/* Avatar */}
                        <Link href={user ? `/profile/${user.username}` : '/login'} className="flex items-center gap-3 group cursor-pointer pl-2 md:pl-4 md:border-l border-gray-800">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.username} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-gray-700" />
                            ) : (
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-900 flex items-center justify-center text-sm md:text-lg font-bold text-white border-2 border-gray-700">
                                    {user?.username?.charAt(0).toUpperCase() || '?'}
                                </div>
                            )}
                        </Link>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div className="lg:hidden absolute top-full left-0 w-full bg-gray-950 border-b border-gray-800 shadow-2xl overflow-y-auto max-h-[80vh] flex flex-col p-4 animate-in slide-in-from-top-2">
                        {/* Mobile Search */}
                        <div className="mb-4">
                            <input type="text" placeholder="Ara..." className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
                        </div>

                        {Object.entries(navMenus).map(([label, data]) => (
                            <div key={label} className="mb-4">
                                <Link
                                    href={data.href}
                                    className="block text-white font-bold text-lg mb-2 border-b border-gray-800 pb-1"
                                >
                                    {label}
                                </Link>
                                <div className="pl-4 space-y-2 border-l-2 border-gray-800 ml-1">
                                    {data.items.map((item, idx) => {
                                        // Same link logic...
                                        const getItemHref = () => {
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
                                                'Anasayfa': data.href
                                            };
                                            if (map[item]) return map[item];
                                            return `${data.href}/${item.toLowerCase().replace(/\s+/g, '-')}`;
                                        };
                                        return (
                                            <Link key={idx} href={getItemHref()} className="block text-gray-400 hover:text-white text-sm">
                                                {item}
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                        {user && (
                            <button onClick={logout} className="w-full text-left mt-4 px-4 py-3 bg-red-900/20 text-red-400 rounded-lg">
                                Çıkış Yap
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
