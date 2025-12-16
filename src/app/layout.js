import './globals.css';
import MainLayout from '@/components/layout/MainLayout';
import { AuthProvider } from '@/context/AuthContext';
import { UserBooksProvider } from '@/context/UserBooksContext';
import { Inter, Montserrat } from 'next/font/google';
import ToastProvider from '@/components/ui/ToastProvider';
import QueryProvider from '@/components/providers/QueryProvider';
import ConfirmModal from '@/components/ui/ConfirmModal';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });

export const metadata = {
    title: 'Parşomen - Dijital Kütüphane',
    description: 'Binlerce kitap arasından keşfet, oku, paylaş. Parşomen, okuma tutkunları için sosyal dijital kütüphane.',
    manifest: '/manifest.json',
};

import { MaintenanceGuard } from '@/components/guards/MaintenanceGuard';

// ...

export default function RootLayout({ children }) {
    return (
        <html lang="tr" suppressHydrationWarning>
            <body className={`${inter.variable} ${montserrat.variable} font-sans`} suppressHydrationWarning>
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
            </body>
        </html>
    );
}

