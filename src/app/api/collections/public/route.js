import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET - Get public collections with most books (curator lists)
export async function GET() {
    try {
        const collections = await prisma.collection.findMany({
            where: { isPublic: true },
            include: {
                user: { select: { username: true } },
                books: { include: { book: true } },
                _count: { select: { books: true } }
            },
            orderBy: { books: { _count: 'desc' } },
            take: 6
        });

        const result = collections.map(c => ({
            id: c.id,
            name: c.name,
            description: c.description,
            image: c.image,
            curator: c.user.username,
            bookCount: c._count.books,
            books: c.books.slice(0, 4).map(cb => ({
                id: cb.book.id,
                title: cb.book.title,
                cover: cb.book.cover
            }))
        }));

        return NextResponse.json({ success: true, collections: result });
    } catch (error) {
        console.error('Public collections fetch error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
    }
}
