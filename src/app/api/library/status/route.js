import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateQuestProgress, awardBadge, isMarathonActive } from '@/lib/gamification';

export async function POST(req) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { bookId, status } = await req.json();

        if (!bookId || !status) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // Validate Status
        const validStatuses = ['WANT_TO_READ', 'READING', 'READ', 'DROPPED'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
        }

        const userId = session.user.id;

        // 1. Update Library Entry
        const updatedEntry = await prisma.libraryEntry.update({
            where: {
                userId_bookId: {
                    userId,
                    bookId: parseInt(bookId)
                }
            },
            data: {
                status,
                // If completed, set progress to max (optional, but good UX)
                // We'll leave progress logic for separate update if needed, but for 'READ' status checking page count might be nice.
                // For now just status.
            }
        });

        // 2. Create User Activity Log
        // Define activity type based on status
        let activityType = 'LIBRARY_UPDATE';
        if (status === 'READING') activityType = 'STARTED_READING';
        else if (status === 'READ') activityType = 'FINISHED_READING';
        else if (status === 'WANT_TO_READ') activityType = 'WANT_TO_READ';

        // Check recent activity to avoid spamming logs (e.g. user toggles status 5 times in 1 min)
        const recentActivity = await prisma.userActivity.findFirst({
            where: {
                userId,
                type: activityType,
                targetId: parseInt(bookId),
                createdAt: {
                    gte: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes
                }
            }
        });

        let earnedXP = 0;
        let bonusMessage = '';

        if (status === 'READ' && !recentActivity) {
            // Base XP for finishing a book
            earnedXP += 50;
            bonusMessage = 'Kitabı bitirdin! +50 XP';

            // Fetch Book Details and User's Read History
            const currentBook = await prisma.book.findUnique({
                where: { id: parseInt(bookId) },
                include: { category: true }
            });

            const readHistory = await prisma.libraryEntry.findMany({
                where: {
                    userId,
                    status: 'READ',
                    bookId: { not: parseInt(bookId) } // Exclude current
                },
                take: 10,
                orderBy: { addedAt: 'desc' },
                include: { book: { include: { category: true } } }
            });

            // Check Streak (Same Author)
            const sameAuthorBooks = readHistory.filter(e => e.book.author === currentBook.author);
            if (sameAuthorBooks.length >= 2) {
                earnedXP += 100;
                bonusMessage += ' | Yazar Serisi Bonusu! +100 XP';
            }

            // Check Streak (Same Category)
            const sameCategoryBooks = readHistory.filter(e => e.book.category.id === currentBook.category.id);
            if (sameCategoryBooks.length >= 2) {
                earnedXP += 50;
                bonusMessage += ' | Tür Uzmanı Bonusu! +50 XP';
            }

            // Marathon Multiplier
            if (isMarathonActive()) {
                earnedXP *= 2;
            }

            // Award XP
            if (earnedXP > 0) {
                await prisma.user.update({
                    where: { id: userId },
                    data: { xp: { increment: earnedXP } }
                });
            }

            // TRIGGER QUEST: READ_PAGES
            const pages = currentBook.pages || 200; // Default if missing
            await updateQuestProgress(userId, 'READ_PAGES', pages);

            // DUEL CHECK
            const activeDuel = await prisma.duel.findFirst({
                where: {
                    bookId: parseInt(bookId),
                    status: 'ACTIVE',
                    OR: [{ challengerId: userId }, { opponentId: userId }],
                    winnerId: null
                }
            });

            if (activeDuel) {
                // User wins!
                await prisma.duel.update({
                    where: { id: activeDuel.id },
                    data: {
                        status: 'COMPLETED',
                        winnerId: userId
                    }
                });

                // Award XP to Winner
                earnedXP += 300;
                bonusMessage += ' | Düello Zaferi! +300 XP';

                // Give consolation XP to loser? Maybe later.

                // Notification
                const loserId = activeDuel.challengerId === userId ? activeDuel.opponentId : activeDuel.challengerId;
                await prisma.notification.create({
                    data: {
                        userId: loserId,
                        type: 'DUEL_LOST',
                        title: 'Düelloyu Kaybettin',
                        message: `${session.user.username} kitabı bitirdi ve kazandı.`,
                        link: '/profile/me/duels'
                    }
                });
            }

            // READING GOAL UPDATE
            const currentYear = new Date().getFullYear();
            try {
                // Using updateMany since finding by userId_year unique constraint directly is safer but findFirst works too if unique
                const goal = await prisma.readingGoal.findFirst({
                    where: { userId, year: currentYear }
                });

                if (goal) {
                    await prisma.readingGoal.update({
                        where: { id: goal.id },
                        data: { current: { increment: 1 } }
                    });
                }
            } catch (e) { console.error('Goal update error', e); }

            // BADGE CHECK: Genre Explorer (Tür Kaşifi)
            if (currentBook.category) {
                const categoryCount = await prisma.libraryEntry.count({
                    where: {
                        userId: userId,
                        status: 'READ',
                        book: { categoryId: currentBook.categoryId }
                    }
                });
                // If this is the FIRST book of this category read by user
                if (categoryCount === 1) {
                    await awardBadge(userId, 'Tür Kaşifi');
                }
            }
        }

        if (!recentActivity) {
            await prisma.userActivity.create({
                data: {
                    userId,
                    type: activityType,
                    targetId: parseInt(bookId)
                }
            });
        }

        return NextResponse.json({ success: true, entry: updatedEntry, earnedXP, bonusMessage });

    } catch (error) {
        console.error('Library status update error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
