"use client";
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FaChartBar, FaUsers, FaTags, FaMedal, FaCog, FaHome, FaCheckCircle, FaBook, FaGem, FaImages, FaStar, FaPalette, FaSearch, FaBell, FaSignOutAlt, FaLifeRing, FaFileAlt, FaBars, FaShoppingCart, FaCloudDownloadAlt } from 'react-icons/fa';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

export default function AdminClientLayout({ children }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // useEffect(() => {
    //     if (!loading && (!user || user.role !== 'ADMIN')) {
    //         router.push('/');
    //     }
    // }, [user, loading, router]);

    // if (loading || !user || user.role !== 'ADMIN') {
    //     return (
    //         <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
    //             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
    //         </div>
    //     );
    // }
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);

    const menuItems = [
        { name: 'Dashboard', icon: <FaHome />, path: '/admin' },
        { name: 'Kitaplar', icon: <FaBook />, path: '/admin/books' },
        { name: 'İçe Aktar', icon: <FaCloudDownloadAlt />, path: '/admin/books/import' },
        { name: 'Kategoriler', icon: <FaTags />, path: '/admin/categories' },
        { name: 'Kullanıcılar', icon: <FaUsers />, path: '/admin/users' },
        { name: 'Puan Dükkanı', icon: <FaShoppingCart />, path: '/admin/shop' },
        { name: 'Vitrin', icon: <FaGem />, path: '/admin/showcase' },
        { name: 'Destek', icon: <FaLifeRing />, path: '/admin/support' },
        { name: 'Temalar', icon: <FaPalette />, path: '/admin/themes' },
        { name: 'İçerik Editörü', icon: <FaFileAlt />, path: '/admin/cms' },
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setIsSearching(true);
                try {
                    const res = await fetch(`/api/admin/search?q=${searchQuery}`);
                    const data = await res.json();
                    if (data.success) {
                        setSearchResults(data.results);
                        setShowResults(true);
                    }
                } catch (e) { console.error(e); }
                finally { setIsSearching(false); }
            } else {
                setSearchResults(null);
                setShowResults(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleResultClick = (path) => {
        router.push(path);
        setShowResults(false);
        setSearchQuery('');
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-pink-500/30 overflow-hidden relative">

            {/* Background Blobs */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-blob"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
            </div>

            <div className="relative z-10 flex h-screen">
                {/* Sidebar */}
                <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-black/40 backdrop-blur-xl border-r border-white/5 transition-all duration-300 flex flex-col`}>
                    <div className="h-20 flex items-center justify-center border-b border-white/5 relative">
                        {isSidebarOpen ? (
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">PARŞÖMEN</h1>
                        ) : <span className="text-2xl font-bold text-pink-500">P</span>}
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="absolute right-[-12px] top-1/2 -translate-y-1/2 bg-gray-800 text-white p-1 rounded-full border border-gray-600 text-xs hover:bg-pink-600 transition-colors">
                            {isSidebarOpen ? <FaBars /> : <FaBars />}
                        </button>
                    </div>

                    <div className="p-4">
                        <div className={`flex items-center gap-3 p-3 bg-white/5 rounded-xl mb-6 ${!isSidebarOpen && 'justify-center'}`}>
                            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-pink-500/50">
                                {user?.avatar ? <Image src={user.avatar} fill className="object-cover" alt="Admin" /> : <div className="w-full h-full bg-gray-700"></div>}
                            </div>
                            {isSidebarOpen && (
                                <div className="overflow-hidden">
                                    <div className="font-bold text-sm truncate">{user?.username}</div>
                                    <div className="text-xs text-green-400">Yönetici Modu</div>
                                </div>
                            )}
                        </div>

                        <nav className="space-y-2">
                            {menuItems.map((item) => {
                                const isActive = pathname === item.path;
                                return (
                                    <Link key={item.path} href={item.path} prefetch={false} className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${isActive ? 'bg-pink-600 shadow-lg shadow-pink-600/20 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                                        <div className={`text-lg ${!isSidebarOpen && 'mx-auto'}`}>{item.icon}</div>
                                        {isSidebarOpen && <span className="font-medium text-sm">{item.name}</span>}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="mt-auto p-4 border-t border-white/5">
                        <Link href="/" className={`flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all ${!isSidebarOpen && 'justify-center'}`} title="Çıkış Yap">
                            <FaSignOutAlt className="text-lg" />
                            {isSidebarOpen && <span className="font-medium text-sm">Çıkış Yap</span>}
                        </Link>
                    </div>
                </aside>
                {/* Main Content */}
                <main className="flex-1 flex flex-col h-full overflow-hidden">
                    {/* Header */}
                    <header className="h-20 bg-black/20 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8">
                        <div className="flex items-center gap-4 text-gray-400 text-sm">
                            <span>Admin</span> / <span className="text-white capitalize">{(pathname?.split('/').pop()) || 'Dashboard'}</span>
                        </div>

                        <div className="flex items-center gap-6">
                            {/* Global Search */}
                            <div className="relative" ref={searchRef}>
                                <div className={`flex items-center bg-black/40 border ${showResults ? 'border-pink-500' : 'border-white/10'} rounded-full px-4 py-2 w-64 md:w-96 transition-all focus-within:w-full focus-within:border-pink-500`}>
                                    <FaSearch className="text-gray-500 mr-3" />
                                    <input
                                        type="text"
                                        placeholder="Global Arama (Kitap, Kullanıcı, Ticket)..."
                                        className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-500"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        onFocus={() => { if (searchResults) setShowResults(true) }}
                                    />
                                    {isSearching && <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin ml-2"></div>}
                                </div>

                                {/* Results Dropdown */}
                                {showResults && searchResults && (
                                    <div className="absolute top-12 left-0 w-full bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-2">
                                        {(!searchResults.books.length && !searchResults.users.length && !searchResults.tickets.length) ? (
                                            <div className="p-4 text-center text-gray-500 text-xs">Sonuç bulunamadı</div>
                                        ) : (
                                            <>
                                                {searchResults.books.length > 0 && (
                                                    <div className="p-2">
                                                        <div className="text-xs font-bold text-gray-500 px-2 mb-1">KİTAPLAR</div>
                                                        {searchResults.books.map(b => (
                                                            <div key={b.id} onClick={() => handleResultClick('/admin/books')} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                                                                <div className="w-8 h-10 bg-gray-800 rounded overflow-hidden relative">
                                                                    {b.cover && <Image src={b.cover} fill className="object-cover" alt="c" />}
                                                                </div>
                                                                <div className="text-sm text-white truncate">{b.title}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {searchResults.users.length > 0 && (
                                                    <div className="p-2 border-t border-white/5">
                                                        <div className="text-xs font-bold text-gray-500 px-2 mb-1">KULLANICILAR</div>
                                                        {searchResults.users.map(u => (
                                                            <div key={u.id} onClick={() => handleResultClick('/admin/users')} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                                                                <div className="w-8 h-8 bg-gray-700 rounded-full overflow-hidden relative">
                                                                    {u.avatar ? <Image src={u.avatar} fill className="object-cover" alt="a" /> : <div className="w-full h-full flex items-center justify-center text-xs">{u.username[0]}</div>}
                                                                </div>
                                                                <div className="text-sm text-white">{u.username}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {searchResults.tickets.length > 0 && (
                                                    <div className="p-2 border-t border-white/5">
                                                        <div className="text-xs font-bold text-gray-500 px-2 mb-1">DESTEK</div>
                                                        {searchResults.tickets.map(t => (
                                                            <div key={t.id} onClick={() => handleResultClick('/admin/support')} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                                                                <div className="text-lg text-purple-500"><FaLifeRing /></div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-sm text-white truncate">{t.subject}</div>
                                                                    <div className="text-[10px] text-gray-400">{t.status}</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                                <FaBell className="text-xl" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full"></span>
                            </button>
                        </div>
                    </header>

                    {/* Page Content */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
