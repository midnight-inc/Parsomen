import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request) {
    try {
        // Rate limiting
        const rateLimitError = await checkRateLimit(request, 'standard');
        if (rateLimitError) return rateLimitError;

        const session = await getSession();
        const body = await request.json();
        const { name, email, subject, message } = body;

        // Validation
        if (!name || !email || !subject || !message) {
            return NextResponse.json({ success: false, error: 'Tüm alanları doldurunuz.' }, { status: 400 });
        }

        // Save to DB (Using ContactMessage model)
        await prisma.contactMessage.create({
            data: {
                userId: session?.user?.id || null, // Optional link to user
                name,
                email,
                subject,
                message,
                status: 'PENDING'
            }
        });

        return NextResponse.json({ success: true, message: 'Mesajınız alındı!' });

    } catch (error) {
        console.error('Support error:', error);
        return NextResponse.json({ success: false, error: 'Bir hata oluştu.' }, { status: 500 });
    }
}
