import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ success: false, messages: [] });
    }

    try {
        const userId = session.user.id;

        // Get unique users from sent or received messages
        const recentMessages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: {
                sender: { select: { id: true, username: true, avatar: true } },
                receiver: { select: { id: true, username: true, avatar: true } }
            }
        });

        const contactsMap = new Map();

        recentMessages.forEach(msg => {
            const isSender = msg.senderId === userId;
            const contact = isSender ? msg.receiver : msg.sender;

            if (!contactsMap.has(contact.id)) {
                contactsMap.set(contact.id, {
                    ...contact,
                    lastMessage: msg.content,
                    time: msg.createdAt,
                    unread: !isSender && !msg.read
                });
            }
        });

        const contacts = Array.from(contactsMap.values()).slice(0, 5);

        return NextResponse.json({ success: true, contacts });
    } catch (error) {
        return NextResponse.json({ success: false, contacts: [] });
    }
}
