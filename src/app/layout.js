import './globals.css';
import MainLayout from '@/components/layout/MainLayout';
import { AuthProvider } from '@/context/AuthContext';
import { UserBooksProvider } from '@/context/UserBooksContext';
import { Inter, Montserrat } from 'next/font/google';
import ToastProvider from '@/components/ui/ToastProvider';
import QueryProvider from '@/components/providers/QueryProvider';
import ConfirmModal from '@/components/ui/ConfirmModal';
import DailyBonusModal from '@/components/gamification/DailyBonusModal';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });

export const metadata = {
    title: {
        default: 'Parşomen - Dijital Kütüphane',
        template: '%s | Parşomen'
    },
    description: 'Binlerce kitap arasından keşfet, oku, paylaş. Parşomen, okuma tutkunları için sosyal dijital kütüphane ve okuma takip uygulaması.',
    keywords: ['kitap', 'kütüphane', 'okuma takibi', 'ebook', 'sosyal medya', 'kitap incelemesi', 'parşomen', 'dijital kütüphane'],
    authors: [{ name: 'Midnight Inc.' }],
    creator: 'Midnight Inc.',
    publisher: 'Midnight Inc.',
    manifest: '/manifest.json',
    openGraph: {
        title: 'Parşomen - Dijital Kütüphane',
        description: 'Binlerce kitap arasından keşfet, oku, paylaş.',
        url: 'https://parsomen.vercel.app',
        siteName: 'Parşomen',
        locale: 'tr_TR',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Parşomen - Dijital Kütüphane',
        description: 'Okuma tutkunları için sosyal dijital kütüphane.',
    },
};

import { MaintenanceGuard } from '@/components/guards/MaintenanceGuard';

// ...

import ThemeWrapper from '@/components/providers/ThemeWrapper';
import { prisma } from '@/lib/prisma'; // Ensure correct import path

// Fetch theme settings properly
async function getThemeSettings() {
    try {
        const settings = await prisma.systemSetting.findMany({
            where: {
                key: { in: ['theme_mode', 'theme_selected'] }
            }
        });

        const mode = settings.find(s => s.key === 'theme_mode')?.value || 'AUTO';
        const theme = settings.find(s => s.key === 'theme_selected')?.value || 'default';

        return { mode, theme };
    } catch (error) {
        console.error("Theme fetch error:", error);
        return { mode: 'AUTO', theme: 'default' };
    }
}

export default async function RootLayout({ children }) {
    const { mode, theme } = await getThemeSettings();

    return (
        <html lang="tr" suppressHydrationWarning>
            <body className={`${inter.variable} ${montserrat.variable} font-sans`} suppressHydrationWarning>
                <ThemeWrapper initialMode={mode} initialTheme={theme} />
                <QueryProvider>
                    <AuthProvider>
                        <UserBooksProvider>
                            <MainLayout>
                                <MaintenanceGuard>
                                    {children}
                                </MaintenanceGuard>
                            </MainLayout>
                        </UserBooksProvider>
                    </AuthProvider>
                </QueryProvider>
                <ToastProvider />
                <ConfirmModal />
                <DailyBonusModal />
            </body>
        </html>
    );
}

