import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const badges = await prisma.badge.findMany({
            orderBy: { id: 'asc' },
            include: {
                _count: {
                    select: { users: true }
                }
            }
        });
        return NextResponse.json(badges);
    } catch (error) {
        console.error('Failed to fetch badges:', error);
        return NextResponse.json({ error: 'Rozetler getirilemedi.' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const json = await request.json();

        const badge = await prisma.badge.create({
            data: {
                name: json.name,
                description: json.description,
                icon: json.icon,
            },
        });

        return NextResponse.json(badge);
    } catch (error) {
        console.error('Failed to create badge:', error);
        return NextResponse.json({ error: 'Rozet oluşturulamadı.' }, { status: 500 });
    }
}
