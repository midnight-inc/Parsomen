"use client";
import Link from 'next/link';
import { FaHome, FaExclamationTriangle, FaCompass, FaSearch } from 'react-icons/fa';
import EasterEgg from '@/components/gamification/EasterEgg';
import Button from '@/components/ui/Button';

export default function NotFound() {
    return (
        <div className="fixed inset-0 z-[9999] min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#09090b]">
            {/* Background Effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-[120px] -z-10" />

            <div className="text-center space-y-8 px-4 relative z-10">
                <div className="relative inline-block">
                    <h1 className="text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500/20 to-pink-500/20 leading-none select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <FaCompass className="text-6xl text-purple-500 animate-pulse" />
                    </div>
                </div>

                <div className="space-y-4 max-w-lg mx-auto">
                    <h2 className="text-3xl font-bold text-white">Bu Parşomen Kayıp!</h2>
                    <p className="text-gray-400 text-lg">
                        Aradığın sayfa antik kütüphanemizin tozlu raflarında bile bulunamadı.
                        Belki de yanlış bir büyü sözcüğü kullandın?
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                    <Link href="/">
                        <Button
                            variant="primary"
                            size="lg"
                            icon={<FaHome />}
                            className="w-full sm:w-auto"
                        >
                            Ana Sayfaya Dön
                        </Button>
                    </Link>
                    <Link href="/store?search=true">
                        <Button
                            variant="secondary"
                            size="lg"
                            icon={<FaSearch />}
                            className="w-full sm:w-auto"
                        >
                            Kitap Ara
                        </Button>
                    </Link>
                </div>

                <div className="absolute bottom-10 right-10">
                    <EasterEgg id="404_egg" icon="dragon" className="text-4xl opacity-5 hover:opacity-100 transition-opacity duration-1000" />
                </div>
            </div>

            {/* Decor Elements */}
            <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        </div>
    );
}
