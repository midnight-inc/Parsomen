"use client";
import Link from 'next/link';

export default function Hero() {
    return (
        <div className="relative h-[400px] rounded-3xl overflow-hidden mb-12 group">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>

            <div className="relative z-10 p-12 h-full flex flex-col justify-center max-w-2xl">
                <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-sm font-bold mb-4 w-fit backdrop-blur-md">
                    HAFTANIN EDİTÖR SEÇİMİ
                </span>
                <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-6 leading-tight">
                    Gizemli Satırlar Arasında Kaybolun
                </h1>
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                    Agatha Christie'nin eşsiz eserleri ve yüzlerce polisiye roman şimdi Parşomen kütüphanesinde sizi bekliyor.
                </p>
                <div className="flex gap-4">
                    <Link href="/store" className="glass-button bg-indigo-600 hover:bg-indigo-500 border-none px-8 py-3 text-lg shadow-lg shadow-indigo-500/30">
                        Hemen Keşfet
                    </Link>
                    <Link href="/groups" className="glass-button px-8 py-3 text-lg">
                        Topluluğa Katıl
                    </Link>
                </div>
            </div>
        </div>
    );
}
