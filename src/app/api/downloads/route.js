import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function POST(request) {
    // SECURITY: Use session instead of client-provided userId
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const json = await request.json();
        const { bookId } = json;
        const userId = session.user.id; // Use session userId, not client-provided

        if (!bookId) {
            return NextResponse.json({ error: 'Kitap ID gerekli.' }, { status: 400 });
        }

        // Check if already downloaded
        const existing = await prisma.userDownload.findFirst({
            where: {
                userId: userId,
                bookId: parseInt(bookId)
            }
        });

        if (existing) {
            // Update timestamp maybe? Or just return success
            return NextResponse.json({ success: true, message: 'Zaten indirilmiş.' });
        }

        const download = await prisma.userDownload.create({
            data: {
                userId: userId,
                bookId: parseInt(bookId)
            }
        });

        return NextResponse.json({ success: true, download });
    } catch (error) {
        console.error('Download track error:', error);
        return NextResponse.json({ error: 'İndirme işlemi kaydedilemedi.' }, { status: 500 });
    }
}
