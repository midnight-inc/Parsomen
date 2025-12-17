import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request) {
    try {
        const session = await getSession();
        // Allow public access or require login? Community page seems public-ish.
        // But user auth is good for context.

        const events = await prisma.communityEvent.findMany({
            where: {
                isActive: true,
                endDate: { gt: new Date() }
            },
            orderBy: { startDate: 'asc' }
        });

        return NextResponse.json({ success: true, events });
    } catch (error) {
        console.error('Events fetch error:', error);
        return NextResponse.json({ success: false, error: 'Sunucu hatası.' }, { status: 500 });
    }
}
