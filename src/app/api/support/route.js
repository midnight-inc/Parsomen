import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '@/lib/auth';

const prisma = new PrismaClient();

// GET: List tickets (Admin sees all, User sees own)
// POST: Create ticket
export async function GET(request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const rules = session.user.role === 'ADMIN' ? {} : { userId: session.user.id };

        // Include user details for admin
        const tickets = await prisma.ticket.findMany({
            where: rules,
            include: {
                user: { select: { username: true, email: true } },
                _count: { select: { replies: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, tickets });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { subject, message } = await request.json();

        const newTicket = await prisma.ticket.create({
            data: {
                subject,
                message,
                userId: session.user.id
            }
        });

        return NextResponse.json({ success: true, ticket: newTicket });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
