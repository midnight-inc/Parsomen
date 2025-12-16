import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get('session')?.value;

        if (!sessionToken) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const session = await decrypt(sessionToken);
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await request.json();
        const { bookId } = body;

        const existing = await prisma.favorite.findUnique({
            where: {
                userId_bookId: {
                    userId,
                    bookId: parseInt(bookId)
                }
            }
        });

        if (existing) {
            // Remove from Favorites Table
            await prisma.favorite.delete({
                where: { id: existing.id }
            });

            // Also remove from "Favoriler" collection if it exists
            const favCollection = await prisma.collection.findFirst({
                where: { userId, name: 'Favoriler' }
            });

            if (favCollection) {
                await prisma.collectionBook.deleteMany({
                    where: {
                        collectionId: favCollection.id,
                        bookId: parseInt(bookId)
                    }
                });
            }

            return NextResponse.json({ success: true, isFavorited: false });
        } else {
            // Add to Favorites Table
            await prisma.favorite.create({
                data: {
                    userId,
                    bookId: parseInt(bookId)
                }
            });

            // Sync with "Favoriler" Collection
            let favCollection = await prisma.collection.findFirst({
                where: { userId, name: 'Favoriler' }
            });

            if (!favCollection) {
                favCollection = await prisma.collection.create({
                    data: {
                        userId,
                        name: 'Favoriler',
                        isPublic: false
                    }
                });
            }

            // Add to collection if not already there
            try {
                await prisma.collectionBook.create({
                    data: {
                        collectionId: favCollection.id,
                        bookId: parseInt(bookId)
                    }
                });
            } catch (e) {
                // Ignore if unique constraint fails (already in collection)
            }

            return NextResponse.json({ success: true, isFavorited: true });
        }

    } catch (error) {
        console.error('Toggle favorite error:', error);
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}
