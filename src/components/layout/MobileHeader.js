"use client";
import Link from 'next/link';
import { FaEnvelope } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import UserAvatar from '@/components/ui/UserAvatar';

export default function MobileHeader() {
    const { user } = useAuth();

    return (
        <div className="lg:hidden sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between transition-all duration-300">
            {/* Left: Logo */}
            <Link href="/feed" className="flex items-center gap-2">
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-wide" style={{ fontFamily: "'Motiva Sans', sans-serif" }}>
                    PARSOMEN
                </span>
            </Link>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                <Link href="/messages" className="relative text-gray-300 hover:text-white transition-colors">
                    <FaEnvelope size={22} />
                    {/* Badge support to be added via separate context or API */}
                </Link>
            </div>
        </div>
    );
}
