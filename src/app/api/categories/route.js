import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { books: true },
                },
            },
            orderBy: { id: 'asc' }
        });
        return NextResponse.json({ success: true, categories });
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const json = await request.json();

        // Check if duplicate
        const existing = await prisma.category.findUnique({
            where: { name: json.name }
        });

        if (existing) {
            return NextResponse.json({ error: 'Bu kategori zaten var.' }, { status: 400 });
        }

        const category = await prisma.category.create({
            data: {
                name: json.name,
                image: json.image,
                gradient: json.gradient,
            },
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error('Failed to create category:', error);
        return NextResponse.json({ error: 'Kategori oluşturulamadı.' }, { status: 500 });
    }
}

// DELETE endpoint moved to [id]/route.js
