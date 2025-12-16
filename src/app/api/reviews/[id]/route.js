import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// DELETE: Delete a review
export async function DELETE(req, context) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await context.params;
    const reviewId = parseInt(id);

    if (isNaN(reviewId)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    try {
        const review = await prisma.review.findUnique({ where: { id: reviewId } });

        if (!review) {
            // Already deleted or doesn't exist - treat as success
            return NextResponse.json({ success: true, message: 'Already deleted' });
        }

        // Check ownership or admin
        if (review.userId !== session.user.id && session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const bookId = review.bookId;
        const isTopLevel = review.parentId === null;

        await prisma.review.delete({ where: { id: reviewId } });

        // Remove XP if it was a top-level review (not a reply)
        if (isTopLevel && review.userId === session.user.id) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: { xp: { decrement: 10 } }
            });
        }

        // Update book rating after deletion (only consider top-level reviews)
        const allReviews = await prisma.review.findMany({
            where: { bookId, parentId: null }
        });
        const avgRating = allReviews.length > 0
            ? allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length
            : 0;

        await prisma.book.update({
            where: { id: bookId },
            data: { rating: parseFloat(avgRating.toFixed(1)) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        // If record was already deleted, return success
        if (error.code === 'P2025') {
            return NextResponse.json({ success: true, message: 'Already deleted' });
        }
        console.error('Delete error:', error);
        return NextResponse.json({ error: 'Silme işlemi başarısız' }, { status: 500 });
    }
}

// PUT: Update a review
export async function PUT(req, context) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await context.params;
    const reviewId = parseInt(id);

    try {
        const body = await req.json();
        const { text, rating } = body;

        const review = await prisma.review.findUnique({ where: { id: reviewId } });

        if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

        if (review.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const updatedReview = await prisma.review.update({
            where: { id: reviewId },
            data: {
                text,
                rating: parseInt(rating)
            },
            include: {
                user: { select: { id: true, username: true } }
            }
        });

        // Recalculate book rating
        const allReviews = await prisma.review.findMany({ where: { bookId: review.bookId } });
        const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

        await prisma.book.update({
            where: { id: review.bookId },
            data: { rating: parseFloat(avgRating.toFixed(1)) }
        });

        return NextResponse.json(updatedReview);
    } catch (error) {
        console.error('Update error:', error);
        return NextResponse.json({ error: 'Failed to update: ' + error.message }, { status: 500 });
    }
}
