import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight

    try {
        // Check if already claimed today
        const existingLog = await prisma.userLoginLog.findUnique({
            where: {
                userId_loginDate: {
                    userId: session.user.id,
                    loginDate: today
                }
            }
        });

        if (existingLog) {
            return NextResponse.json({ success: false, message: 'Already claimed', claimed: true });
        }

        // Create log
        await prisma.userLoginLog.create({
            data: {
                userId: session.user.id,
                loginDate: today
            }
        });

        // Award XP and Streak Logic
        // 1. Get user to check current streak
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        // 2. Check if yesterday was logged to maintain streak
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const yesterdayLog = await prisma.userLoginLog.findUnique({
            where: {
                userId_loginDate: {
                    userId: session.user.id,
                    loginDate: yesterday
                }
            }
        });

        let newStreak = 1;
        let xpBonus = 50;
        let pointsBonus = 10;

        if (yesterdayLog) {
            newStreak = (user.streak || 0) + 1;
            // Progressive bonus
            if (newStreak >= 7) { xpBonus = 150; pointsBonus = 30; }
            if (newStreak >= 30) { xpBonus = 500; pointsBonus = 100; }
        }

        // Update User
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                streak: newStreak,
                xp: { increment: xpBonus },
                points: { increment: pointsBonus }
            }
        });

        return NextResponse.json({
            success: true,
            claimed: false, // Was not previously claimed, so this is a new claim
            streak: newStreak,
            xpEarned: xpBonus,
            pointsEarned: pointsBonus
        });

    } catch (error) {
        console.error('Daily Login Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
