import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';

// Middleware to check admin
async function checkAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return null;

    const session = await decrypt(token);
    if (!session?.userId) return null;

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { role: true }
    });

    return user?.role === 'ADMIN' ? session.userId : null;
}

// GET - List all shop items (including inactive for admin)
export async function GET() {
    const adminId = await checkAdmin();
    if (!adminId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const items = await prisma.shopItem.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ success: true, items });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

// POST - Create new item
export async function POST(req) {
    const adminId = await checkAdmin();
    if (!adminId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const data = await req.json();
        const item = await prisma.shopItem.create({ data });
        return NextResponse.json({ success: true, item });
    } catch (error) {
        console.error('Create item error:', error);
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }
}

// PUT - Update item
export async function PUT(req) {
    const adminId = await checkAdmin();
    if (!adminId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id, ...data } = await req.json();
        const item = await prisma.shopItem.update({
            where: { id },
            data
        });
        return NextResponse.json({ success: true, item });
    } catch (error) {
        console.error('Update item error:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

// DELETE - Remove item
export async function DELETE(req) {
    const adminId = await checkAdmin();
    if (!adminId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await req.json();
        await prisma.shopItem.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete item error:', error);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
