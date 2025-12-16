import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';

// GET - Get user stats from real database
export async function GET(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = await decrypt(token);
        if (!session?.userId) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }

        const userId = session.userId;

        // Get reading progress stats
        const readingProgress = await prisma.readingProgress.findMany({
            where: { userId },
            include: { book: { include: { category: true } } }
        });

        // Calculate total read time
        const totalReadTimeSeconds = readingProgress.reduce((sum, p) => sum + (p.totalReadTime || 0), 0);
        const totalReadTimeMinutes = Math.round(totalReadTimeSeconds / 60);
        const totalReadTimeHours = Math.floor(totalReadTimeMinutes / 60);

        // Get completed books (100% or from LibraryEntry)
        const libraryEntries = await prisma.libraryEntry.findMany({
            where: { userId },
            include: { book: { include: { category: true } } }
        });

        const completedBooks = libraryEntries.filter(e => e.status === 'READ').length;
        const readingBooks = libraryEntries.filter(e => e.status === 'READING').length;
        const wantToReadBooks = libraryEntries.filter(e => e.status === 'WANT_TO_READ').length;

        // Get total pages read
        const totalPages = readingProgress.reduce((sum, p) => sum + (p.currentPage || 0), 0);

        // Get user for streak
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { streak: true, level: true, xp: true }
        });

        // Get top authors
        const authorCounts = {};
        libraryEntries.forEach(entry => {
            const author = entry.book.author;
            authorCounts[author] = (authorCounts[author] || 0) + 1;
        });

        const topAuthors = Object.entries(authorCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));

        // Get genre distribution
        const genreCounts = {};
        libraryEntries.forEach(entry => {
            const genre = entry.book.category?.name || 'Genel';
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });

        const totalGenreBooks = Object.values(genreCounts).reduce((a, b) => a + b, 0);
        const genreDistribution = Object.entries(genreCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({
                name,
                count,
                percentage: totalGenreBooks > 0 ? Math.round((count / totalGenreBooks) * 100) : 0
            }));

        // Get reviews count
        const reviewsCount = await prisma.review.count({ where: { userId } });

        return NextResponse.json({
            success: true,
            stats: {
                totalReadTimeSeconds,
                totalReadTimeMinutes,
                totalReadTimeHours,
                totalPages,
                completedBooks,
                readingBooks,
                wantToReadBooks,
                totalBooks: libraryEntries.length,
                streak: user?.streak || 0,
                level: user?.level || 1,
                xp: user?.xp || 0,
                reviewsCount,
                topAuthors,
                genreDistribution
            }
        });
    } catch (error) {
        console.error('Stats fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
