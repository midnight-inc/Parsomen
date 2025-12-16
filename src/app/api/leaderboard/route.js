import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Get leaderboard data
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'time'; // time | books | xp
    const limit = parseInt(searchParams.get('limit') || '50');

    try {
        let leaderboard = [];

        if (type === 'time') {
            // Most reading time
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    username: true,
                    level: true,
                    xp: true,
                    readingProgress: {
                        select: {
                            totalReadTime: true
                        }
                    }
                },
                take: limit
            });

            leaderboard = users
                .map(u => ({
                    id: u.id,
                    username: u.username,
                    level: u.level,
                    xp: u.xp,
                    totalReadTime: u.readingProgress.reduce((sum, p) => sum + p.totalReadTime, 0)
                }))
                .sort((a, b) => b.totalReadTime - a.totalReadTime)
                .map((u, idx) => ({ ...u, rank: idx + 1 }));

        } else if (type === 'books') {
            // Most books read (percentage >= 80%)
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    username: true,
                    level: true,
                    xp: true,
                    readingProgress: {
                        where: {
                            percentage: { gte: 80 }
                        },
                        select: {
                            id: true
                        }
                    }
                },
                take: limit
            });

            leaderboard = users
                .map(u => ({
                    id: u.id,
                    username: u.username,
                    level: u.level,
                    xp: u.xp,
                    booksRead: u.readingProgress.length
                }))
                .sort((a, b) => b.booksRead - a.booksRead)
                .map((u, idx) => ({ ...u, rank: idx + 1 }));

        } else if (type === 'xp') {
            // Most XP
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    username: true,
                    level: true,
                    xp: true
                },
                orderBy: { xp: 'desc' },
                take: limit
            });

            leaderboard = users.map((u, idx) => ({ ...u, rank: idx + 1 }));
        }

        return NextResponse.json({
            success: true,
            type,
            leaderboard
        });
    } catch (error) {
        console.error('Leaderboard error:', error);
        return NextResponse.json({ error: 'Failed to get leaderboard' }, { status: 500 });
    }
}
