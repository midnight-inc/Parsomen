"use client";
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { FaCircle } from 'react-icons/fa';

export default function LiveStatsTicker() {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    // Hide on Auth pages too
    const isAuthPage = pathname === '/login' || pathname === '/register';

    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (isAdmin || isAuthPage) return;

        const fetchTicker = async () => {
            try {
                // Add timestamp to prevent browser caching
                const res = await fetch(`/api/stats/ticker?t=${Date.now()}`);
                const data = await res.json();
                if (data.success && Array.isArray(data.messages)) {
                    setMessages(data.messages);
                }
            } catch (e) { }
        };

        fetchTicker();
        // Refresh data every 15 seconds
        const interval = setInterval(fetchTicker, 15000);
        return () => clearInterval(interval);
    }, [isAdmin, isAuthPage]);

    if (isAdmin || isAuthPage) return null;

    // Use a default message if empty to avoid empty bar, though API handles this mostly.
    const displayMessages = messages.length > 0 ? messages : ["Veriler yükleniyor..."];

    return (
        // Completely transparent background, no border, seamless integration
        // The text will float over the site background.
        <div className="w-full bg-transparent z-40 h-8 flex items-center overflow-hidden relative mt-1">

            {/* Live Indicator - Minimalist */}
            <div className="absolute left-0 top-0 bottom-0 z-10 px-4 flex items-center bg-gradient-to-r from-black via-black/80 to-transparent">
                <span className="flex items-center gap-2 text-[10px] font-bold text-pink-500 uppercase tracking-widest animate-pulse">
                    <FaCircle size={6} /> Canlı
                </span>
            </div>

            {/* Marquee Wrapper */}
            <div className="flex-1 overflow-hidden relative h-full flex items-center mask-image-linear-to-r">
                <div className="animate-marquee whitespace-nowrap flex items-center gap-12 pl-24">
                    {/* Render list twice for smooth scroll */}
                    {[...displayMessages, ...displayMessages].map((msg, idx) => (
                        <span key={idx} className="text-xs font-medium text-gray-400 flex items-center gap-3">
                            {msg}
                            <span className="w-1 h-1 bg-gray-700 rounded-full opacity-50"></span>
                        </span>
                    ))}
                </div>
            </div>

            {/* Fade out right edge */}
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
        </div>
    );
}
