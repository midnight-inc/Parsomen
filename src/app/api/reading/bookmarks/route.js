import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET: Get bookmarks for a book
export async function GET(req) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('bookId');

    if (!bookId) {
        return NextResponse.json({ error: 'Book ID required' }, { status: 400 });
    }

    try {
        const bookmarks = await prisma.bookmark.findMany({
            where: {
                userId: session.user.id,
                bookId: parseInt(bookId)
            },
            orderBy: { pageNumber: 'asc' }
        });

        return NextResponse.json(bookmarks);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to get bookmarks' }, { status: 500 });
    }
}

// POST: Add a bookmark
export async function POST(req) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { bookId, pageNumber, title, description } = await req.json();

        if (!bookId || !pageNumber) {
            return NextResponse.json({ error: 'Book ID and page number required' }, { status: 400 });
        }

        const bookmark = await prisma.bookmark.create({
            data: {
                userId: session.user.id,
                bookId: parseInt(bookId),
                pageNumber: parseInt(pageNumber),
                title: title || `Sayfa ${pageNumber}`,
                description: description || null
            }
        });

        return NextResponse.json(bookmark);
    } catch (error) {
        console.error('Bookmark create error:', error);
        return NextResponse.json({ error: 'Failed to create bookmark' }, { status: 500 });
    }
}

// PUT: Update a bookmark
export async function PUT(req) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id, title, description } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'Bookmark ID required' }, { status: 400 });
        }

        // Verify ownership
        const existingBookmark = await prisma.bookmark.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingBookmark || existingBookmark.userId !== session.user.id) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        const bookmark = await prisma.bookmark.update({
            where: { id: parseInt(id) },
            data: {
                title: title !== undefined ? title : existingBookmark.title,
                description: description !== undefined ? description : existingBookmark.description
            }
        });

        return NextResponse.json(bookmark);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update bookmark' }, { status: 500 });
    }
}

// DELETE: Remove a bookmark
export async function DELETE(req) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const bookmarkId = searchParams.get('id');

    if (!bookmarkId) {
        return NextResponse.json({ error: 'Bookmark ID required' }, { status: 400 });
    }

    try {
        // Verify ownership
        const bookmark = await prisma.bookmark.findUnique({
            where: { id: parseInt(bookmarkId) }
        });

        if (!bookmark || bookmark.userId !== session.user.id) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        await prisma.bookmark.delete({
            where: { id: parseInt(bookmarkId) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete bookmark' }, { status: 500 });
    }
}
