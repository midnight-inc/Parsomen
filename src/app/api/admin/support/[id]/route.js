import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// Get Specific Ticket & Updates
export async function GET(req, { params }) {
    try {
        const session = await getSession();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const ticket = await prisma.ticket.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: {
                    select: { id: true, username: true, role: true, avatar: true }
                },
                replies: {
                    include: {
                        user: {
                            select: { id: true, username: true, role: true, avatar: true }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json({ success: true, ticket });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Reply to Ticket or Update Status
export async function POST(req, { params }) {
    try {
        const session = await getSession();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { message, status } = await req.json(); // message for reply, status for closing/opening

        // 1. Durum Güncelleme
        if (status) {
            await prisma.ticket.update({
                where: { id: parseInt(id) },
                data: { status }
            });
            return NextResponse.json({ success: true, message: 'Status updated' });
        }

        // 2. Yanıt Gönderme
        if (message) {
            const reply = await prisma.ticketReply.create({
                data: {
                    ticketId: parseInt(id),
                    userId: session.user.id,
                    message
                },
                include: {
                    user: {
                        select: { id: true, username: true, role: true, avatar: true }
                    }
                }
            });

            // Eğer kapalıysa otomatik açılabilir veya olduğu gibi kalabilir. Şimdilik statusu etkilemiyoruz.
            return NextResponse.json({ success: true, reply });
        }

        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
