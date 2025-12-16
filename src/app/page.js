"use client";
import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaWindows, FaRocket, FaSync, FaShieldAlt } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        // Failsafe: If middleware misses it, client checks if running in Electron app
        if (typeof navigator !== 'undefined' && navigator.userAgent.includes('ParsomenDesktop')) {
            router.replace('/store');
        }
    }, [router]);

    return (
        <div className="min-h-[calc(100dvh-80px)] flex flex-col items-center justify-center relative overflow-hidden">

            {/* Background Glow effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -z-10" />

            <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row items-center gap-12">

                {/* Text Content */}
                <div className="flex-1 text-center md:text-left space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Parşomen
                            <span className="block text-2xl md:text-3xl text-purple-400 font-medium mt-2">Masasüstü Uygulaması</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto md:mx-0 leading-relaxed">
                            Kesintisiz okuma deneyimi, otomatik güncellemeler ve daha fazlası için masaüstü uygulamasını indirin.
                            Web teknolojilerinin gücü, masaüstü konforuyla buluştu.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <a href="/api/download/latest" target="_blank" rel="noopener noreferrer">
                            <Button
                                size="xl"
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg hover:shadow-purple-500/25 min-w-[200px]"
                                icon={<FaWindows className="text-2xl" />}
                            >
                                İndir ve Kur
                            </Button>
                        </a>
                        <Link href="/store">
                            <Button
                                variant="outline"
                                size="xl"
                                className="min-w-[200px]"
                            >
                                Siteye Göz At
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-white/5">
                        <div className="flex flex-col items-center md:items-start gap-2">
                            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                                <FaRocket />
                            </div>
                            <h3 className="font-bold text-white">Yüksek Performans</h3>
                            <p className="text-sm text-gray-400">Daha hızlı yükleme süreleri ve akıcı deneyim.</p>
                        </div>
                        <div className="flex flex-col items-center md:items-start gap-2">
                            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                                <FaSync />
                            </div>
                            <h3 className="font-bold text-white">Her Zaman Güncel</h3>
                            <p className="text-sm text-gray-400">Uygulamayı açtığınızda en son sürüm sizi karşılar.</p>
                        </div>
                        <div className="flex flex-col items-center md:items-start gap-2">
                            <div className="p-3 bg-green-500/10 rounded-lg text-green-400">
                                <FaShieldAlt />
                            </div>
                            <h3 className="font-bold text-white">Güvenli</h3>
                            <p className="text-sm text-gray-400">Güvenli bağlantı ve verileriniz koruma altında.</p>
                        </div>
                    </div>
                </div>

                {/* Mockup Image Placeholder
                    Recommended Size: 800x600px
                    Ratio: 4:3
                */}
                <div className="flex-1 w-full max-w-lg md:max-w-2xl flex items-center justify-center">
                    {/* Buraya daha sonra görsel eklenecek */}
                </div>

            </div>
        </div>
    );
}
