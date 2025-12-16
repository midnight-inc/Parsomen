import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';

export async function POST(request) {
    try {
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
        const { name, isPublic } = body;

        const collection = await prisma.collection.create({
            data: {
                name,
                userId,
                isPublic: isPublic || false
            }
        });

        return NextResponse.json({ success: true, collection });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to create collection' }, { status: 500 });
    }
}
