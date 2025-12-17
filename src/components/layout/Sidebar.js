"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaCompass, FaStore, FaBook, FaUsers, FaGamepad, FaNewspaper, FaChartLine, FaTags } from 'react-icons/fa';

const MENU_ITEMS = [
    { name: 'Akış', path: '/feed', icon: <FaUsers /> },
    { name: 'Keşfet', path: '/', icon: <FaCompass /> },
    { name: 'Kitaplık', path: '/store', icon: <FaStore /> },
    { name: 'Kütüphanem', path: '/library', icon: <FaBook /> },
    { name: 'Gruplar', path: '/groups', icon: <FaUsers /> },
    { name: 'Etkinlikler', path: '/events', icon: <FaGamepad /> },
    { name: 'Haberler', path: '/news', icon: <FaNewspaper /> },
    { name: 'İstatistikler', path: '/stats', icon: <FaChartLine /> },
];

const CATEGORIES = [
    'Polisiye', 'Bilim Kurgu', 'Dram', 'Klasik', 'Fantastik', 'Tarih', 'Korku'
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="glass-panel h-full flex flex-col p-6 overflow-y-auto w-[280px]">
            <Link href="/store" className="mb-10 flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500"></div>
                <h1 className="text-2xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    PARSOMEN
                </h1>
            </Link>

            <nav className="space-y-1 mb-8">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-4">Menü</h3>
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                                ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] border border-white/10'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span className="font-medium text-sm">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="pt-6 border-t border-white/5 flex flex-col gap-1">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-4 flex items-center gap-2">
                    <FaTags /> Kategoriler
                </h3>
                {CATEGORIES.map(cat => (
                    <Link
                        key={cat}
                        href={`/store?category=${cat}`}
                        className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors block"
                    >
                        # {cat}
                    </Link>
                ))}
            </div>
        </div>
    );
}
