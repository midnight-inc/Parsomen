import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        const session = await getSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { font, theme, currentPassword, newPassword } = body;

        // Password change flow
        if (currentPassword && newPassword) {
            // Verify current password
            const user = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { password: true }
            });

            if (!user) {
                return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
            }

            const isValid = await bcrypt.compare(currentPassword, user.password);
            if (!isValid) {
                return NextResponse.json({ error: 'Mevcut şifre yanlış' }, { status: 400 });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await prisma.user.update({
                where: { email: session.user.email },
                data: { password: hashedPassword }
            });

            return NextResponse.json({ success: true, message: 'Şifre güncellendi' });
        }

        // Theme/font update flow
        if (font || theme) {
            const updateData = {};
            if (font) updateData.font = font;
            if (theme) updateData.theme = theme;

            await prisma.user.update({
                where: { email: session.user.email },
                data: updateData
            });

            return NextResponse.json({ success: true, message: 'Ayarlar güncellendi' });
        }

        return NextResponse.json({ error: 'Güncellenecek veri yok' }, { status: 400 });

    } catch (error) {
        console.error('Settings update error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
