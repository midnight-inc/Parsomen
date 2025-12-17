import { prisma } from '@/lib/prisma';
import { updateQuestProgress } from '@/lib/gamification';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';

// GET - Get friends list
export async function GET(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = await decrypt(token);
        if (!session?.userId) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }

        const userId = session.userId;

        // Get accepted friendships (both directions)
        const friendships = await prisma.friendship.findMany({
            where: {
                OR: [
                    { userId, status: 'ACCEPTED' },
                    { friendId: userId, status: 'ACCEPTED' }
                ]
            },
            include: {
                user: { select: { id: true, username: true, avatar: true, level: true } },
                friend: { select: { id: true, username: true, avatar: true, level: true } }
            }
        });

        // Get pending requests (received)
        const pendingRequests = await prisma.friendship.findMany({
            where: { friendId: userId, status: 'PENDING' },
            include: {
                user: { select: { id: true, username: true, avatar: true, level: true } }
            }
        });

        // Get sent requests
        const sentRequests = await prisma.friendship.findMany({
            where: { userId, status: 'PENDING' },
            include: {
                friend: { select: { id: true, username: true, avatar: true, level: true } }
            }
        });

        // Format friends list
        const friends = friendships.map(f => {
            const friendUser = f.userId === userId ? f.friend : f.user;
            return {
                friendshipId: f.id,
                ...friendUser,
                since: f.acceptedAt
            };
        });

        return NextResponse.json({
            success: true,
            friends,
            pendingRequests: pendingRequests.map(r => ({
                requestId: r.id,
                ...r.user,
                requestedAt: r.createdAt
            })),
            sentRequests: sentRequests.map(r => ({
                requestId: r.id,
                ...r.friend,
                sentAt: r.createdAt
            }))
        });
    } catch (error) {
        console.error('Friends fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 });
    }
}

// POST - Send friend request
export async function POST(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = await decrypt(token);
        if (!session?.userId) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }

        const { friendId, username } = await req.json();
        const userId = session.userId;

        // Find target user
        let targetUserId = friendId;
        if (username && !friendId) {
            const targetUser = await prisma.user.findFirst({
                where: { username: { equals: username, mode: 'insensitive' } }
            });
            if (!targetUser) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }
            targetUserId = targetUser.id;
        }

        if (targetUserId === userId) {
            return NextResponse.json({ error: 'Cannot add yourself' }, { status: 400 });
        }

        // Check if friendship exists
        const existing = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { userId, friendId: targetUserId },
                    { userId: targetUserId, friendId: userId }
                ]
            }
        });

        if (existing) {
            return NextResponse.json({ error: 'Friendship already exists or pending' }, { status: 400 });
        }

        // Create friend request
        await prisma.friendship.create({
            data: { userId, friendId: targetUserId, status: 'PENDING' }
        });

        return NextResponse.json({ success: true, message: 'Friend request sent' });
    } catch (error) {
        console.error('Friend request error:', error);
        return NextResponse.json({ error: 'Failed to send request' }, { status: 500 });
    }
}

// PUT - Accept/Reject friend request
export async function PUT(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = await decrypt(token);
        if (!session?.userId) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }

        const { requestId, action } = await req.json(); // action: 'accept' or 'reject'

        const friendship = await prisma.friendship.findUnique({
            where: { id: requestId }
        });

        if (!friendship || friendship.friendId !== session.userId) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        if (action === 'accept') {
            await prisma.$transaction([
                prisma.friendship.update({
                    where: { id: requestId },
                    data: { status: 'ACCEPTED', acceptedAt: new Date() }
                }),
                // Create activity for both users
                prisma.friendActivity.create({
                    data: { userId: session.userId, friendId: friendship.userId, type: 'FRIEND_ADDED' }
                }),
                prisma.friendActivity.create({
                    data: { userId: friendship.userId, friendId: session.userId, type: 'FRIEND_ADDED' }
                }),
                // Notification for the requester
                prisma.notification.create({
                    data: {
                        userId: friendship.userId,
                        type: 'FRIEND_ACCEPTED',
                        title: 'Arkadaşlık Kabul Edildi',
                        message: 'Arkadaşlık isteğin kabul edildi!',
                        link: '/friends',
                        fromUserId: session.userId
                    }
                })
            ]);

            // TRIGGER QUEST: ADD_FRIEND
            try {
                await updateQuestProgress(session.userId, 'ADD_FRIEND', 1);
                await updateQuestProgress(friendship.userId, 'ADD_FRIEND', 1);
            } catch (e) {
                console.error("Quest update failed", e);
            }

            return NextResponse.json({ success: true, message: 'Friend added' });
        } else {
            await prisma.friendship.delete({ where: { id: requestId } });
            return NextResponse.json({ success: true, message: 'Request rejected' });
        }
    } catch (error) {
        console.error('Friend action error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

// DELETE - Remove friend
export async function DELETE(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = await decrypt(token);
        if (!session?.userId) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }

        const { friendshipId } = await req.json();

        const friendship = await prisma.friendship.findUnique({
            where: { id: friendshipId }
        });

        if (!friendship || (friendship.userId !== session.userId && friendship.friendId !== session.userId)) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        // Get friend's id
        const friendUserId = friendship.userId === session.userId ? friendship.friendId : friendship.userId;

        await prisma.$transaction([
            prisma.friendship.delete({ where: { id: friendshipId } }),
            // Create activity for remover
            prisma.friendActivity.create({
                data: { userId: session.userId, friendId: friendUserId, type: 'FRIEND_REMOVED' }
            }),
            // Create activity for the removed person
            prisma.friendActivity.create({
                data: { userId: friendUserId, friendId: session.userId, type: 'FRIEND_REMOVED_BY' }
            })
        ]);

        return NextResponse.json({ success: true, message: 'Friend removed' });
    } catch (error) {
        console.error('Friend delete error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
