import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req) {
    try {
        const session = await getSession();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const q = searchParams.get('q');

        if (!q || q.length < 2) return NextResponse.json({ results: [] });

        // Parallel Search
        const [books, users, tickets] = await Promise.all([
            prisma.book.findMany({
                where: { OR: [{ title: { contains: q, mode: 'insensitive' } }, { author: { contains: q, mode: 'insensitive' } }] },
                take: 5,
                select: { id: true, title: true, cover: true }
            }),
            prisma.user.findMany({
                where: { OR: [{ username: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }] },
                take: 5,
                select: { id: true, username: true, avatar: true }
            }),
            prisma.ticket.findMany({
                where: { subject: { contains: q, mode: 'insensitive' } },
                take: 5,
                select: { id: true, subject: true, status: true }
            })
        ]);

        return NextResponse.json({
            success: true,
            results: { books, users, tickets }
        });

    } catch (error) {
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
