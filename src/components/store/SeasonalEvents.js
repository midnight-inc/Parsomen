"use client";
import Link from 'next/link';
import { FaSnowflake, FaTree } from 'react-icons/fa';

export default function SeasonalEvents() {
    return (
        <div className="mb-12 relative rounded-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 animate-gradient-x"></div>

            {/* Snow Effect (CSS animation or static particles) */}
            <div className="absolute top-0 left-10 text-white/10 text-6xl animate-bounce"><FaSnowflake /></div>
            <div className="absolute bottom-10 right-20 text-white/10 text-4xl animate-pulse"><FaSnowflake /></div>

            <div className="relative z-10 p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2 text-cyan-300 font-bold tracking-widest uppercase text-sm">
                        <FaSnowflake /> Kış Etkinliği Başladı <FaSnowflake />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4 drop-shadow-xl">
                        Parsomen Kış Festivali
                    </h2>
                    <p className="text-indigo-200 text-lg max-w-xl leading-relaxed">
                        Soğuk kış gecelerinde içinizi ısıtacak hikayeler. Seçili "Kış" temalı kitaplarda XP puanları 2x katlanıyor!
                    </p>
                </div>

                <div className="flex flex-col gap-3 min-w-[200px]">
                    <Link
                        href="/store?category=Fantasy"
                        className="px-8 py-4 bg-white text-indigo-900 font-bold rounded-xl hover:bg-cyan-50 transition-colors shadow-xl text-center transform hover:scale-105 duration-300"
                    >
                        Vitrine Git
                    </Link>
                    <span className="text-center text-xs text-indigo-300 font-medium">15 Ocak'a kadar geçerli</span>
                </div>
            </div>

            {/* Frost Overlay */}
            <div className="absolute inset-0 border-[1px] border-white/20 rounded-2xl pointer-events-none"></div>
        </div>
    );
}
