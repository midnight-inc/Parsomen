import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// POST: Hediye gönder
export async function POST(req) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { receiverId, points, cardType, message } = await req.json();
        const senderId = session.user.id;

        // Validation
        if (!receiverId || typeof receiverId !== 'number') {
            return NextResponse.json({ error: 'Geçersiz alıcı' }, { status: 400 });
        }

        if (!points || typeof points !== 'number' || points <= 0) {
            return NextResponse.json({ error: 'Geçersiz puan miktarı' }, { status: 400 });
        }

        if (points > 10000) {
            return NextResponse.json({ error: 'Maksimum 10.000 puan gönderilebilir' }, { status: 400 });
        }

        if (receiverId === senderId) {
            return NextResponse.json({ error: 'Kendinize hediye gönderemezsiniz' }, { status: 400 });
        }

        // Check sender's points
        const sender = await prisma.user.findUnique({
            where: { id: senderId },
            select: { points: true, username: true }
        });

        if (!sender || sender.points < points) {
            return NextResponse.json({ error: 'Yetersiz puan bakiyesi' }, { status: 400 });
        }

        // Check receiver exists
        const receiver = await prisma.user.findUnique({
            where: { id: receiverId },
            select: { id: true, username: true }
        });

        if (!receiver) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
        }

        // Check friendship (must be friends to send gifts)
        const friendship = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { userId: senderId, friendId: receiverId, status: 'ACCEPTED' },
                    { userId: receiverId, friendId: senderId, status: 'ACCEPTED' }
                ]
            }
        });

        if (!friendship) {
            return NextResponse.json({ error: 'Hediye göndermek için arkadaş olmalısınız' }, { status: 403 });
        }

        // Transaction: Transfer points and create gift record
        const [gift] = await prisma.$transaction([
            // Create gift record
            prisma.gift.create({
                data: {
                    senderId,
                    receiverId,
                    points,
                    cardType: cardType || 'thanks',
                    message: message?.substring(0, 200) || null
                }
            }),
            // Deduct from sender
            prisma.user.update({
                where: { id: senderId },
                data: { points: { decrement: points } }
            }),
            // Add to receiver
            prisma.user.update({
                where: { id: receiverId },
                data: { points: { increment: points } }
            })
        ]);

        return NextResponse.json({
            success: true,
            message: `${receiver.username}'a ${points} puan hediye edildi!`,
            gift
        });

    } catch (error) {
        console.error('Gift send error:', error);
        return NextResponse.json({ error: 'Hediye gönderilemedi' }, { status: 500 });
    }
}

// GET: Kullanıcının arkadaş listesini getir (hediye göndermek için)
export async function GET(req) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userId = session.user.id;

        // Get accepted friendships
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

        // Extract friends (the other person in the friendship)
        const friends = friendships.map(f => {
            if (f.userId === userId) {
                return f.friend;
            }
            return f.user;
        });

        // Get user's current points
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { points: true }
        });

        return NextResponse.json({
            success: true,
            friends,
            userPoints: user?.points || 0
        });

    } catch (error) {
        console.error('Get friends for gift error:', error);
        return NextResponse.json({ error: 'Failed to get friends' }, { status: 500 });
    }
}
