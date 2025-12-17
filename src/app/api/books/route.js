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

        const seed = searchParams.get('seed');

        // If seed is provided (e.g. for Daily Book), use it to pick a random book consistently
        if (seed) {
            // Simple hash function for the seed string
            let hash = 0;
            for (let i = 0; i < seed.length; i++) {
                hash = ((hash << 5) - hash) + seed.charCodeAt(i);
                hash |= 0; // Convert to 32bit integer
            }

            // Fetch a reasonable pool of recent books to pick from (e.g. last 50)
            const count = await prisma.book.count();
            const poolSize = Math.min(count, 50);

            // Determine a stable index based on hash
            const stableIndex = Math.abs(hash) % poolSize;

            // Fetch that specific book (or books starting from that offset)
            // optimizing by taking the latest 'poolSize' relative to ID/Date is tricky with just 'skip'
            // Better approach: fetch ID list of last 50, pick one.

            const candidates = await prisma.book.findMany({
                where,
                select: { id: true },
                orderBy: { id: 'desc' },
                take: poolSize
            });

            if (candidates.length > 0) {
                // Re-map stableIndex to candidates length
                const targetId = candidates[stableIndex % candidates.length].id;

                // Now fetch full details for that single target (or multiple if limit > 1)
                // For now assuming limit=1 for daily book scenario mostly
                const seededBooks = await prisma.book.findMany({
                    where: { id: targetId },
                    include: { category: { select: { id: true, name: true } } }
                });

                return NextResponse.json(seededBooks);
            }
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

        const { title, author, category, categoryId: reqCategoryId, pages, year, description, cover, visibility } = await request.json();

        // 3. Duplicate Check
        const existingBook = await prisma.book.findFirst({
            where: {
                title: { equals: title, mode: 'insensitive' }
            }
        });

        if (existingBook) {
            return NextResponse.json({
                success: false,
                error: 'Bu kitap zaten veritabanında mevcut!'
            }, { status: 409 });
        }

        // 3. Input Validation
        if (!title || !author) {
            return NextResponse.json({
                success: false,
                error: 'Kitap başlığı ve yazar gerekli.'
            }, { status: 400 });
        }

        // 4. Category handling (Case Insensitive)
        let finalCategoryId = null;
        if (category) {
            const existingCategory = await prisma.category.findFirst({
                where: {
                    name: { equals: category, mode: 'insensitive' }
                }
            });

            if (existingCategory) {
                finalCategoryId = existingCategory.id;
            } else {
                // Create category if doesn't exist (Title Case)
                const newCat = await prisma.category.create({
                    data: { name: category }
                });
                finalCategoryId = newCat.id;
            }
        } else if (reqCategoryId) {
            finalCategoryId = parseInt(reqCategoryId);
        }

        if (!finalCategoryId) {
            return NextResponse.json({
                success: false,
                error: 'Kategori gerekli.'
            }, { status: 400 });
        }

        // 5. Create book with validated data
        const book = await prisma.book.create({
            data: {
                title: String(title).slice(0, 200), // Limit title length
                author: String(author).slice(0, 100),
                categoryId: finalCategoryId,
                cover: cover || null,
                pages: pages ? parseInt(pages) : null,
                year: year ? parseInt(year) : null,
                description: description ? String(description).slice(0, 5000) : null,
                visibility: ['PUBLIC', 'ADMIN_ONLY', 'PRIVATE'].includes(visibility)
                    ? visibility
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

