import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { mapCategory } from '@/lib/categoryMapper';

// Max results per page allowed by Google Books API is 40
const MAX_RESULTS = 40;

export async function POST(req) {
    try {
        const session = await getSession();
        // Check for admin role logic here if strictly needed, but route protection usually handles it.
        // For now, let's assume middleware or client layout handles heavy lifting, but safety check is good.
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { query, totalBooks = 40 } = body; // e.g. "subject:fantasy", 100 books

        if (!query) {
            return NextResponse.json({ success: false, error: 'Query is required' }, { status: 400 });
        }

        let booksAdded = 0;
        let startIndex = 0;
        let errors = [];

        // Loop to fetch batches until we reach totalBooks or hit a safety limit
        // Safety Break: Don't loop more than 10 times (max ~400 books browsed) to prevent infinite loops if duplicates persist
        let loopCount = 0;
        const MAX_LOOPS = 15;

        while (booksAdded < totalBooks && loopCount < MAX_LOOPS) {
            loopCount++;
            const remaining = totalBooks - booksAdded;
            // Fetch slightly more than needed to account for duplicates, capped at MAX_RESULTS
            const currentLimit = MAX_RESULTS;

            const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${currentLimit}&printType=books&langRestrict=tr`;

            const res = await fetch(apiUrl);
            if (!res.ok) {
                errors.push(`Google API Error: ${res.statusText}`);
                break;
            }

            const data = await res.json();
            if (!data.items || data.items.length === 0) {
                break; // No more books found
            }

            // Process each book
            for (const item of data.items) {
                if (booksAdded >= totalBooks) break;

                const info = item.volumeInfo;
                if (!info.title || !info.authors) continue;
                if (info.language !== 'tr') continue; // Only Turkish Allowed

                const title = info.title;
                const author = info.authors[0];
                const description = info.description ? info.description.substring(0, 1000) : '';
                const pageCount = info.pageCount || 0;
                const publishedDate = info.publishedDate;
                const year = publishedDate ? parseInt(publishedDate.split('-')[0]) : null;
                const cover = info.imageLinks?.thumbnail?.replace('http:', 'https:') || null;

                const categoryName = mapCategory(info.categories);

                // --- ROBUST DUPLICATE CHECK ---
                // We check if this book effectively exists before attempting anything
                const existingBook = await prisma.book.findFirst({
                    where: {
                        title: { equals: title, mode: 'insensitive' }, // Case insensitive check
                        author: { contains: author, mode: 'insensitive' } // Author check
                    }
                });

                if (existingBook) {
                    continue; // SKIP DUPLICATE completely, check next book
                }

                // If new, create category and book
                const category = await prisma.category.upsert({
                    where: { name: categoryName },
                    update: {},
                    create: { name: categoryName }
                });

                await prisma.book.create({
                    data: {
                        title,
                        author,
                        description,
                        pages: pageCount,
                        year,
                        cover,
                        categoryId: category.id,
                        visibility: 'PUBLIC',
                        isNew: true
                    }
                });

                booksAdded++;
            }

            startIndex += currentLimit;
            await new Promise(resolve => setTimeout(resolve, 100)); // Lower delay slightly
        }

        if (booksAdded === 0 && loopCount > 0) {
            return NextResponse.json({ success: false, error: 'Uygun veya yeni kitap bulunamadı (Hepsi ekli olabilir).' });
        }

        return NextResponse.json({
            success: true,
            message: `${booksAdded} yeni kitap kütüphaneye eklendi.`,
            count: booksAdded
        });

    } catch (error) {
        console.error('Import Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Import Error' }, { status: 500 });
    }
}
