import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userId = session.user.id;
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 10;
        const skip = (page - 1) * limit;

        // Get friends IDs
        // We need to check both initiated and received friendships where status is ACCEPTED
        const friendships = await prisma.friendship.findMany({
            where: {
                OR: [
                    { userId: userId, status: 'ACCEPTED' },
                    { friendId: userId, status: 'ACCEPTED' }
                ]
            }
        });

        const friendIds = friendships.map(f => f.userId === userId ? f.friendId : f.userId);

        // Include self posts too
        const targetIds = [userId, ...friendIds];

        const posts = await prisma.post.findMany({
            where: {
                userId: { in: targetIds }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                },
                book: {
                    select: {
                        id: true,
                        title: true,
                        author: true,
                        cover: true
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                },
                likes: {
                    where: { userId: userId },
                    select: { userId: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: skip
        });

        // Add isLiked field
        const formattedPosts = posts.map(post => ({
            ...post,
            isLiked: post.likes.length > 0,
            likes: undefined, // remove raw array
            likeCount: post._count.likes,
            commentCount: post._count.comments
        }));

        return NextResponse.json({ success: true, posts: formattedPosts });

    } catch (error) {
        console.error('Feed error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch feed' }, { status: 500 });
    }
}
