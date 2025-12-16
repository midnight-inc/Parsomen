import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
        return NextResponse.json({ success: true, books: [], users: [] });
    }

    try {
        const [books, users] = await Promise.all([
            prisma.book.findMany({
                where: {
                    OR: [
                        { title: { contains: query } },
                        { author: { contains: query } }
                    ]
                },
                take: 5,
                select: { id: true, title: true, author: true, cover: true }
            }),
            prisma.user.findMany({
                where: {
                    username: { contains: query }
                },
                take: 10,
                select: { id: true, username: true, avatar: true, level: true, role: true }
            })
        ]);

        return NextResponse.json({ success: true, books, users });
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
