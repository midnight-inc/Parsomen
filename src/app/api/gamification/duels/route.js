import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const duels = await prisma.duel.findMany({
        where: {
            OR: [
                { challengerId: session.user.id },
                { opponentId: session.user.id }
            ]
        },
        include: {
            challenger: { select: { id: true, username: true, avatar: true } },
            opponent: { select: { id: true, username: true, avatar: true } },
            book: { select: { id: true, title: true, cover: true } },
            winner: { select: { id: true, username: true } }
        },
        orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ success: true, duels });
}

export async function POST(req) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { opponentId, bookId } = await req.json();

        // Validate
        if (!opponentId || !bookId) {
            return NextResponse.json({ error: 'Eksik bilgi.' }, { status: 400 });
        }

        if (opponentId === session.user.id) {
            return NextResponse.json({ error: 'Kendine meydan okuyamazsın.' }, { status: 400 });
        }

        // Check active duels for same book
        const existing = await prisma.duel.findFirst({
            where: {
                bookId,
                status: { in: ['PENDING', 'ACTIVE'] },
                OR: [
                    { challengerId: session.user.id, opponentId: opponentId },
                    { challengerId: opponentId, opponentId: session.user.id }
                ]
            }
        });

        if (existing) {
            return NextResponse.json({ error: 'Bu kitap için zaten aktif bir düello var.' }, { status: 400 });
        }

        // Create Duel
        const duel = await prisma.duel.create({
            data: {
                challengerId: session.user.id,
                opponentId,
                bookId,
                status: 'PENDING'
            }
        });

        // Notify Opponent
        await prisma.notification.create({
            data: {
                userId: opponentId,
                type: 'DUEL_REQUEST',
                title: 'Meydan Okuma!',
                message: `${session.user.username} seninle bir kitap düellosu yapmak istiyor.`,
                link: '/profile/me/duels',
                fromUserId: session.user.id
            }
        });

        return NextResponse.json({ success: true, duel });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Server hatası' }, { status: 500 });
    }
}

export async function PUT(req) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { duelId, action } = await req.json(); // action: accept or reject

    const duel = await prisma.duel.findUnique({ where: { id: duelId } });
    if (!duel) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });

    if (duel.opponentId !== session.user.id) {
        return NextResponse.json({ error: 'Bu istek sana ait değil.' }, { status: 403 });
    }

    if (action === 'accept') {
        await prisma.duel.update({
            where: { id: duelId },
            data: { status: 'ACTIVE' }
        });

        // Notify Challenger
        await prisma.notification.create({
            data: {
                userId: duel.challengerId,
                type: 'DUEL_ACCEPTED',
                title: 'Düello Kabul Edildi!',
                message: 'Okuma savaşı başladı! İlk bitiren kazanır.',
                link: '/profile/me/duels',
                fromUserId: session.user.id
            }
        });

        return NextResponse.json({ success: true, message: 'Düello başladı!' });
    } else {
        await prisma.duel.update({
            where: { id: duelId },
            data: { status: 'REJECTED' }
        });
        return NextResponse.json({ success: true, message: 'Reddedildi.' });
    }
}
