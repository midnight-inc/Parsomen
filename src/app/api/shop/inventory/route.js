import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';

// GET - Get user's inventory
export async function GET(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = await decrypt(token);
        if (!session?.userId) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }

        const inventory = await prisma.userInventory.findMany({
            where: { userId: session.userId },
            include: { item: true },
            orderBy: { purchasedAt: 'desc' }
        });

        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { points: true }
        });

        return NextResponse.json({
            success: true,
            inventory,
            points: user?.points || 0
        });
    } catch (error) {
        console.error('Inventory fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
    }
}

// PUT - Equip/unequip an item
export async function PUT(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = await decrypt(token);
        if (!session?.userId) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }

        const { itemId, equipped } = await req.json();
        const parsedItemId = parseInt(itemId);

        console.log(`User ${session.userId} attempting to ${equipped ? 'equip' : 'unequip'} item ${itemId} (parsed: ${parsedItemId})`);

        if (isNaN(parsedItemId)) {
            console.error('Invalid itemId:', itemId);
            return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
        }

        // Get the item to check type
        const inventoryItem = await prisma.userInventory.findUnique({
            where: { userId_itemId: { userId: session.userId, itemId: parsedItemId } },
            include: { item: true }
        });

        if (!inventoryItem) {
            console.error(`Item not found in inventory. User: ${session.userId}, Item: ${parsedItemId}`);
            return NextResponse.json({ error: 'Item not in inventory' }, { status: 404 });
        }

        // Unequip other items of same type first
        if (equipped) {
            await prisma.userInventory.updateMany({
                where: {
                    userId: session.userId,
                    item: { type: inventoryItem.item.type },
                    equipped: true
                },
                data: { equipped: false }
            });
        }

        // Update the item
        await prisma.userInventory.update({
            where: { userId_itemId: { userId: session.userId, itemId: parsedItemId } },
            data: { equipped }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Equip error details:', error);
        return NextResponse.json({ error: 'Failed to update: ' + error.message }, { status: 500 });
    }
}
