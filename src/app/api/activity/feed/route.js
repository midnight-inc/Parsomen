import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Users active in the last 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        const activeReaders = await prisma.readingProgress.findMany({
            where: {
                lastReadAt: {
                    gt: fiveMinutesAgo
                }
            },
            include: {
                user: {
                    select: {
                        username: true,
                        role: true
                    }
                },
                book: {
                    select: {
                        title: true
                    }
                }
            },
            orderBy: {
                lastReadAt: 'desc'
            },
            take: 10 // Show last 10 active users
        });

        // Format for ticker
        const feed = activeReaders.map(record => ({
            user: record.user.username,
            action: 'okuyor', // Since we track reading progress, action is always reading
            book: record.book.title,
            timestamp: record.lastReadAt
        }));

        return NextResponse.json({ success: true, feed });
    } catch (error) {
        console.error("Feed error:", error);
        return NextResponse.json({ success: false, feed: [] });
    }
}
