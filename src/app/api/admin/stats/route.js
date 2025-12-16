import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const [bookCount, categoryCount, userCount, reviewCount] = await Promise.all([
            prisma.book.count(),
            prisma.category.count(),
            prisma.user.count(),
            prisma.review.count()
        ]);

        return NextResponse.json({
            books: bookCount,
            categories: categoryCount,
            users: userCount,
            reviews: reviewCount
        });
    } catch (error) {
        console.error('Stats fetch error:', error);
        return NextResponse.json({ error: 'İstatistikler alınamadı.' }, { status: 500 });
    }
}
