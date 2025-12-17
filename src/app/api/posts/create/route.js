import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request) {
    // 1. Authentication Check
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Rate Limiting (Prevent spam)
    const rateLimitError = await checkRateLimit(request, 'heavy'); // 10 posts per minute
    if (rateLimitError) return rateLimitError;

    try {
        const body = await request.json();
        const { content, image, bookId, song } = body;

        // 3. Validation
        // Content length
        if (content && content.length > 1000) {
            return NextResponse.json({ success: false, error: 'Gönderi çok uzun (max 1000 karakter).' }, { status: 400 });
        }

        // Required fields
        if (!content && !image && !bookId && !song) {
            return NextResponse.json({ success: false, error: 'Boş gönderi paylaşılamaz.' }, { status: 400 });
        }

        const post = await prisma.post.create({
            data: {
                userId: session.user.id,
                content,
                image,
                bookId: bookId ? parseInt(bookId) : null,
                song: song ? JSON.stringify(song) : null
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                },
                book: true
            }
        });

        // Process Mentions
        try {
            const { processMentionsWithSenderName } = await import('@/lib/mentions');
            await processMentionsWithSenderName(
                content,
                session.user.id,
                session.user.username,
                post.id,
                'POST',
                `/posts/${post.id}` // Link to post
            );
        } catch (mentionError) {
            console.error('Mention error:', mentionError);
            // Mentions shouldn't fail the request
        }

        return NextResponse.json({ success: true, post });

    } catch (error) {
        console.error('Create post error:', error);
        return NextResponse.json({ success: false, error: 'Failed to create post' }, { status: 500 });
    }
}
