import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET: Get notes for a book
export async function GET(req) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('bookId');
    const pageNumber = searchParams.get('page');

    if (!bookId) {
        return NextResponse.json({ error: 'Book ID required' }, { status: 400 });
    }

    try {
        const where = {
            userId: session.user.id,
            bookId: parseInt(bookId)
        };

        if (pageNumber) {
            where.pageNumber = parseInt(pageNumber);
        }

        const notes = await prisma.note.findMany({
            where,
            orderBy: [{ pageNumber: 'asc' }, { createdAt: 'desc' }]
        });

        return NextResponse.json(notes);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to get notes' }, { status: 500 });
    }
}

// POST: Add a note
export async function POST(req) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { bookId, pageNumber, content, color } = await req.json();

        if (!bookId || !pageNumber || !content) {
            return NextResponse.json({ error: 'Book ID, page number, and content required' }, { status: 400 });
        }

        const note = await prisma.note.create({
            data: {
                userId: session.user.id,
                bookId: parseInt(bookId),
                pageNumber: parseInt(pageNumber),
                content,
                color: color || 'yellow'
            }
        });

        return NextResponse.json(note);
    } catch (error) {
        console.error('Note create error:', error);
        return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
    }
}

// PUT: Update a note
export async function PUT(req) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id, content, color } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'Note ID required' }, { status: 400 });
        }

        // Verify ownership
        const existingNote = await prisma.note.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingNote || existingNote.userId !== session.user.id) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        const note = await prisma.note.update({
            where: { id: parseInt(id) },
            data: {
                content: content || existingNote.content,
                color: color || existingNote.color
            }
        });

        return NextResponse.json(note);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
    }
}

// DELETE: Remove a note
export async function DELETE(req) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const noteId = searchParams.get('id');

    if (!noteId) {
        return NextResponse.json({ error: 'Note ID required' }, { status: 400 });
    }

    try {
        const note = await prisma.note.findUnique({
            where: { id: parseInt(noteId) }
        });

        if (!note || note.userId !== session.user.id) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        await prisma.note.delete({
            where: { id: parseInt(noteId) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
    }
}
