import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PUT(request, context) {
    const session = await getSession();
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await context.params;
        const { amount } = await request.json();

        console.log(`Admin ${session.user.username} updating points for user ${id}. Amount: ${amount}`);

        // Validate amount
        const pointsToAdd = parseInt(amount);
        if (isNaN(pointsToAdd)) {
            return NextResponse.json({ error: 'Geçersiz puan miktarı' }, { status: 400 });
        }

        // Update user points
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                points: {
                    increment: pointsToAdd
                }
            },
            select: {
                id: true,
                username: true,
                points: true
            }
        });

        // Optionally create a notification
        if (pointsToAdd > 0) {
            await prisma.notification.create({
                data: {
                    userId: updatedUser.id,
                    type: 'SYSTEM',
                    title: 'Puan Yüklendi! 🪙',
                    message: `Yönetici tarafından hesabına ${pointsToAdd} puan yüklendi.`,
                    link: '/store/points-shop',
                    fromUserId: session.user.id
                }
            });
        }

        return NextResponse.json({
            success: true,
            user: updatedUser,
            message: `${updatedUser.username} adlı kullanıcıya ${pointsToAdd} puan eklendi.`
        });

    } catch (error) {
        console.error('Point update error:', error);
        return NextResponse.json({ error: 'Puan güncelleme başarısız: ' + error.message }, { status: 500 });
    }
}
