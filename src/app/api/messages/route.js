import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET: Kullanıcının sohbet listesini getir
export async function GET(req) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userId = session.user.id;

        // Get unique conversations (users who we've messaged or who messaged us)
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            orderBy: { createdAt: 'desc' },
            include: {
                sender: {
                    select: { id: true, username: true, avatar: true }
                },
                receiver: {
                    select: { id: true, username: true, avatar: true }
                }
            }
        });

        // Group by conversation partner
        const conversationsMap = new Map();

        for (const msg of messages) {
            const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
            const partner = msg.senderId === userId ? msg.receiver : msg.sender;

            if (!conversationsMap.has(partnerId)) {
                conversationsMap.set(partnerId, {
                    partnerId,
                    partner,
                    lastMessage: msg,
                    unreadCount: 0
                });
            }

            // Count unread messages from this partner
            if (msg.receiverId === userId && !msg.read) {
                const conv = conversationsMap.get(partnerId);
                conv.unreadCount += 1;
            }
        }

        const conversations = Array.from(conversationsMap.values());

        return NextResponse.json({
            success: true,
            conversations
        });
    } catch (error) {
        console.error('Get conversations error:', error);
        return NextResponse.json({ error: 'Failed to get conversations' }, { status: 500 });
    }
}

// POST: Yeni mesaj gönder (metin, emoji, GIF, görsel, PDF)
export async function POST(req) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const { checkRateLimit } = await import('@/lib/rateLimit');
    const rateLimitError = await checkRateLimit(req, 'interaction');
    if (rateLimitError) return rateLimitError;

    try {
        const { receiverId, content, mediaType, mediaUrl } = await req.json();
        const senderId = session.user.id;

        // Validation
        if (!receiverId || typeof receiverId !== 'number') {
            return NextResponse.json({ error: 'Invalid receiver' }, { status: 400 });
        }

        // Must have either content or media
        if ((!content || content.trim().length === 0) && !mediaUrl) {
            return NextResponse.json({ error: 'Mesaj içeriği veya medya gerekli' }, { status: 400 });
        }

        if (content && content.length > 2000) {
            return NextResponse.json({ error: 'Mesaj çok uzun (max 2000 karakter)' }, { status: 400 });
        }

        // Validate media type
        const allowedMediaTypes = ['gif', 'image', 'pdf', 'emoji'];
        if (mediaType && !allowedMediaTypes.includes(mediaType)) {
            return NextResponse.json({ error: 'Geçersiz medya türü' }, { status: 400 });
        }

        // PDF validation - check file extension
        if (mediaType === 'pdf' && mediaUrl) {
            if (!mediaUrl.toLowerCase().endsWith('.pdf')) {
                return NextResponse.json({ error: 'Sadece PDF dosyaları yüklenebilir' }, { status: 400 });
            }
        }

        // Check receiver exists
        const receiver = await prisma.user.findUnique({
            where: { id: receiverId },
            select: { id: true, username: true }
        });

        if (!receiver) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
        }

        // Can't message yourself
        if (receiverId === senderId) {
            return NextResponse.json({ error: 'Kendinize mesaj gönderemezsiniz' }, { status: 400 });
        }

        // Get sender info for notification
        const sender = await prisma.user.findUnique({
            where: { id: senderId },
            select: { username: true }
        });

        // Create message and notification in transaction
        const [message] = await prisma.$transaction([
            // Create message
            prisma.message.create({
                data: {
                    senderId,
                    receiverId,
                    content: content?.trim() || null,
                    mediaType: mediaType || null,
                    mediaUrl: mediaUrl || null,
                    status: 'SENT'
                },
                include: {
                    sender: {
                        select: { id: true, username: true, avatar: true }
                    },
                    receiver: {
                        select: { id: true, username: true, avatar: true }
                    }
                }
            }),
            // Create notification for receiver
            prisma.notification.create({
                data: {
                    userId: receiverId,
                    type: 'MESSAGE',
                    title: 'Yeni Mesaj',
                    message: `${sender?.username || 'Birisi'} sana mesaj gönderdi`,
                    link: '/messages',
                    fromUserId: senderId
                }
            })
        ]);

        return NextResponse.json({
            success: true,
            message
        });
    } catch (error) {
        console.error('Send message error:', error);
        return NextResponse.json({ error: 'Mesaj gönderilemedi' }, { status: 500 });
    }
}
