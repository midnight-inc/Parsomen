import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// Add book to collection
export async function POST(req, { params }) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Giriş yapmalısınız', message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const collectionId = parseInt(params.id);
        const { bookId } = await req.json();

        if (!bookId || isNaN(collectionId)) {
            return NextResponse.json({ error: 'Geçersiz parametreler', message: 'Invalid parameters' }, { status: 400 });
        }

        // Check if collection belongs to user
        const collection = await prisma.collection.findUnique({
            where: { id: collectionId }
        });

        if (!collection) {
            return NextResponse.json({ error: 'Koleksiyon bulunamadı', message: 'Collection not found' }, { status: 404 });
        }

        if (collection.userId !== session.user.id) {
            return NextResponse.json({ error: 'Bu koleksiyona erişim yetkiniz yok', message: 'Forbidden' }, { status: 403 });
        }

        // Check if book already in collection
        const existing = await prisma.collectionBook.findUnique({
            where: {
                collectionId_bookId: {
                    collectionId,
                    bookId: parseInt(bookId)
                }
            }
        });

        if (existing) {
            return NextResponse.json({
                error: 'Bu kitap zaten koleksiyonda',
                message: 'Book already in collection',
                alreadyExists: true
            }, { status: 409 });
        }

        // Add book to collection
        const collectionBook = await prisma.collectionBook.create({
            data: {
                collectionId,
                bookId: parseInt(bookId)
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Kitap koleksiyona eklendi',
            collectionBook
        });
    } catch (error) {
        console.error('Add to collection error:', error);
        return NextResponse.json({
            error: 'Kitap eklenirken bir hata oluştu',
            message: error.message
        }, { status: 500 });
    }
}

// Remove book from collection
export async function DELETE(req, { params }) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Giriş yapmalısınız', message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const collectionId = parseInt(params.id);
        const { searchParams } = new URL(req.url);
        const bookId = searchParams.get('bookId');

        if (!bookId || isNaN(collectionId)) {
            return NextResponse.json({ error: 'Geçersiz parametreler', message: 'Invalid parameters' }, { status: 400 });
        }

        // Check if collection belongs to user
        const collection = await prisma.collection.findUnique({
            where: { id: collectionId }
        });

        if (!collection || collection.userId !== session.user.id) {
            return NextResponse.json({ error: 'Bu koleksiyona erişim yetkiniz yok', message: 'Forbidden' }, { status: 403 });
        }

        // Remove book from collection
        await prisma.collectionBook.delete({
            where: {
                collectionId_bookId: {
                    collectionId,
                    bookId: parseInt(bookId)
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Kitap koleksiyondan çıkarıldı'
        });
    } catch (error) {
        console.error('Remove from collection error:', error);
        return NextResponse.json({
            error: 'Kitap çıkarılırken bir hata oluştu',
            message: error.message
        }, { status: 500 });
    }
}
