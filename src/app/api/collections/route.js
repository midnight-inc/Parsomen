import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const collections = await prisma.collection.findMany({
            where: { userId: session.user.id },
            include: { _count: { select: { books: true } } },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(collections);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
    }
}

export async function POST(req) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { name } = await req.json();
        const collection = await prisma.collection.create({
            data: {
                name,
                userId: session.user.id
            }
        });
        return NextResponse.json(collection);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 });
    }
}
