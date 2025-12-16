import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET: Get user's reading progress for multiple books
export async function GET(req) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ progresses: {}, library: [], collections: {} });
    }

    try {
        // Execute all queries in parallel to reduce waterfall latency
        const [allProgress, library, collections, favorites] = await Promise.all([
            // Get all reading progress for user
            prisma.readingProgress.findMany({
                where: { userId: session.user.id },
                select: {
                    bookId: true,
                    percentage: true,
                    currentPage: true,
                    totalPages: true
                }
            }),

            // Get user's library
            prisma.library.findMany({
                where: { userId: session.user.id },
                select: { bookId: true }
            }),

            // Get user's collections with books
            prisma.collection.findMany({
                where: { userId: session.user.id },
                include: {
                    books: {
                        select: { bookId: true }
                    }
                }
            }),

            // Get user's favorites
            prisma.favorite.findMany({
                where: { userId: session.user.id },
                select: { bookId: true }
            })
        ]);

        // Format progress as { bookId: percentage }
        const progressMap = {};
        allProgress.forEach(p => {
            progressMap[p.bookId] = {
                percentage: p.percentage,
                currentPage: p.currentPage,
                totalPages: p.totalPages
            };
        });

        // Format collections as { bookId: [collectionNames] }
        const collectionMap = {};
        collections.forEach(c => {
            c.books.forEach(b => {
                if (!collectionMap[b.bookId]) {
                    collectionMap[b.bookId] = [];
                }
                collectionMap[b.bookId].push(c.name);
            });
        });

        return NextResponse.json({
            progresses: progressMap,
            library: library.map(l => l.bookId),
            collections: collectionMap,
            favorites: favorites.map(f => f.bookId)
        });
    } catch (error) {
        console.error('User books data error:', error);
        return NextResponse.json({ progresses: {}, library: [], collections: {} });
    }
}
