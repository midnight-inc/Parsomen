import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '@/lib/auth';

const prisma = new PrismaClient();

// GET: List all users
export async function GET(request) {
    try {
        const session = await getSession();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // Parse query params for search
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        const where = query ? {
            OR: [
                { username: { contains: query } },
                { email: { contains: query } }
            ]
        } : {};

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true,
                _count: {
                    select: { reviews: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, users });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
