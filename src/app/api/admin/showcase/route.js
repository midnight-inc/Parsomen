import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
    const session = await getSession();
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const settings = await prisma.systemSetting.findMany({
            where: {
                key: { in: ['hero_title', 'hero_description', 'hero_bookId'] }
            }
        });

        // Convert array to object
        const data = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(request) {
    const session = await getSession();
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, description, bookId } = body;

        // Upsert all fields
        const updates = [
            prisma.systemSetting.upsert({
                where: { key: 'hero_title' },
                update: { value: title },
                create: { key: 'hero_title', value: title, description: 'Showcase Hero Title' }
            }),
            prisma.systemSetting.upsert({
                where: { key: 'hero_description' },
                update: { value: description },
                create: { key: 'hero_description', value: description, description: 'Showcase Hero Description' }
            }),
            prisma.systemSetting.upsert({
                where: { key: 'hero_bookId' },
                update: { value: bookId },
                create: { key: 'hero_bookId', value: bookId, description: 'Showcase Hero Book ID' }
            })
        ];

        await prisma.$transaction(updates);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
