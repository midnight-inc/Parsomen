import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // 1. Fetch all library entries with book details
        const libraryEntries = await prisma.libraryEntry.findMany({
            where: { userId },
            include: {
                book: {
                    include: { category: true }
                }
            }
        });

        // 2. Calculate basic counts
        const completedBooks = libraryEntries.filter(e => e.status === 'READ').length;
        const readingBooks = libraryEntries.filter(e => e.status === 'READING').length;
        const wantToReadBooks = libraryEntries.filter(e => e.status === 'WANT_TO_READ').length;

        // 3. Calculate total pages (from completed books)
        const totalPages = libraryEntries
            .filter(e => e.status === 'READ')
            .reduce((acc, curr) => acc + (curr.book.pages || 0), 0);

        // 4. Estimate Reading Time (Average 2 mins per page)
        // Alternatively, use detailed logs if available, but page count is a good proxy.
        const totalReadTimeMinutes = totalPages * 2;
        const totalReadTimeHours = Math.floor(totalReadTimeMinutes / 60);

        // 5. Calculate Top Authors
        const authorCounts = {};
        libraryEntries
            .filter(e => e.status === 'READ')
            .forEach(e => {
                const author = e.book.author;
                authorCounts[author] = (authorCounts[author] || 0) + 1;
            });

        const topAuthors = Object.entries(authorCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // 6. Calculate Genre Distribution
        const genreCounts = {};
        const readEntries = libraryEntries.filter(e => e.status === 'READ');
        const totalRead = readEntries.length;

        readEntries.forEach(e => {
            const genre = e.book.category.name;
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });

        const genreDistribution = Object.entries(genreCounts)
            .map(([name, count]) => ({
                name,
                percentage: totalRead > 0 ? Math.round((count / totalRead) * 100) : 0
            }))
            .sort((a, b) => b.percentage - a.percentage)
            .slice(0, 5);

        // 7. Calculate Streak (Consecutive days with activity)
        // We look at UserActivity to find consecutive days
        const activities = await prisma.userActivity.findMany({
            where: { userId },
            select: { createdAt: true },
            orderBy: { createdAt: 'desc' },
            distinct: ['createdAt'] // Needs date truncation in SQL usually, but distinct purely on datetime won't work well
            // Simplification: Fetch last 30 days activities and process in JS
        });

        // Helper to check streak in JS
        let streak = 0;
        if (activities.length > 0) {
            // Get unique dates (YYYY-MM-DD)
            const dates = new Set(activities.map(a => new Date(a.createdAt).toISOString().split('T')[0]));
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

            // If active today or yesterday, streak is alive
            let currentDate = dates.has(today) ? today : (dates.has(yesterday) ? yesterday : null);

            if (currentDate) {
                streak = 1;
                while (true) {
                    const d = new Date(currentDate);
                    d.setDate(d.getDate() - 1);
                    const prevDate = d.toISOString().split('T')[0];
                    if (dates.has(prevDate)) {
                        streak++;
                        currentDate = prevDate;
                    } else {
                        break;
                    }
                }
            }
        }

        // Also update user's streak field in DB if it differs significantly (optional sync)

        return NextResponse.json({
            success: true,
            stats: {
                completedBooks,
                readingBooks,
                wantToReadBooks,
                totalPages,
                totalReadTimeHours,
                totalReadTimeMinutes: totalReadTimeMinutes % 60,
                streak,
                topAuthors,
                genreDistribution
            }
        });

    } catch (error) {
        console.error('Stats API Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
