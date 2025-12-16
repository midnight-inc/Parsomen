import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');

    if (!bookId) {
        return NextResponse.json({ success: false, error: 'Book ID required' });
    }

    try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        // Count distinct users who viewed this book in last 5 mins
        const count = await prisma.userActivity.count({
            where: {
                type: 'VIEW_BOOK',
                targetId: parseInt(bookId),
                createdAt: { gt: fiveMinutesAgo }
            }
        });

        return NextResponse.json({ success: true, count });
    } catch (error) {
        return NextResponse.json({ success: false, count: 0 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { bookId, userId } = body;

        await prisma.userActivity.create({
            data: {
                userId: parseInt(userId),
                type: 'VIEW_BOOK',
                targetId: parseInt(bookId)
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false });
    }
}
