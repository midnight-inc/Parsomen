import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Users active in the last 15 minutes (extended time window)
        const fiveMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

        const activities = await prisma.userActivity.findMany({
            where: {
                createdAt: { gt: fiveMinutesAgo },
                type: { in: ['STARTED_READING', 'FINISHED_READING', 'LIBRARY_UPDATE', 'REVIEW'] },
                targetId: { not: null }
            },
            include: {
                user: { select: { username: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        // Collect Book IDs
        const bookIds = [...new Set(activities.map(a => a.targetId))];
        const books = await prisma.book.findMany({
            where: { id: { in: bookIds } },
            select: { id: true, title: true }
        });

        // Map books for quick lookup
        const bookMap = {};
        books.forEach(b => bookMap[b.id] = b.title);

        // Format for ticker
        const feed = activities.map(act => ({
            user: act.user.username,
            action: act.type === 'FINISHED_READING' ? 'bitirdi' : 'okuyor',
            book: bookMap[act.targetId] || 'bir kitap',
            timestamp: act.createdAt
        }));

        return NextResponse.json({ success: true, feed });
    } catch (error) {
        console.error("Feed error:", error);
        return NextResponse.json({ success: false, feed: [] });
    }
}
