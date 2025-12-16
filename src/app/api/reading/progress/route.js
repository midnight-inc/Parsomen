import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET: Get reading progress and settings for a book
export async function GET(req) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('bookId');

    if (!bookId) {
        return NextResponse.json({ error: 'Book ID required' }, { status: 400 });
    }

    try {
        const progress = await prisma.readingProgress.findUnique({
            where: {
                userId_bookId: {
                    userId: session.user.id,
                    bookId: parseInt(bookId)
                }
            }
        });

        return NextResponse.json(progress || {
            currentPage: 1,
            totalPages: 0,
            percentage: 0,
            totalReadTime: 0,
            bgColor: '#0a0a0f',
            pageColor: '#ffffff',
            fontFamily: 'default',
            fontSize: 100,
            darkMode: true
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to get progress' }, { status: 500 });
    }
}

// POST: Update reading progress and settings
export async function POST(req) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const {
            bookId,
            currentPage,
            totalPages,
            readTime,
            newPagesForXP, // New pages for XP (calculated client-side)
            bgColor,
            pageColor,
            fontFamily,
            fontSize,
            darkMode,
            textColor
        } = await req.json();

        if (!bookId) {
            return NextResponse.json({ error: 'Book ID required' }, { status: 400 });
        }

        const percentage = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

        // Update progress
        const progress = await prisma.readingProgress.upsert({
            where: {
                userId_bookId: {
                    userId: session.user.id,
                    bookId: parseInt(bookId)
                }
            },
            update: {
                currentPage: currentPage || 1,
                totalPages: totalPages || 0,
                percentage,
                lastReadAt: new Date(),
                totalReadTime: { increment: readTime || 0 },
                bgColor: bgColor || '#0a0a0f',
                pageColor: pageColor || '#ffffff',
                fontFamily: fontFamily || 'default',
                fontSize: fontSize || 100,
                darkMode: darkMode !== undefined ? darkMode : true
            },
            create: {
                userId: session.user.id,
                bookId: parseInt(bookId),
                currentPage: currentPage || 1,
                totalPages: totalPages || 0,
                percentage,
                totalReadTime: readTime || 0,
                bgColor: bgColor || '#0a0a0f',
                pageColor: pageColor || '#ffffff',
                fontFamily: fontFamily || 'default',
                fontSize: fontSize || 100,
                darkMode: darkMode !== undefined ? darkMode : true
            }
        });

        // Award XP only for genuinely new pages (passed from client)
        const xpToAward = newPagesForXP || 0;
        if (xpToAward > 0) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: { xp: { increment: xpToAward } }
            });
        }

        return NextResponse.json({
            ...progress,
            xpEarned: xpToAward
        });
    } catch (error) {
        console.error('Progress update error:', error);
        return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
    }
}
