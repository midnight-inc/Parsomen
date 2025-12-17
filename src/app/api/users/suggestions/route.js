import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ users: [] }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const userId = session.user.id;

    try {
        // 1. Get all friends
        const friendships = await prisma.friendship.findMany({
            where: {
                OR: [
                    { userId: userId, status: 'ACCEPTED' },
                    { friendId: userId, status: 'ACCEPTED' }
                ]
            },
            include: {
                user: { select: { id: true, username: true, avatar: true } },
                friend: { select: { id: true, username: true, avatar: true } }
            }
        });

        // 2. Extract friend profiles
        let friends = friendships.map(f => {
            return f.userId === userId ? f.friend : f.user;
        });

        // 3. Filter by query if exists
        if (query) {
            const lowerQ = query.toLowerCase();
            friends = friends.filter(f => f.username.toLowerCase().includes(lowerQ));
        }

        // 4. Sort by interaction (Last message)
        // Get last messages involving this user
        const lastMessages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 50, // Analyze last 50 messages
            select: { senderId: true, receiverId: true, createdAt: true }
        });

        // Create a map of UserID -> LastInteractionTime
        const interactionMap = {};
        lastMessages.forEach(msg => {
            const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
            if (!interactionMap[otherId]) {
                interactionMap[otherId] = msg.createdAt;
            }
        });

        // Sort friends: Recently interacted first
        friends.sort((a, b) => {
            const timeA = interactionMap[a.id] ? new Date(interactionMap[a.id]).getTime() : 0;
            const timeB = interactionMap[b.id] ? new Date(interactionMap[b.id]).getTime() : 0;
            return timeB - timeA;
        });

        // FALLBACK: If user has no friends or suggestions list is small, add some random users for testing
        if (friends.length < 5) {
            const randomUsers = await prisma.user.findMany({
                where: {
                    id: { not: userId },
                    // Exclude already added friends
                    AND: {
                        id: { notIn: friends.map(f => f.id) }
                    },
                    // Filter by query if exists
                    ...(query ? { username: { contains: query, mode: 'insensitive' } } : {})
                },
                take: 5,
                select: { id: true, username: true, avatar: true }
            });

            friends = [...friends, ...randomUsers];
        }

        // Limit results
        return NextResponse.json({ users: friends.slice(0, 10) });

    } catch (error) {
        console.error('Suggestions error:', error);
        return NextResponse.json({ users: [] }, { status: 500 });
    }
}
