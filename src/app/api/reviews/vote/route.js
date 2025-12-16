import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';

// POST: Vote on a review (like/dislike)
export async function POST(req) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Rate limiting for interactions - 30 per minute
    const rateLimitError = await checkRateLimit(req, 'interaction');
    if (rateLimitError) return rateLimitError;

    try {
        const { reviewId, type } = await req.json();

        if (!reviewId || !['LIKE', 'DISLIKE'].includes(type)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        // Check existing vote
        const existingVote = await prisma.reviewVote.findUnique({
            where: {
                userId_reviewId: {
                    userId: session.user.id,
                    reviewId: parseInt(reviewId)
                }
            }
        });

        const review = await prisma.review.findUnique({ where: { id: parseInt(reviewId) } });
        if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

        let likes = review.likes;
        let dislikes = review.dislikes;

        if (existingVote) {
            if (existingVote.type === type) {
                // Same vote - remove it (toggle off)
                await prisma.reviewVote.delete({ where: { id: existingVote.id } });
                if (type === 'LIKE') likes--;
                else dislikes--;
            } else {
                // Different vote - change it
                await prisma.reviewVote.update({
                    where: { id: existingVote.id },
                    data: { type }
                });
                if (type === 'LIKE') {
                    likes++;
                    dislikes--;
                } else {
                    dislikes++;
                    likes--;
                }
            }
        } else {
            // New vote
            await prisma.reviewVote.create({
                data: {
                    userId: session.user.id,
                    reviewId: parseInt(reviewId),
                    type
                }
            });
            if (type === 'LIKE') likes++;
            else dislikes++;
        }

        // Update review counts
        await prisma.review.update({
            where: { id: parseInt(reviewId) },
            data: { likes, dislikes }
        });

        return NextResponse.json({
            success: true,
            likes,
            dislikes,
            userVote: existingVote?.type === type ? null : type
        });
    } catch (error) {
        console.error('Vote error:', error);
        return NextResponse.json({ error: 'Vote failed' }, { status: 500 });
    }
}

// GET: Get user's vote on a review
export async function GET(req) {
    const session = await getSession();
    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
        return NextResponse.json({ error: 'Review ID required' }, { status: 400 });
    }

    try {
        let userVote = null;
        if (session) {
            const vote = await prisma.reviewVote.findUnique({
                where: {
                    userId_reviewId: {
                        userId: session.user.id,
                        reviewId: parseInt(reviewId)
                    }
                }
            });
            userVote = vote?.type || null;
        }

        return NextResponse.json({ userVote });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to get vote' }, { status: 500 });
    }
}
