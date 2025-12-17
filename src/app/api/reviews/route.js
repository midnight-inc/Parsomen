import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('bookId');
    const sort = searchParams.get('sort') || 'newest'; // newest, oldest, most_liked
    const session = await getSession();

    if (!bookId) {
        return NextResponse.json({ error: 'Book ID required' }, { status: 400 });
    }

    try {
        // Determine sort order
        let orderBy = { createdAt: 'desc' };
        if (sort === 'oldest') orderBy = { createdAt: 'asc' };
        if (sort === 'most_liked') orderBy = { likes: 'desc' };

        const reviews = await prisma.review.findMany({
            where: {
                bookId: parseInt(bookId),
                parentId: null, // Only top-level reviews
                status: 'APPROVED'
            },
            include: {
                user: {
                    select: { id: true, username: true, role: true }
                },
                replies: {
                    include: {
                        user: {
                            select: { id: true, username: true, role: true }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy
        });

        // Get user's votes if logged in
        let userVotes = {};
        if (session) {
            const reviewIds = reviews.flatMap(r => [r.id, ...r.replies.map(rep => rep.id)]);
            const votes = await prisma.reviewVote.findMany({
                where: {
                    userId: session.user.id,
                    reviewId: { in: reviewIds }
                }
            });
            votes.forEach(v => { userVotes[v.reviewId] = v.type; });
        }

        // Add user vote info to reviews
        const reviewsWithVotes = reviews.map(r => ({
            ...r,
            userVote: userVotes[r.id] || null,
            replies: r.replies.map(rep => ({
                ...rep,
                userVote: userVotes[rep.id] || null
            }))
        }));

        return NextResponse.json(reviewsWithVotes);
    } catch (error) {
        console.error('Get reviews error:', error);
        return NextResponse.json({ error: 'Reviews could not be fetched' }, { status: 500 });
    }
}

export async function POST(req) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Rate limiting for interactions - 30 per minute
    const rateLimitError = await checkRateLimit(req, 'interaction');
    if (rateLimitError) return rateLimitError;

    try {
        const body = await req.json();
        const { text, rating, spoiler, parentId } = body;
        const bookId = parseInt(body.bookId);

        if (!bookId || !text) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // SECURITY: Limit review text length
        if (text.length > 10000) {
            return NextResponse.json({ error: 'Review too long (max 10000 chars)' }, { status: 400 });
        }

        // If it's a reply, don't require rating
        const isReply = !!parentId;

        if (!isReply && !rating) {
            return NextResponse.json({ error: 'Rating required for reviews' }, { status: 400 });
        }

        // Check if user already reviewed this book (only for top-level reviews)
        if (!isReply) {
            const existing = await prisma.review.findFirst({
                where: {
                    bookId,
                    userId: session.user.id,
                    parentId: null
                }
            });

            if (existing) {
                return NextResponse.json({ error: 'Bu kitabı zaten incelediniz.' }, { status: 409 });
            }
        }

        // If reply, verify parent exists
        if (isReply) {
            const parent = await prisma.review.findUnique({ where: { id: parseInt(parentId) } });
            if (!parent) {
                return NextResponse.json({ error: 'Parent review not found' }, { status: 404 });
            }
        }

        const review = await prisma.review.create({
            data: {
                bookId,
                userId: session.user.id,
                text,
                rating: isReply ? 0 : parseInt(rating),
                spoiler: spoiler || false,
                parentId: isReply ? parseInt(parentId) : null,
                status: 'APPROVED'
            },
            include: {
                user: { select: { id: true, username: true } }
            }
        });

        // Gamification: Add XP (only for new top-level reviews)
        if (!isReply) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: { xp: { increment: 10 } }
            });

            // Recalculate book rating
            const allReviews = await prisma.review.findMany({
                where: { bookId, parentId: null }
            });
            const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

            await prisma.book.update({
                where: { id: bookId },
                data: { rating: parseFloat(avgRating.toFixed(1)) }
            });
        }

        return NextResponse.json(review);
    } catch (error) {
        console.error('Review Error:', error);
        return NextResponse.json({ error: 'Failed to create review: ' + error.message }, { status: 500 });
    }
}
