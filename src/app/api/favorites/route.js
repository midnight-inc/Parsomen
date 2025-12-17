import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Rate limiting
    const rateLimitError = await checkRateLimit(req, 'interaction');
    if (rateLimitError) return rateLimitError;

    try {
        const { bookId } = await req.json();

        // Toggle logic
        const existing = await prisma.favorite.findUnique({
            where: { userId_bookId: { userId: session.user.id, bookId } }
        });

        if (existing) {
            await prisma.favorite.delete({
                where: { userId_bookId: { userId: session.user.id, bookId } }
            });
            return NextResponse.json({ isFavorite: false });
        } else {
            await prisma.favorite.create({
                data: { userId: session.user.id, bookId }
            });
            return NextResponse.json({ isFavorite: true });
        }

    } catch (error) {
        return NextResponse.json({ error: 'Failed to toggle favorite' }, { status: 500 });
    }
}

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const bookId = parseInt(searchParams.get('bookId'));
    const session = await getSession();

    if (!session || !bookId) return NextResponse.json({ isFavorite: false });

    const fav = await prisma.favorite.findUnique({
        where: { userId_bookId: { userId: session.user.id, bookId } }
    });

    return NextResponse.json({ isFavorite: !!fav });
}
