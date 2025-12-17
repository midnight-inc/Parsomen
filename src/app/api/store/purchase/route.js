import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { itemId } = await req.json();

        // 1. Get Item info
        const item = await prisma.shopItem.findUnique({ where: { id: parseInt(itemId) } });
        if (!item) return NextResponse.json({ success: false, error: 'Ürün bulunamadı' }, { status: 404 });

        // 2. Check User Points
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { points: true }
        });

        if (user.points < item.price) {
            return NextResponse.json({ success: false, error: 'Yetersiz Puan' }, { status: 400 });
        }

        // 3. Check if already owned
        const existing = await prisma.userInventory.findUnique({
            where: {
                userId_itemId: {
                    userId: session.user.id,
                    itemId: parseInt(itemId)
                }
            }
        });

        if (existing) {
            return NextResponse.json({ success: false, error: 'Zaten sahipsin' }, { status: 400 });
        }

        // 4. Transaction: Deduct Points & Add Item
        await prisma.$transaction([
            prisma.user.update({
                where: { id: session.user.id },
                data: { points: { decrement: item.price } }
            }),
            prisma.userInventory.create({
                data: {
                    userId: session.user.id,
                    itemId: parseInt(itemId)
                }
            })
        ]);

        return NextResponse.json({ success: true, message: 'Satın alma başarılı!' });

    } catch (error) {
        console.error('Purchase error:', error);
        return NextResponse.json({ success: false, error: 'Server hatası' }, { status: 500 });
    }
}
