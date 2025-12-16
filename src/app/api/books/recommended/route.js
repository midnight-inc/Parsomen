import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log("API: Fetching recommended books...");
        // Fetch 10 random books or just latest for now
        // Prisma doesn't support RANDOM natively easily in all SQLs without raw query.
        // We'll take latest 10 updated books.
        const books = await prisma.book.findMany({
            take: 10,
            orderBy: { id: 'desc' },
            select: {
                id: true,
                title: true,
                author: true,
                cover: true
            }
        });

        console.log(`API: Found ${books.length} books.`);
        return NextResponse.json({ success: true, books });
    } catch (error) {
        console.error("API Error fetching books:", error);
        return NextResponse.json({ success: false, books: [] });
    }
}
