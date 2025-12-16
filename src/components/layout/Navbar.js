"use client";
import { useState, useRef, useEffect } from 'react';
import { FaSearch, FaBell, FaUserCircle, FaCog, FaSignOutAlt, FaShieldAlt } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, logout } = useAuth();

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [hasNotification, setHasNotification] = useState(true); // Mocking notification state
    const dropDownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            router.push(`/store?search=${e.target.value}`);
        }
    };

    return (
        <div className="flex items-center justify-between mb-8">
            {/* Search Bar */}
            <div className="relative w-96 group z-40">
                <button
                    onClick={() => {
                        const input = document.getElementById('navbar-search');
                        router.push(`/store?search=${input.value}`);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-white transition-colors cursor-pointer hover:text-indigo-400"
                >
                    <FaSearch />
                </button>
                <input
                    id="navbar-search"
                    type="text"
                    placeholder="Kitap, Yazar veya Tür ara..."
                    className="glass-input pl-12 focus:bg-white/10"
                    onKeyDown={handleSearch}
                    defaultValue={searchParams.get('search') || ''}
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6 z-50">
                <button
                    onClick={() => setHasNotification(!hasNotification)} // Toggle for demo
                    className="relative p-3 rounded-full hover:bg-white/10 transition-all text-gray-300 hover:text-white"
                >
                    <FaBell className="text-xl" />
                    {hasNotification && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]"></span>
                    )}
                </button>

                <div className="flex items-center gap-3 pl-6 border-l border-white/10 relative" ref={dropDownRef}>
                    <div className="text-right hidden md:block cursor-pointer" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                        <div className="text-sm font-bold text-white">{user?.username || 'Misafir'}</div>
                        <div className="text-xs text-gray-400">{user ? `Level ${user.level || 1} Okur` : 'Giriş Yapılmadı'}</div>
                    </div>

                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 border-2 border-white/20 hover:scale-105 transition-transform overflow-hidden"
                    >
                        {/* Avatar Placeholder - Could be user image */}
                        {user?.username ? (
                            <span className="text-white font-bold text-lg flex justify-center items-center h-full w-full">
                                {user.username.charAt(0).toUpperCase()}
                            </span>
                        ) : (
                            <FaUserCircle className="w-full h-full text-white/50" />
                        )}
                    </button>

                    {/* Profile Dropdown */}
                    {isProfileOpen && (
                        <div className="absolute top-full right-0 mt-4 w-60 glass-panel p-2 shadow-xl animate-in zoom-in-95 duration-200 border border-white/10 flex flex-col gap-1">
                            <Link href="/profile/me" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
                                <FaUserCircle /> Profilim
                            </Link>
                            <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
                                <FaCog /> Ayarlar
                            </Link>

                            {user?.role === 'ADMIN' && (
                                <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors border-t border-white/5 mt-1 pt-2">
                                    <FaShieldAlt /> Yönetici Paneli
                                </Link>
                            )}

                            <button
                                onClick={logout}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors w-full text-left mt-1 border-t border-white/5"
                            >
                                <FaSignOutAlt /> Çıkış Yap
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
