import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { content, image, bookId, song } = body;

        // Validation: Content or Image or Book or Song required
        if (!content && !image && !bookId && !song) {
            return NextResponse.json({ success: false, error: 'Empty post' }, { status: 400 });
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

        return NextResponse.json({ success: true, post });

    } catch (error) {
        console.error('Create post error:', error);
        return NextResponse.json({ success: false, error: 'Failed to create post' }, { status: 500 });
    }
}
