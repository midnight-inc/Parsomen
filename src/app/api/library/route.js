import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request) {
    try {
        // 1. Authentication Check
        const session = await getSession();
        if (!session || !session.user?.id) {
            return NextResponse.json({
                success: false,
                error: 'Kütüphaneye kitap eklemek için giriş yapmalısınız.'
            }, { status: 401 });
        }

        // 2. Rate Limiting
        const rateLimitError = await checkRateLimit(request, 'interaction');
        if (rateLimitError) return rateLimitError;

        const json = await request.json();
        const { bookId, status } = json;

        // SECURITY: userId is ALWAYS from session, never from client
        const userId = session.user.id;

        if (!bookId) {
            return NextResponse.json({
                success: false,
                error: 'Kitap ID gerekli.'
            }, { status: 400 });
        }

        // Validate status
        const validStatuses = ['WANT_TO_READ', 'READING', 'READ'];
        const libraryStatus = validStatuses.includes(status) ? status : 'WANT_TO_READ';

        // Check if book exists
        const book = await prisma.book.findUnique({
            where: { id: parseInt(bookId) }
        });

        if (!book) {
            return NextResponse.json({
                success: false,
                error: 'Kitap bulunamadı.'
            }, { status: 404 });
        }

        // Upsert - update if exists, create if not
        const entry = await prisma.libraryEntry.upsert({
            where: {
                userId_bookId: {
                    userId: parseInt(userId),
                    bookId: parseInt(bookId)
                }
            },
            update: {
                status: libraryStatus
            },
            create: {
                userId: parseInt(userId),
                bookId: parseInt(bookId),
                status: libraryStatus
            }
        });

        return NextResponse.json({ success: true, entry });
    } catch (error) {
        console.error('[Library] Add error:', error);
        return NextResponse.json({
            success: false,
            error: 'Kitap kütüphaneye eklenemedi.'
        }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const session = await getSession();
        if (!session || !session.user?.id) {
            return NextResponse.json({
                success: false,
                error: 'Giriş yapmalısınız.'
            }, { status: 401 });
        }

        const userId = session.user.id;

        const entries = await prisma.libraryEntry.findMany({
            where: { userId: parseInt(userId) },
            include: {
                book: {
                    select: {
                        id: true,
                        title: true,
                        author: true,
                        cover: true,
                        rating: true
                    }
                }
            },
            orderBy: { addedAt: 'desc' }
        });

        return NextResponse.json({ success: true, entries });
    } catch (error) {
        console.error('[Library] Fetch error:', error);
        return NextResponse.json({
            success: false,
            error: 'Kütüphane yüklenemedi.'
        }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const session = await getSession();
        if (!session || !session.user?.id) {
            return NextResponse.json({
                success: false,
                error: 'Giriş yapmalısınız.'
            }, { status: 401 });
        }

        const { bookId } = await request.json();
        const userId = session.user.id;

        if (!bookId) {
            return NextResponse.json({
                success: false,
                error: 'Kitap ID gerekli.'
            }, { status: 400 });
        }

        await prisma.libraryEntry.delete({
            where: {
                userId_bookId: {
                    userId: parseInt(userId),
                    bookId: parseInt(bookId)
                }
            }
        });

        return NextResponse.json({ success: true, message: 'Kitap kütüphaneden kaldırıldı.' });
    } catch (error) {
        console.error('[Library] Delete error:', error);
        return NextResponse.json({
            success: false,
            error: 'Kitap kaldırılamadı.'
        }, { status: 500 });
    }
}

