import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req) {
    try {
        const session = await getSession();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch valid books
        const allBooks = await prisma.book.findMany({
            select: { id: true, title: true, author: true }
        });

        // Group by normalized "title|author"
        const grouped = {};
        allBooks.forEach(book => {
            const key = `${book.title.toLowerCase().trim()}|${book.author.toLowerCase().trim()}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(book);
        });

        const duplicates = [];
        let totalDupes = 0;

        for (const key in grouped) {
            if (grouped[key].length > 1) {
                totalDupes += (grouped[key].length - 1);
                duplicates.push({
                    key: key,
                    count: grouped[key].length,
                    ids: grouped[key].map(b => b.id),
                    title: grouped[key][0].title,
                    author: grouped[key][0].author
                });
            }
        }

        return NextResponse.json({
            success: true,
            totalDuplicates: totalDupes,
            groups: duplicates
        });

    } catch (error) {
        console.error('Duplicate Check Error:', error);
        return NextResponse.json({ success: false, error: 'Check failed' }, { status: 500 });
    }
}
