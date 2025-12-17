import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { eggId } = await req.json();

        // Check if user already claimed this specific egg
        // We can use a simple JSON field in User model or a separate table.
        // For simplicity, let's use a "claimedEggs" JSON array on User if it exists, 
        // or just check via a new GamificationLog type if we want to be strict.
        // Let's assume we use 'UserBadge' logic or just a simple log for now.
        // Actually, let's create a generic "GameLog" or use "Activity".
        // To keep it simple without schema change, we'll check if they have a 'EASTER_EGG_{ID}' badge.
        // Or better, let's just give points and not worry about duplicate clicks for now (or use cookie/localstorage for client side check + server side check).

        // Let's check recent XP logs for this action to prevent spamming
        const recentLog = await prisma.activityLog.findFirst({
            where: {
                userId: session.user.id,
                action: 'EASTER_EGG_FOUND',
                details: { contains: eggId }
            }
        });

        if (recentLog) {
            return NextResponse.json({ success: false, message: 'Bu hazineyi zaten buldun!' });
        }

        // Give Reward
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                xp: { increment: 500 },
                points: { increment: 50 },
                activityLogs: {
                    create: {
                        action: 'EASTER_EGG_FOUND',
                        details: `Gizli Hazine Bulundu: ${eggId}`
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            xp: 500,
            points: 50,
            newLevel: updatedUser.level // Context will handle level up check
        });

    } catch (error) {
        console.error("Easter egg error", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
