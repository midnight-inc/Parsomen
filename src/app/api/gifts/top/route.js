import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET - Get top gifters from database
export async function GET() {
    try {
        // Count gifts sent by each user
        const gifters = await prisma.gift.groupBy({
            by: ['senderId'],
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 10
        });

        if (gifters.length === 0) {
            return NextResponse.json({ success: true, gifters: [] });
        }

        // Get user details
        const userIds = gifters.map(g => g.senderId);
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, username: true }
        });

        const userMap = new Map(users.map(u => [u.id, u.username]));

        const result = gifters.map((g, idx) => ({
            rank: idx + 1,
            userId: g.senderId,
            username: userMap.get(g.senderId) || 'Unknown',
            giftCount: g._count.id
        }));

        return NextResponse.json({ success: true, gifters: result });
    } catch (error) {
        console.error('Top gifters fetch error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
    }
}
