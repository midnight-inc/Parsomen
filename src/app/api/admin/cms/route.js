import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET: Fetch all pages
export async function GET(req) {
    try {
        const session = await getSession();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const pages = await prisma.pageContent.findMany({
            orderBy: { slug: 'asc' }
        });

        return NextResponse.json({ success: true, pages });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
    }
}

// POST: Create or Update a page
export async function POST(req) {
    try {
        const session = await getSession();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { slug, title, content } = await req.json();

        const page = await prisma.pageContent.upsert({
            where: { slug },
            update: { title, content, updatedAt: new Date() },
            create: { slug, title, content }
        });

        return NextResponse.json({ success: true, page });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save page' }, { status: 500 });
    }
}

// DELETE: Delete a page
export async function DELETE(req) {
    try {
        const session = await getSession();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const slug = searchParams.get('slug');

        if (!slug) return NextResponse.json({ error: 'Slug required' }, { status: 400 });

        await prisma.pageContent.delete({
            where: { slug }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
    }
}
