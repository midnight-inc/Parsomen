import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '@/lib/auth';

const prisma = new PrismaClient();

// POST: Add reply
export async function POST(request, { params }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { id } = await params; // Ticket ID
        const { message } = await request.json();

        const ticketId = parseInt(id);

        // Verify ticket exists
        const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
        if (!ticket) return NextResponse.json({ success: false, message: 'Ticket not found' }, { status: 404 });

        // Ensure authorized (Admin or Owner)
        if (session.user.role !== 'ADMIN' && ticket.userId !== session.user.id) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const reply = await prisma.ticketReply.create({
            data: {
                message,
                ticketId,
                userId: session.user.id,
                isAdminReply: session.user.role === 'ADMIN'
            }
        });

        return NextResponse.json({ success: true, reply });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// GET: Get single ticket details with replies
export async function GET(request, { params }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const ticketId = parseInt(id);

        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId },
            include: {
                user: { select: { username: true, role: true } },
                replies: {
                    include: { user: { select: { username: true, role: true, id: true } } },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!ticket) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });

        if (session.user.role !== 'ADMIN' && ticket.userId !== session.user.id) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json({ success: true, ticket });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
