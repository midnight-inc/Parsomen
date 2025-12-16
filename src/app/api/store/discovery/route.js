import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        // In a real app, this would exclude books the user has already read
        // For now, get 10 random books
        // Prisma doesn't support RAND() natively easily in cross-db way, so we'll take a sample
        // A simple way for small DBs: fetch widely and pick random

        const count = await prisma.book.count();
        const take = 10;

        // Random offset
        const skip = Math.max(0, Math.floor(Math.random() * (count - take)));

        const books = await prisma.book.findMany({
            take: take,
            skip: skip,
            select: {
                id: true,
                title: true,
                author: true,
                cover: true,
                description: true, // We need description for the queue card
                category: true,
                rating: true
            }
        });

        // If we have fewer than 10 (e.g. new db), just return what we have
        // Shuffle the array to be sure
        const shuffled = books.sort(() => 0.5 - Math.random());

        return NextResponse.json({ success: true, queue: shuffled });
    } catch (error) {
        console.error('Discovery queue error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
