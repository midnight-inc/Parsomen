import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get('session')?.value;

        if (!sessionToken) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const session = await decrypt(sessionToken);
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await request.json();
        const { name, image, description, isPublic } = body;

        // Verify ownership
        const collection = await prisma.collection.findUnique({
            where: { id: parseInt(id) }
        });

        if (!collection) {
            return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
        }

        if (collection.userId !== userId) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        // Strictly prevent editing Favoriler
        if (collection.name === 'Favoriler') {
            return NextResponse.json({ success: false, error: 'Favoriler koleksiyonu düzenlenemez' }, { status: 400 });
        }

        const updated = await prisma.collection.update({
            where: { id: parseInt(id) },
            data: {
                name,
                image,
                description,
                isPublic
            }
        });

        return NextResponse.json({ success: true, collection: updated });

    } catch (error) {
        console.error('Edit collection error:', error);
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}
