import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function MaintenanceGuard({ children }) {
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || '';
    const query = new URLSearchParams(headersList.get('x-query') || '');
    const isInfoLogin = pathname.startsWith('/login') && query.get('access') === 'admin';

    // Bypass for maintenance page, admin, api
    // Allow login only if explicitly accessing as admin
    if (
        pathname.startsWith('/maintenance') ||
        pathname.startsWith('/admin') ||
        (pathname.startsWith('/login') && isInfoLogin) ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next')
    ) {
        return <>{children}</>;
    }

    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'maintenance_mode' }
        });

        if (setting?.value === 'true') {
            const session = await getSession();

            // Allow Admin
            if (session?.user?.role === 'ADMIN') {
                return (
                    <>
                        <div className="bg-red-600 text-white text-xs text-center p-1 fixed top-0 left-0 right-0 z-[9999]">
                            BAKIM MODU AKTİF (Admin Erişimi)
                        </div>
                        {children}
                    </>
                );
            }

            // Redirect others
            redirect('/maintenance');
        }
    } catch (error) {
        // If redirect happens in try, it's caught as error in Next.js? 
        // Actually redirect throws an error that Next handles. We should rethrow if it is a NEXT_REDIRECT.
        if (error.message === 'NEXT_REDIRECT') throw error;
        // Db error -> proceed safely
        console.error('Maintenance check failed', error);
    }

    return <>{children}</>;
}
