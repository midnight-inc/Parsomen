import { FaTools, FaDiscord, FaTwitter } from 'react-icons/fa';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getMaintenanceMessage() {
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'maintenance_message' }
        });
        return setting?.value || 'Sistem şu anda bakım aşamasındadır. Lütfen daha sonra tekrar deneyiniz.';
    } catch (e) {
        return 'Sistem bakımda.';
    }
}

export default async function MaintenancePage() {
    const message = await getMaintenanceMessage();

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Background Blobs */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-pulse delay-1000" />
            <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] bg-pink-600/20 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />

            <div className="relative z-10 w-full max-w-lg">
                <div className="bg-gray-900/40 backdrop-blur-2xl p-10 rounded-3xl border border-white/10 shadow-2xl text-center relative overflow-hidden group hover:border-white/20 transition-all duration-500">

                    {/* Glass Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out pointer-events-none" />

                    <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-white/5 relative">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 animate-spin-slow blur-md" />
                        <FaTools className="text-4xl text-gray-300 relative z-10" />
                    </div>

                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 mb-6 tracking-tight">
                        Bakım Modu
                    </h1>

                    <p className="text-gray-400 text-lg leading-relaxed mb-8 font-medium">
                        {message}
                    </p>

                    <div className="flex justify-center gap-6 mb-10">
                        <a href="#" className="text-gray-500 hover:text-[#5865F2] transition-colors"><FaDiscord size={24} /></a>
                        <a href="#" className="text-gray-500 hover:text-[#1DA1F2] transition-colors"><FaTwitter size={24} /></a>
                    </div>

                    <div className="text-[10px] text-gray-600/70 font-mono font-bold tracking-[0.2em] uppercase mb-6">
                        PARŞOMEN SYSTEM OVERRIDE
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        <Link
                            href="/login?access=admin"
                            className="text-xs text-gray-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group/link"
                        >
                            <span className="w-1.5 h-1.5 bg-gray-600 rounded-full group-hover/link:bg-green-500 transition-colors" />
                            Yönetici Girişi
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
