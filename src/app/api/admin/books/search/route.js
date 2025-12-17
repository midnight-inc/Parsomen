import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import * as cheerio from 'cheerio';

export async function GET(req) {
    try {
        const session = await getSession();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');

        if (!query) {
            return NextResponse.json({ success: false, error: 'Query required' }, { status: 400 });
        }

        // Kitapyurdu Search URL
        const searchUrl = `https://www.kitapyurdu.com/index.php?route=product/search&filter_name=${encodeURIComponent(query)}&limit=50`;

        const res = await fetch(searchUrl);
        if (!res.ok) throw new Error('Source API Error');
        const html = await res.text();
        const $ = cheerio.load(html);

        const items = [];

        // Loop through products
        $('.product-cr').each((i, el) => {
            const $el = $(el);
            const title = $el.find('.name span').text().trim();
            const author = $el.find('.author span').first().text().trim();
            const publisher = $el.find('.publisher span').first().text().trim();
            const cover = $el.find('.image img').attr('src');
            const url = $el.find('.name a').attr('href');

            // Extract likely Year or other metadata if available on grid? Rarely.
            // We'll get details during SAVE operation.

            // Filter out non-book items
            const lowerTitle = title.toLowerCase();
            const lowerPub = (publisher || '').toLowerCase();
            const forbiddenKeywords = ['puzzle', 'yapboz', 'oyuncak', 'kutu oyunu', 'kartpostal', 'defter', 'kupa', 'ayraç', 'takvim'];

            const isSafe = !forbiddenKeywords.some(k => lowerTitle.includes(k) || lowerPub.includes(k));

            if (title && url && isSafe) {
                items.push({
                    id: url, // Use URL as unique ID for scraping
                    title,
                    author: author || 'Bilinmiyor',
                    publisher: publisher || 'Bilinmiyor',
                    cover: cover,
                    detailUrl: url,
                    category: 'Genel', // Will be refined on detail fetch
                    year: null, // Detail fetch will get this
                    pages: null // Detail fetch will get this
                });
            }
        });

        // Check Existence in DB
        const processedItems = await Promise.all(items.map(async (item) => {
            const exists = await prisma.book.findFirst({
                where: {
                    title: { equals: item.title, mode: 'insensitive' },
                    author: { contains: item.author, mode: 'insensitive' }
                },
                select: { id: true }
            });
            return { ...item, isAdded: !!exists };
        }));

        return NextResponse.json({
            success: true,
            items: processedItems,
            totalItems: processedItems.length
        });

    } catch (error) {
        console.error('Scrape Search Error:', error);
        return NextResponse.json({ success: false, error: 'Arama sırasında hata oluştu' }, { status: 500 });
    }
}
