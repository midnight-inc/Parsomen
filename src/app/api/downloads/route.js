import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const json = await request.json();
        const { bookId, userId } = json;

        if (!userId || !bookId) {
            return NextResponse.json({ error: 'Eksik bilgi.' }, { status: 400 });
        }

        // Check if already downloaded
        const existing = await prisma.userDownload.findFirst({
            where: {
                userId: parseInt(userId),
                bookId: parseInt(bookId)
            }
        });

        if (existing) {
            // Update timestamp maybe? Or just return success
            return NextResponse.json({ success: true, message: 'Zaten indirilmiş.' });
        }

        const download = await prisma.userDownload.create({
            data: {
                userId: parseInt(userId),
                bookId: parseInt(bookId)
            }
        });

        return NextResponse.json({ success: true, download });
    } catch (error) {
        console.error('Download track error:', error);
        return NextResponse.json({ error: 'İndirme işlemi kaydedilemedi.' }, { status: 500 });
    }
}
