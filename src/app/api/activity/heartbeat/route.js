import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { bookId, userId } = body;

        console.log("Heartbeat received:", { bookId, userId });

        if (!userId || !bookId) {
            return NextResponse.json({ success: false, error: 'Missing userId or bookId' });
        }

        // Update the lastReadAt timestamp for the existing reading progress
        // using updateMany to avoid error if record doesn't exist (though it should for a reader)
        // or we can use upsert if we want to be safe, but ViewTracker usually presumes progress exists.
        // Let's use updateMany for safety against "record not found" impacting flow, 
        // or upsert to ensure it exists. Upsert is better logic.

        await prisma.readingProgress.upsert({
            where: {
                userId_bookId: {
                    userId: parseInt(userId),
                    bookId: parseInt(bookId)
                }
            },
            update: {
                lastReadAt: new Date()
            },
            create: {
                userId: parseInt(userId),
                bookId: parseInt(bookId),
                lastReadAt: new Date(),
                currentPage: 1
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Heartbeat error:", error);
        return NextResponse.json({ success: false, error: error.message });
    }
}
