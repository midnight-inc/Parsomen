import { prisma } from '@/lib/prisma';

export async function updateQuestProgress(userId, type, amount = 1) {
    try {
        const now = new Date();

        // 1. Find Active Quests of this Type
        const activeQuests = await prisma.quest.findMany({
            where: {
                type: type,
                isActive: true,
                startDate: { lte: now },
                endDate: { gte: now }
            }
        });

        if (activeQuests.length === 0) return;

        // 2. Update Progress for each active quest
        for (const quest of activeQuests) {
            // Find existing progress or create
            const userQuest = await prisma.userQuest.findUnique({
                where: {
                    userId_questId: {
                        userId: userId,
                        questId: quest.id
                    }
                }
            });

            if (userQuest) {
                // If already completed, skip
                if (userQuest.completed) continue;

                const newProgress = userQuest.progress + amount;
                const completed = newProgress >= quest.target;

                await prisma.userQuest.update({
                    where: { id: userQuest.id },
                    data: {
                        progress: newProgress,
                        completed: completed
                    }
                });
            } else {
                // First time progress
                const completed = amount >= quest.target;
                await prisma.userQuest.create({
                    data: {
                        userId,
                        questId: quest.id,
                        progress: amount,
                        completed
                    }
                });
            }
        }
    } catch (error) {
        console.error("Quest Update Error:", error);
    }
}


export async function awardBadge(userId, badgeName) {
    try {
        const badge = await prisma.badge.findFirst({ where: { name: badgeName } });
        if (!badge) return false;

        // Check if already owned
        const existing = await prisma.userBadge.findUnique({
            where: {
                userId_badgeId: {
                    userId,
                    badgeId: badge.id
                }
            }
        });
        if (existing) return false;

        // Award badge
        await prisma.userBadge.create({
            data: {
                userId,
                badgeId: badge.id
            }
        });

        // Add Notification
        await prisma.notification.create({
            data: {
                userId,
                type: 'BADGE_EARNED',
                title: 'Yeni Rozet Kazandın!',
                message: `Tebrikler! "${badge.name}" rozetini açtın.`,
                link: `/profile/me/badges` // Assuming profile/me/badges redirects or handles username
            }
        });

        // Activity Log
        await prisma.userActivity.create({
            data: {
                userId,
                type: 'BADGE_EARNED',
                targetId: badge.id
            }
        });

        return true;
    } catch (e) {
        console.error("Award Badge Error:", e);
        return false;
    }
}

export function isMarathonActive() {
    // Marathon hours: 20:00 - 21:00 (Server Time for now, assuming UTC/Local aligned or close enough)
    // To be precise for TR users (UTC+3), if server is UTC, 20:00 TR = 17:00 UTC.
    // Let's assume server time usage for simplicity or check both.
    // For demo purposes, we can hardcode logic or make it always active if configured.

    // TR Time Logic (UTC+3)
    const now = new Date();
    const utcHours = now.getUTCHours();
    const trHours = (utcHours + 3) % 24;

    return trHours === 20; // 20:00 - 20:59
}
