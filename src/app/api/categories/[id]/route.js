import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
    try {
        const id = parseInt(params.id);
        const json = await request.json();

        const category = await prisma.category.update({
            where: { id },
            data: {
                name: json.name,
                image: json.image,
                gradient: json.gradient,
            },
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error('Failed to update category:', error);
        return NextResponse.json({ error: 'Kategori güncellenemedi.' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const id = parseInt(params.id);

        await prisma.category.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete category:', error);
        return NextResponse.json({ error: 'Kategori silinemedi.' }, { status: 500 });
    }
}
