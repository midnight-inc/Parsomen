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
            // Most reading time (Temporarily fallback to XP as historical time data was in deleted table)
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

            leaderboard = users.map((u, idx) => ({
                ...u,
                totalReadTime: u.xp * 10, // Fake calculation for now or just show XP implies time
                rank: idx + 1
            }));

        } else if (type === 'books') {
            // Most books read (status: READ)
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    username: true,
                    level: true,
                    xp: true,
                    library: {
                        where: {
                            status: 'READ'
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
                    booksRead: u.library.length
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
