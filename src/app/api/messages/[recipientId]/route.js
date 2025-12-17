import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET: Belirli kullanıcı ile mesajları getir
export async function GET(req, { params }) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { recipientId } = await params;
        const recipientIdNum = parseInt(recipientId, 10);
        const userId = session.user.id;

        if (isNaN(recipientIdNum)) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
        }

        // Get messages between current user and recipient
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: recipientIdNum },
                    { senderId: recipientIdNum, receiverId: userId }
                ]
            },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: {
                    select: { id: true, username: true, avatar: true }
                }
            }
        });

        // Mark messages as read
        await prisma.message.updateMany({
            where: {
                senderId: recipientIdNum,
                receiverId: userId,
                read: false
            },
            data: { read: true, status: 'READ' }
        });

        // Get recipient info
        const recipient = await prisma.user.findUnique({
            where: { id: recipientIdNum },
            select: { id: true, username: true, avatar: true, level: true }
        });

        return NextResponse.json({
            success: true,
            messages,
            recipient
        });
    } catch (error) {
        console.error('Get messages error:', error);
        return NextResponse.json({ error: 'Failed to get messages' }, { status: 500 });
    }
}
