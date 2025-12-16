import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const userId = session.user.id;

        // Parallel Data Fetching
        const [
            user,
            totalTimeResult,
            completedCount,
            inProgressCount,
            recentActivity
        ] = await Promise.all([
            // 1. Basic User Data + Counts
            prisma.user.findUnique({
                where: { id: userId },
                include: {
                    badges: { include: { badge: true } },
                    reviews: {
                        include: { book: true },
                        orderBy: { createdAt: 'desc' },
                        take: 5
                    },
                    _count: {
                        select: {
                            reviews: true,
                            library: true,
                            collections: true,
                            favorites: true
                        }
                    }
                }
            }),
            // 2. Total Reading Time
            prisma.readingProgress.aggregate({
                where: { userId },
                _sum: { totalReadTime: true }
            }),
            // 3. Completed Books
            prisma.readingProgress.count({
                where: { userId, percentage: { gte: 80 } }
            }),
            // 4. In Progress Books
            prisma.readingProgress.count({
                where: { userId, percentage: { gt: 0, lt: 80 } }
            }),
            // 5. Recent Activity
            prisma.readingProgress.findMany({
                where: { userId },
                orderBy: { lastReadAt: 'desc' },
                take: 3,
                include: {
                    book: {
                        select: {
                            id: true,
                            title: true,
                            cover: true
                        }
                    }
                }
            })
        ]);

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const maxXp = user.level * 1000;
        const totalReadingTime = totalTimeResult._sum.totalReadTime || 0;

        // Recent Activity Formatting
        const formattedActivity = recentActivity.map(p => ({
            id: p.book.id,
            title: p.book.title,
            cover: p.book.cover,
            percentage: p.percentage,
            lastRead: p.updatedAt
        }));

        return NextResponse.json({
            ...user,
            maxXp,
            totalReadingTime,
            booksCompleted: completedCount,
            booksInProgress: inProgressCount,
            recentActivity: formattedActivity
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
