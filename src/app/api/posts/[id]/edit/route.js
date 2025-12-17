import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request, { params }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const postId = parseInt(id);
        const { content } = await request.json();

        // Get post
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

        // Check ownership
        if (post.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Update
        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: { content: content, updatedAt: new Date() }
        });

        return NextResponse.json({ success: true, post: updatedPost });
    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
