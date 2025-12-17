import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(request, { params }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const postId = parseInt(id);
        const userId = parseInt(session.user.id);

        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

        if (post.userId !== userId && session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.post.delete({
            where: { id: postId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}
