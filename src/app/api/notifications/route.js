import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Get user notifications
export async function GET(req) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const notifications = await prisma.notification.findMany({
            where: {
                userId: session.user.id
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 20,
            include: {
                fromUser: {
                    select: {
                        username: true,
                        avatar: true
                    }
                }
            }
        });

        const unreadCount = await prisma.notification.count({
            where: {
                userId: session.user.id,
                read: false
            }
        });

        return NextResponse.json({ success: true, notifications, unreadCount });
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching notifications' }, { status: 500 });
    }
}

// PUT: Mark notifications as read
export async function PUT(req) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await req.json();

        if (id) {
            // Mark specific notification
            await prisma.notification.update({
                where: { id: parseInt(id) },
                data: { read: true }
            });
        } else {
            // Mark all valid notifications as read
            await prisma.notification.updateMany({
                where: {
                    userId: session.user.id,
                    read: false
                },
                data: { read: true }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Error updating notifications' }, { status: 500 });
    }
}
