import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';

// GET - List all active shop items
export async function GET() {
    try {
        const items = await prisma.shopItem.findMany({
            where: { active: true },
            orderBy: [
                { limited: 'desc' },
                { rarity: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        return NextResponse.json({ success: true, items });
    } catch (error) {
        console.error('Shop items fetch error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch items' }, { status: 500 });
    }
}

// POST - Purchase an item
export async function POST(req) {
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

        const { itemId } = await req.json();

        // Get user and item
        const user = await prisma.user.findUnique({ where: { id: session.userId } });
        const item = await prisma.shopItem.findUnique({ where: { id: itemId } });

        if (!user || !item) {
            return NextResponse.json({ error: 'User or item not found' }, { status: 404 });
        }

        if (!item.active) {
            return NextResponse.json({ error: 'Item is not available' }, { status: 400 });
        }

        // Check if already owned
        const existing = await prisma.userInventory.findUnique({
            where: { userId_itemId: { userId: user.id, itemId: item.id } }
        });

        if (existing) {
            return NextResponse.json({ error: 'You already own this item' }, { status: 400 });
        }

        // Check points
        if (user.points < item.price) {
            return NextResponse.json({ error: 'Not enough points' }, { status: 400 });
        }

        // Check stock for limited items
        if (item.limited && item.stock !== null && item.stock <= 0) {
            return NextResponse.json({ error: 'Item is out of stock' }, { status: 400 });
        }

        // Transaction: deduct points, add to inventory, decrease stock
        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { points: { decrement: item.price } }
            }),
            prisma.userInventory.create({
                data: { userId: user.id, itemId: item.id }
            }),
            ...(item.limited && item.stock !== null ? [
                prisma.shopItem.update({
                    where: { id: item.id },
                    data: { stock: { decrement: 1 } }
                })
            ] : [])
        ]);

        return NextResponse.json({ success: true, message: 'Purchase successful' });
    } catch (error) {
        console.error('Purchase error:', error);
        return NextResponse.json({ error: 'Purchase failed' }, { status: 500 });
    }
}
