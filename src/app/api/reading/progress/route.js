import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET: Get reading progress for a book
export async function GET(req) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('bookId');

    if (!bookId) {
        return NextResponse.json({ error: 'Book ID required' }, { status: 400 });
    }

    try {
        const entry = await prisma.libraryEntry.findUnique({
            where: {
                userId_bookId: {
                    userId: session.user.id,
                    bookId: parseInt(bookId)
                }
            },
            include: { book: true }
        });

        return NextResponse.json({
            currentPage: entry ? entry.progress : 0,
            totalPages: entry?.book?.pages || 0,
            percentage: (entry && entry.book?.pages) ? Math.round((entry.progress / entry.book.pages) * 100) : 0,
            // Settings are no longer stored in DB, use local storage on client
            bgColor: '#0a0a0f',
            pageColor: '#ffffff',
            fontFamily: 'default',
            fontSize: 100,
            darkMode: true,
            textColor: '#000000'
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to get progress' }, { status: 500 });
    }
}

// POST: Update reading progress
export async function POST(req) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const {
            bookId,
            currentPage,
            newPagesForXP, // New pages for XP (calculated client-side)
        } = await req.json();

        if (!bookId) {
            return NextResponse.json({ error: 'Book ID required' }, { status: 400 });
        }

        // Update Library Entry
        // Use upsert to create if not exists (add to library automatically)
        const entry = await prisma.libraryEntry.upsert({
            where: {
                userId_bookId: {
                    userId: session.user.id,
                    bookId: parseInt(bookId)
                }
            },
            update: {
                progress: currentPage || 0,
                status: 'READING' // Assuming updating progress means reading
            },
            create: {
                userId: session.user.id,
                bookId: parseInt(bookId),
                progress: currentPage || 0,
                status: 'READING'
            }
        });

        // Award XP
        const xpToAward = newPagesForXP || 0;
        if (xpToAward > 0) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: { xp: { increment: xpToAward } }
            });
        }

        return NextResponse.json({
            success: true,
            progress: entry.progress,
            xpEarned: xpToAward
        });
    } catch (error) {
        console.error('Progress update error:', error);
        return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
    }
}
