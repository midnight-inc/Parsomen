import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET Stories
export async function GET(request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userId = session.user.id;

        // Friends logic
        const friendships = await prisma.friendship.findMany({
            where: {
                OR: [
                    { userId: userId, status: 'ACCEPTED' },
                    { friendId: userId, status: 'ACCEPTED' }
                ]
            }
        });
        const friendIds = friendships.map(f => f.userId === userId ? f.friendId : f.userId);
        const targetIds = [userId, ...friendIds];

        const now = new Date();

        const stories = await prisma.story.findMany({
            where: {
                userId: { in: targetIds },
                expiresAt: { gt: now }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Group by user
        const groupedStories = {};
        stories.forEach(story => {
            if (!groupedStories[story.userId]) {
                groupedStories[story.userId] = {
                    user: story.user,
                    items: []
                };
            }
            groupedStories[story.userId].items.push(story);
        });

        // Convert to array
        const result = Object.values(groupedStories);

        return NextResponse.json({ success: true, stories: result });

    } catch (error) {
        console.error('Stories error:', error);
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}

// POST Story
export async function POST(request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { image, type } = body;

        if (!image) {
            return NextResponse.json({ success: false, error: 'Image required' }, { status: 400 });
        }

        // 24 hours expiry
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const story = await prisma.story.create({
            data: {
                userId: session.user.id,
                image,
                type: type || 'IMAGE',
                expiresAt
            }
        });

        return NextResponse.json({ success: true, story });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}
