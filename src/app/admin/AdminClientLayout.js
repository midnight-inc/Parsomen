"use client";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaChartBar, FaUsers, FaTags, FaMedal, FaCog, FaHome, FaCheckCircle, FaBook, FaGem } from 'react-icons/fa';
import { useEffect } from 'react';

export default function AdminClientLayout({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || user.role !== 'ADMIN')) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading || !user || user.role !== 'ADMIN') {
        return <div className="min-h-screen bg-black flex items-center justify-center text-white">Yükleniyor...</div>;
    }

    const menu = [
        { icon: <FaChartBar />, label: 'Panel', href: '/admin' },
        { icon: <FaBook />, label: 'Kitaplar', href: '/admin/books' },
        { icon: <FaTags />, label: 'Kategoriler', href: '/admin/categories' },
        { icon: <FaMedal />, label: 'Rozetler', href: '/admin/badges' },
        { icon: <FaUsers />, label: 'Kullanıcılar', href: '/admin/users' },
        { icon: <FaGem />, label: 'Puan Dükkanı', href: '/admin/shop' },
        { icon: <FaCheckCircle />, label: 'Destek', href: '/admin/support' },
        { icon: <FaCog />, label: 'Ayarlar', href: '/admin/settings' },
    ];

    return (
        <div className="flex min-h-screen bg-black font-sans text-gray-300">
            {/* Admin Sidebar */}
            <aside className="w-64 border-r border-gray-800 bg-gray-900/50 flex flex-col">
                <div className="p-6 border-b border-gray-800 flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-bold text-white">A</div>
                    <span className="font-bold text-white tracking-wider">ADMIN PANEL</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menu.map(item => (
                        <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-3 rounded hover:bg-white/5 hover:text-white transition-colors">
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <Link href="/store" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white transition-colors">
                        <FaHome /> <span>Mağazaya Dön</span>
                    </Link>
                </div>
            </aside>

            {/* Admin Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
