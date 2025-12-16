import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';

export async function DELETE(request, { params }) {
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

        if (collection.name === 'Favoriler') {
            return NextResponse.json({ success: false, error: 'Favoriler koleksiyonu silinemez' }, { status: 400 });
        }

        await prisma.collection.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Delete collection error:', error);
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}
