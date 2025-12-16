import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request, props) {
    const params = await props.params;
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const collectionId = parseInt(params.id);
        const body = await request.json();
        const { name, description, image } = body;

        // Verify ownership
        const collection = await prisma.collection.findUnique({
            where: { id: collectionId }
        });

        if (!collection) {
            return NextResponse.json({ success: false, error: 'Collection not found' }, { status: 404 });
        }

        if (collection.userId !== session.user.id) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        // Update
        const updated = await prisma.collection.update({
            where: { id: collectionId },
            data: {
                name,
                description,
                image
            }
        });

        return NextResponse.json({ success: true, collection: updated });

    } catch (error) {
        console.error('Update collection error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
