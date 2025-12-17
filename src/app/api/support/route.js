import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';

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

        // Rate limiting
        const rateLimitError = await checkRateLimit(request, 'interaction');
        if (rateLimitError) return rateLimitError;

        const { subject, message } = await request.json();

        // Input validation
        if (!subject || typeof subject !== 'string' || subject.trim().length < 3 || subject.length > 200) {
            return NextResponse.json({ success: false, message: 'Konu 3-200 karakter olmalı' }, { status: 400 });
        }
        if (!message || typeof message !== 'string' || message.trim().length < 10 || message.length > 5000) {
            return NextResponse.json({ success: false, message: 'Mesaj 10-5000 karakter olmalı' }, { status: 400 });
        }

        const newTicket = await prisma.ticket.create({
            data: {
                subject: subject.trim().slice(0, 200),
                message: message.trim().slice(0, 5000),
                userId: session.user.id
            }
        });

        return NextResponse.json({ success: true, ticket: newTicket });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
