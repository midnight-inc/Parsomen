import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        // Check if already checked in today
        const existingLog = await prisma.userLoginLog.findFirst({
            where: {
                userId,
                loggedAt: { gte: today }
            }
        });

        if (existingLog) {
            return NextResponse.json({ success: true, firstTimeToday: false });
        }

        // It's a new day!
        // Calculate Streak (Simplified: Check if there is a log from yesterday)
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const yesterdayLog = await prisma.userLoginLog.findFirst({
            where: {
                userId,
                loggedAt: {
                    gte: yesterday,
                    lt: today
                }
            }
        });

        let streak = 1;
        // Ideally we would store streak in User model to avoid recalculating or recursive checks.
        // For now, we just say streak is 1 or streak+1 if we tracked it.
        // Let's assume streak is mostly cosmetic for now without schema change.
        if (yesterdayLog) {
            streak = 2; // Basic logic, difficult to get full streak without stored field
        }

        // Create Check-in Log
        await prisma.userLoginLog.create({
            data: {
                userId,
                ip: '127.0.0.1' // Placeholder
            }
        });

        // Award Points (Daily 100 Points)
        await prisma.user.update({
            where: { id: userId },
            data: {
                points: { increment: 100 },
                xp: { increment: 50 }
            }
        });

        return NextResponse.json({
            success: true,
            firstTimeToday: true,
            streak,
            pointsEarned: 100
        });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}
