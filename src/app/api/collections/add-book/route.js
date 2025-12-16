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
        // Authentication successful, proceed.

        const body = await request.json();
        const { collectionId, bookId } = body;

        const existing = await prisma.collectionBook.findUnique({
            where: {
                collectionId_bookId: {
                    collectionId: parseInt(collectionId),
                    bookId: parseInt(bookId)
                }
            }
        });

        if (existing) {
            return NextResponse.json({ success: false, error: 'Book already in collection', code: 'ALREADY_EXISTS' }, { status: 409 });
        }

        await prisma.collectionBook.create({
            data: {
                collectionId: parseInt(collectionId),
                bookId: parseInt(bookId)
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to add book' }, { status: 500 });
    }
}
