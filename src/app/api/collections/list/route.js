import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';

export async function GET(request) {
    try {
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get('session')?.value;

        if (!sessionToken) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const session = await decrypt(sessionToken);
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        const collections = await prisma.collection.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, collections });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch collections' }, { status: 500 });
    }
}
