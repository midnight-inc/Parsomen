import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request, { params }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Rate Limit
        const rateLimitError = await checkRateLimit(request, 'interaction');
        if (rateLimitError) return rateLimitError;

        const { id } = await params;
        const postId = parseInt(id);
        const { content } = await request.json();

        if (!content || !content.trim()) return NextResponse.json({ error: 'Yorum boş olamaz' }, { status: 400 });
        if (content.length > 500) return NextResponse.json({ error: 'Yorum çok uzun (max 500 karakter)' }, { status: 400 });

        // Create comment
        const comment = await prisma.comment.create({
            data: {
                content: content,
                userId: session.user.id,
                postId: postId
            },
            include: {
                user: {
                    select: { username: true }
                }
            }
        });

        // Process Mentions
        try {
            const { processMentionsWithSenderName } = await import('@/lib/mentions');
            await processMentionsWithSenderName(
                content,
                session.user.id,
                session.user.username,
                postId, // Source ID is Post ID for comments too? No, usually not needed but notification link is post.
                'COMMENT',
                `/posts/${postId}` // Link to post
            );
        } catch (mentionError) {
            console.error('Mention error:', mentionError);
        }

        // Get post to find owner
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { userId: true }
        });

        // Notify post owner (if not same user)
        if (post && post.userId !== session.user.id) {
            await prisma.notification.create({
                data: {
                    userId: post.userId,
                    type: 'COMMENT',
                    title: 'Yeni Yorum',
                    message: `${session.user.username} gönderine yorum yaptı: "${content.substring(0, 30)}..."`,
                    link: `/posts/${postId}`, // or feed?
                    fromUserId: session.user.id
                }
            });
        }

        return NextResponse.json({ success: true, comment });
    } catch (error) {
        return NextResponse.json({ error: 'Comment failed' }, { status: 500 });
    }
}
