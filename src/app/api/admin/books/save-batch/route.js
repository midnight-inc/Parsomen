import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import * as cheerio from 'cheerio';
import { mapCategory } from '@/lib/categoryMapper'; // Reuse our mapper if useful, or custom logic

export async function POST(req) {
    try {
        const session = await getSession();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { books } = await req.json(); // Array of { title, author, detailUrl, ... }

        if (!books || !Array.isArray(books) || books.length === 0) {
            return NextResponse.json({ success: false, error: 'No books provided' }, { status: 400 });
        }

        let savedCount = 0;

        for (const book of books) {
            // Check existence again
            const exists = await prisma.book.findFirst({
                where: {
                    title: { equals: book.title, mode: 'insensitive' },
                    author: { contains: book.author, mode: 'insensitive' }
                }
            });

            if (exists) {
                console.log(`[Batch] SKIP Duplicate: ${book.title}`);
                continue;
            }
            console.log(`[Batch] NEW Book processing: ${book.title}`);

            // --- FETCH DETAILS FROM KITAPYURDU ---
            let description = '';
            let pages = 0;
            let year = new Date().getFullYear();
            let finalCategory = book.category || 'Edebiyat';
            let bigCover = book.cover;

            try {
                if (book.detailUrl) {
                    console.log(`[Batch] Fetching details for: ${book.title} (${book.detailUrl})`);
                    const res = await fetch(book.detailUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
                        }
                    });
                    if (!res.ok) {
                        console.error(`[Batch] Fetch failed status: ${res.status}`);
                        throw new Error(`Fetch failed: ${res.status}`);
                    }
                    const html = await res.text();
                    const $ = cheerio.load(html);

                    // Scrape Details
                    description = $('#description_text').text().trim().substring(0, 2000);

                    // Attributes table (Sayfa Sayısı, Yayın Yılı)
                    // Usually in .attributes table
                    // Example: <tr><td>Sayfa Sayısı:</td><td>350</td></tr>
                    $('.attributes tr').each((i, el) => {
                        const label = $(el).find('td:first-child').text().trim();
                        const value = $(el).find('td:last-child').text().trim();

                        if (label.includes('Sayfa Sayısı')) {
                            pages = parseInt(value) || 0;
                        }
                        if (label.includes('Yayın Tarihi') || label.includes('Basım Yılı')) {
                            // value usually "23.05.2023" or "2023"
                            const parts = value.split('.');
                            if (parts.length === 3) year = parseInt(parts[2]);
                            else year = parseInt(value) || year;
                        }
                    });

                    // Categories - Breadcrumb usually
                    // .breadcrumb li
                    const breadcrumbs = [];
                    $('.breadcrumb li').each((i, el) => {
                        breadcrumbs.push($(el).text().trim());
                    });
                    // Breadcrumbs: Anasayfa > Kitap > Edebiyat > Roman > Fantastik
                    // We can take the last relevant one
                    if (breadcrumbs.length > 2) {
                        const rawCat = breadcrumbs[breadcrumbs.length - 1] || breadcrumbs[breadcrumbs.length - 2];
                        finalCategory = mapCategory([rawCat]); // Use our mapper to standardize
                    }

                    // High res cover? 
                    // Usually .product-details .image a -> href
                    const zoomedCover = $('.product-details .image a').attr('href');
                    if (zoomedCover) bigCover = zoomedCover;

                }
            } catch (scrapeErr) {
                console.error('Detail scrape failed for:', book.title, scrapeErr);
                // Fallback to basic info we already have
            }

            // Ensure Category Exists
            const category = await prisma.category.upsert({
                where: { name: finalCategory },
                update: {},
                create: { name: finalCategory }
            });

            await prisma.book.create({
                data: {
                    title: book.title,
                    author: book.author,
                    description: description || `${book.author} tarafından yazılan ${book.title}`,
                    pages: pages || 100, // Fallback
                    year: year,
                    cover: bigCover,
                    categoryId: category.id,
                    visibility: 'PUBLIC',
                    publisher: book.publisher, // If we add publisher to schema later. Currently sticking to standard fields.
                    isNew: true
                }
            });
            savedCount++;

            // Be nice to the source
            await new Promise(r => setTimeout(r, 300));
        }

        return NextResponse.json({ success: true, count: savedCount, message: `${savedCount} kitap detaylarıyla eklendi.` });

    } catch (error) {
        console.error('Batch Save Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Save failed',
            stack: error.stack
        }, { status: 500 });
    }
}
