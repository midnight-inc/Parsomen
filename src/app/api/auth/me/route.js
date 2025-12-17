import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getSession();

    if (!session?.user?.email) {
        return NextResponse.json({ user: null });
    }

    // Fetch fresh data from DB to ensure role/level/points is up to date
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            role: true,
            level: true,
            xp: true,
            points: true,
            font: true,
            theme: true,
            id: true,
            username: true,
            email: true,
            avatar: true,
            role: true,
            level: true,
            xp: true,
            points: true,
            font: true,
            theme: true,
            inventory: {
                where: {
                    equipped: true,
                    item: { type: 'FRAME' }
                },
                include: {
                    item: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            rarity: true
                        }
                    }
                }
            }
            // Removed badges & reviews to optimize initial load
        }
    });

    return NextResponse.json({ user });
}
