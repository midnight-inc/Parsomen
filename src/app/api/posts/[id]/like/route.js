import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request, { params }) {
    // Rate limiting
    const rateLimitError = await checkRateLimit(request, 'interaction');
    if (rateLimitError) return rateLimitError;

    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const postId = parseInt(id);
        const userId = parseInt(session.user.id);

        const existingLike = await prisma.like.findFirst({
            where: {
                postId: postId,
                userId: userId
            }
        });

        if (existingLike) {
            // Unlike
            await prisma.like.delete({
                where: {
                    id: existingLike.id
                }
            });
            return NextResponse.json({ success: true, liked: false });
        } else {
            // Like
            await prisma.like.create({
                data: {
                    postId: postId,
                    userId: userId
                }
            });
            return NextResponse.json({ success: true, liked: true });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}
