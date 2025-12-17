import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { itemId } = await req.json(); // If itemId is null, unequip all frames

        // Unequip all frames first (to ensure only one is active)
        // Find all frames owned by user
        const userFrames = await prisma.userInventory.findMany({
            where: {
                userId: session.user.id,
                item: { type: 'FRAME' }
            }
        });

        // Bulk update to unequip
        // Prisma doesn't support updateMany with relation filtering well in all versions, 
        // so we'll update based on IDs found.
        const inventoryIds = userFrames.map(f => f.id);

        await prisma.userInventory.updateMany({
            where: { id: { in: inventoryIds } },
            data: { equipped: false }
        });

        if (itemId) {
            // Equip new one
            await prisma.userInventory.update({
                where: {
                    userId_itemId: {
                        userId: session.user.id,
                        itemId: parseInt(itemId)
                    }
                },
                data: { equipped: true }
            });
        }

        return NextResponse.json({ success: true, message: 'Çerçeve güncellendi!' });

    } catch (error) {
        console.error('Equip error:', error);
        return NextResponse.json({ success: false, error: 'Server hatası' }, { status: 500 });
    }
}
