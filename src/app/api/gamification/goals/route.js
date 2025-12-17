import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const currentYear = new Date().getFullYear();

    try {
        const goal = await prisma.readingGoal.findFirst({
            where: {
                userId: session.user.id,
                year: currentYear
            }
        });

        // Ensure we have an accurate 'current' count by counting 'READ' books
        const booksRead = await prisma.libraryEntry.count({
            where: {
                userId: session.user.id,
                status: 'READ',
                // Ideally check if read in this year, but LibraryEntry tracks 'addedAt', 
                // ReadingProgress tracks 'lastReadAt'. For MVP we just count total READ 
                // or if we want stricter, we need a 'completedAt' field.
                // For now, let's trust the 'current' field in ReadingGoal which we update manually or via hook.
            }
        });

        // Sync if needed (optional logic, can be refined)
        // For now just return the goal
        return NextResponse.json({ success: true, goal });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(req) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { target } = body;
        const currentYear = new Date().getFullYear();

        const goal = await prisma.readingGoal.upsert({
            where: {
                userId_year: {
                    userId: session.user.id,
                    year: currentYear
                }
            },
            update: { target: parseInt(target) },
            create: {
                userId: session.user.id,
                year: currentYear,
                target: parseInt(target)
            }
        });

        return NextResponse.json({ success: true, goal });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
