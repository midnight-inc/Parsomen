import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';

// GET: Fetch all books (public endpoint with visibility filter)
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        // Check session for admin access
        const session = await getSession();
        const isAdmin = session?.user?.role === 'ADMIN';

        // Apply visibility filter based on user role
        const where = isAdmin ? {} : {
            visibility: 'PUBLIC'
        };

        // Optional: Add search/filter parameters
        const search = searchParams.get('search');
        const categoryId = searchParams.get('categoryId');
        const limit = parseInt(searchParams.get('limit') || '100');

        if (search) {
            where.OR = [
                { title: { contains: search } },
                { author: { contains: search } }
            ];
        }

        if (categoryId) {
            where.categoryId = parseInt(categoryId);
        }

        const books = await prisma.book.findMany({
            where,
            orderBy: { id: 'desc' },
            take: Math.min(limit, 200), // Cap at 200 to prevent abuse
            include: {
                category: {
                    select: { id: true, name: true }
                }
            }
        });

        return NextResponse.json(books);
    } catch (error) {
        console.error('[Books] Fetch error:', error);
        return NextResponse.json({ error: 'Kitaplar getirilemedi.' }, { status: 500 });
    }
}

// POST: Create a new book (Admin only)
export async function POST(request) {
    try {
        // 1. Admin Authentication Check
        const session = await getSession();
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({
                success: false,
                error: 'Bu işlem için admin yetkisi gerekli.'
            }, { status: 403 });
        }

        // 2. Rate Limiting
        const rateLimitError = await checkRateLimit(request, 'heavy');
        if (rateLimitError) return rateLimitError;

        const json = await request.json();

        // 3. Input Validation
        if (!json.title || !json.author) {
            return NextResponse.json({
                success: false,
                error: 'Kitap başlığı ve yazar gerekli.'
            }, { status: 400 });
        }

        // 4. Category handling (Case Insensitive)
        let categoryId = null;
        if (json.category) {
            const category = await prisma.category.findFirst({
                where: {
                    name: { equals: json.category, mode: 'insensitive' }
                }
            });

            if (category) {
                categoryId = category.id;
            } else {
                // Create category if doesn't exist (Title Case)
                const newCat = await prisma.category.create({
                    data: { name: json.category }
                });
                categoryId = newCat.id;
            }
        } else if (json.categoryId) {
            categoryId = parseInt(json.categoryId);
        }

        if (!categoryId) {
            return NextResponse.json({
                success: false,
                error: 'Kategori gerekli.'
            }, { status: 400 });
        }

        // 5. Create book with validated data
        const book = await prisma.book.create({
            data: {
                title: String(json.title).slice(0, 200), // Limit title length
                author: String(json.author).slice(0, 100),
                categoryId: categoryId,
                cover: json.cover || null,
                pdfUrl: json.pdfUrl || null,
                pages: json.pages ? parseInt(json.pages) : null,
                year: json.year ? parseInt(json.year) : null,
                description: json.description ? String(json.description).slice(0, 5000) : null,
                visibility: ['PUBLIC', 'ADMIN_ONLY', 'PRIVATE'].includes(json.visibility)
                    ? json.visibility
                    : 'PUBLIC',
                isNew: true,
                rating: 0,
            },
        });

        console.log(`[Books] Admin ${session.user.id} created book: ${book.id} - ${book.title}`);

        return NextResponse.json({ success: true, book });
    } catch (error) {
        console.error('[Books] Create error:', error);
        return NextResponse.json({
            success: false,
            error: 'Kitap oluşturulamadı.'
        }, { status: 500 });
    }
}

