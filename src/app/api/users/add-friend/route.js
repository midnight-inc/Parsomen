import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { targetUserId } = await request.json();
        const userId = session.user.id;

        if (userId === targetUserId) {
            return NextResponse.json({ success: false, error: 'Self' }, { status: 400 });
        }

        // Check if exists
        const existing = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { userId: userId, friendId: targetUserId },
                    { userId: targetUserId, friendId: userId }
                ]
            }
        });

        if (existing) {
            return NextResponse.json({ success: false, error: 'Existing' }, { status: 409 });
        }

        await prisma.friendship.create({
            data: {
                userId,
                friendId: targetUserId,
                status: 'PENDING'
            }
        });

        // Create notification for target user
        await prisma.notification.create({
            data: {
                userId: targetUserId,
                type: 'FRIEND_REQUEST',
                title: 'Arkadaşlık İsteği',
                message: `${session.user.username} sana arkadaşlık isteği gönderdi.`,
                link: '/friends', // Redirect to friends page to accept
                fromUserId: userId
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}
