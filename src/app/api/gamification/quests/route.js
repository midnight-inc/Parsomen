import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const now = new Date();

    // Find active quests
    let quests = await prisma.quest.findMany({
        where: {
            startDate: { lte: now },
            endDate: { gte: now },
            isActive: true
        }
    });

    // If no quests, seed some for this week (Simple Logic for Demo)
    if (quests.length === 0) {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);

        await prisma.quest.createMany({
            data: [
                {
                    title: "Haftanın Okuru",
                    description: "Bu hafta 50 sayfa kitap oku.",
                    xpReward: 100,
                    type: "READ_PAGES",
                    target: 50,
                    startDate: now,
                    endDate: nextWeek
                },
                {
                    title: "Eleştirmen",
                    description: "Bir kitaba detaylı inceleme yaz.",
                    xpReward: 150,
                    type: "WRITE_REVIEW",
                    target: 1,
                    startDate: now,
                    endDate: nextWeek
                },
                {
                    title: "Sosyal Kelebek",
                    description: "Yeni bir arkadaş edin.",
                    xpReward: 75,
                    type: "ADD_FRIEND",
                    target: 1,
                    startDate: now,
                    endDate: nextWeek
                }
            ]
        });

        quests = await prisma.quest.findMany({
            where: { isActive: true } // Re-fetch
        });
    }

    // Get user progress
    const userProgress = await prisma.userQuest.findMany({
        where: {
            userId: session.user.id,
            questId: { in: quests.map(q => q.id) }
        }
    });

    // Merge
    const result = quests.map(q => {
        const prog = userProgress.find(up => up.questId === q.id);
        return {
            ...q,
            progress: prog ? prog.progress : 0,
            completed: prog ? prog.completed : false,
            claimed: prog ? prog.claimed : false
        };
    });

    return NextResponse.json({ success: true, quests: result });
}

export async function POST(req) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { questId } = await req.json();

    const userQuest = await prisma.userQuest.findUnique({
        where: {
            userId_questId: {
                userId: session.user.id,
                questId: questId
            }
        },
        include: { quest: true }
    });

    if (!userQuest || !userQuest.completed || userQuest.claimed) {
        return NextResponse.json({ success: false, message: 'Ödül alınamaz.' });
    }

    // Award XP
    await prisma.$transaction([
        prisma.user.update({
            where: { id: session.user.id },
            data: { xp: { increment: userQuest.quest.xpReward } }
        }),
        prisma.userQuest.update({
            where: { id: userQuest.id },
            data: { claimed: true }
        })
    ]);

    return NextResponse.json({ success: true, xp: userQuest.quest.xpReward });
}
