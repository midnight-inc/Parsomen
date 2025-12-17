import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isMarathonActive } from '@/lib/gamification';

// Database driven questions now

export async function GET(req) {
    // Get questions seeded by date
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // Simple pseudo-random generator seeded by date string
    let seed = 0;
    for (let i = 0; i < today.length; i++) seed += today.charCodeAt(i);

    // Fetch all questions count to know range
    const count = await prisma.triviaQuestion.count();

    if (count === 0) return NextResponse.json({ success: false, questions: [] });

    const dailyQuestions = [];
    const usedIndices = new Set();

    // Pick 3 random questions deterministically based on date
    for (let i = 0; i < 3; i++) {
        // Pseudo random index
        const index = (seed + i * 17) % count;

        let attempts = 0;
        let finalIndex = index;

        // Avoid duplicates in the same day (naive, but works for db fetch)
        while (usedIndices.has(finalIndex) && attempts < 10) {
            finalIndex = (finalIndex + 1) % count;
            attempts++;
        }
        usedIndices.add(finalIndex);

        const question = await prisma.triviaQuestion.findFirst({
            skip: finalIndex,
            take: 1
        });

        if (question) dailyQuestions.push(question);
    }

    // Check if user played today
    let played = false;
    let playedData = null;

    const session = await getSession();
    if (session) {
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

        const existingLog = await prisma.userActivity.findFirst({
            where: {
                userId: session.user.id,
                type: 'TRIVIA_PLAYED',
                createdAt: { gte: todayDate }
            }
        });

        if (existingLog) {
            played = true;
            playedData = existingLog;
        }
    }

    // Hide correct answer from client
    const clientQuestions = dailyQuestions.map(q => ({
        id: q.id,
        text: q.question,
        options: q.options
    }));

    return NextResponse.json({ success: true, questions: clientQuestions, played, playedData });
}

export async function POST(req) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { answers } = await req.json(); // Object { questionId: selectedIndex }

        let correctCount = 0;
        let earnedXP = 0;

        // Verify answers
        // Optimization: Fetch all answered questions at once
        const questionIds = Object.keys(answers);
        const dbQuestions = await prisma.triviaQuestion.findMany({
            where: { id: { in: questionIds } }
        });

        questionIds.forEach(qId => {
            const question = dbQuestions.find(q => q.id === qId);
            if (question && question.correctIndex === answers[qId]) {
                correctCount++;
            }
        });

        // Calculate Reward
        earnedXP = correctCount * 50; // 50 XP per correct answer
        if (correctCount === 3) earnedXP += 100; // Bonus for perfect score

        if (isMarathonActive()) earnedXP *= 2;

        // Check if already played today (prevent farming)
        // For now, allow farming for testing, or add DB check later.
        // Let's add DB check.
        // Check if already played today (prevent farming)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingLog = await prisma.userActivity.findFirst({
            where: {
                userId: session.user.id,
                type: 'TRIVIA_PLAYED',
                createdAt: { gte: today }
            }
        });

        if (existingLog) {
            return NextResponse.json({ success: false, message: 'Bugünlük hakkını doldurdun!' });
        }

        if (earnedXP > 0) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    xp: { increment: earnedXP },
                    activities: {
                        create: {
                            type: 'TRIVIA_PLAYED',
                            targetId: earnedXP // Storing XP logic in targetId for simple log
                        }
                    }
                }
            });
        } else {
            // Log attempt even if 0 XP
            await prisma.userActivity.create({
                data: {
                    userId: session.user.id,
                    type: 'TRIVIA_PLAYED',
                    targetId: 0
                }
            });
        }

        return NextResponse.json({
            success: true,
            correctCount,
            earnedXP,
            results: Object.keys(answers).map(qId => {
                const q = dbQuestions.find(x => x.id === qId); // ID is string now
                return { id: qId, correctIndex: q ? q.correctIndex : 0 };
            })
        });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
