import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, context) {
    try {
        const { id } = await context.params;
        const bookId = parseInt(id);
        const book = await prisma.book.findUnique({
            where: { id: bookId }
        });

        if (!book) return NextResponse.json({ error: 'Kitap bulunamadı' }, { status: 404 });

        return NextResponse.json(book);
    } catch (error) {
        return NextResponse.json({ error: 'Hata oluştu' }, { status: 500 });
    }
}

export async function PUT(request, context) {
    try {
        const { id } = await context.params;
        const bookId = parseInt(id);
        const { title, author, category, pages, year, description, cover, visibility } = await request.json();

        console.log('Updating book:', bookId, { title, author, category, pages, year, description, cover, visibility });

        // Handle category - find or create
        let categoryId = null;
        if (category) {
            const existingCategory = await prisma.category.findUnique({
                where: { name: category }
            });
            if (existingCategory) {
                categoryId = existingCategory.id;
            } else {
                const newCat = await prisma.category.create({
                    data: { name: category }
                });
                categoryId = newCat.id;
            }
        }

        const updateData = {
            title,
            author,
            cover,
            visibility: visibility || 'PUBLIC',
            description,
            pages: parseInt(pages) || 0,
            year: parseInt(year) || new Date().getFullYear(),
        };

        // Only update categoryId if provided
        if (categoryId) {
            updateData.categoryId = categoryId;
        }

        const book = await prisma.book.update({
            where: { id: bookId },
            data: updateData,
        });

        return NextResponse.json(book);
    } catch (error) {
        console.error('Update book error:', error.message);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return NextResponse.json({ error: 'Kitap güncellenemedi: ' + error.message }, { status: 500 });
    }
}

export async function DELETE(request, context) {
    try {
        const { id } = await context.params;
        const bookId = parseInt(id);

        await prisma.book.delete({
            where: { id: bookId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete book error:', error);
        return NextResponse.json({ error: 'Kitap silinemedi.' }, { status: 500 });
    }
}

