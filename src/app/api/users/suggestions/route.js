import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ success: false, users: [] });
    }

    try {
        const userId = session.user.id;

        // Get IDs of users already friend or requested
        const existingFriendships = await prisma.friendship.findMany({
            where: {
                OR: [
                    { userId: userId },
                    { friendId: userId }
                ]
            }
        });

        const excludedIds = existingFriendships.map(f => f.userId === userId ? f.friendId : f.userId);
        excludedIds.push(userId); // Exclude self

        // Find users not in excluded list
        const suggestions = await prisma.user.findMany({
            where: {
                id: { notIn: excludedIds }
            },
            take: 10,
            select: {
                id: true,
                username: true,
                avatar: true
            },
            orderBy: { createdAt: 'desc' } // Just getting recent users for now
        });

        return NextResponse.json({ success: true, users: suggestions });
    } catch (error) {
        console.error("Suggestion error:", error);
        return NextResponse.json({ success: false, users: [] });
    }
}
