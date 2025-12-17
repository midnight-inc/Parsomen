import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    // Admin-only endpoint
    const session = await getSession();
    if (!session || session.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const filter = searchParams.get('filter'); // 'free' or undefined

    if (!query) {
        return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    try {
        const apiKey = process.env.GOOGLE_BOOKS_API_KEY || ''; // Optional, works without key for limited quota
        let apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=tr&printType=books&maxResults=40${apiKey ? `&key=${apiKey}` : ''}`;

        if (filter === 'free') {
            apiUrl += '&filter=free-ebooks';
        }

        console.log('Fetching Google Books:', apiUrl.replace(apiKey, 'HIDDEN_KEY')); // Debug log

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!response.ok) {
            console.error('Google Books API Error:', data);
            return NextResponse.json({ success: false, error: data.error?.message || 'External API Error' });
        }

        if (data.totalItems > 0 && data.items) {
            // Strict Filter:
            // 1. Ensure language is strictly Turkish ('tr')
            // 2. If 'filter=free' is requested, ensure PDF is strictly available
            const filteredItems = data.items.filter(item => {
                const isTr = item.volumeInfo.language === 'tr';
                const hasPdf = item.accessInfo?.pdf?.isAvailable;

                // If filtering for free books, strict PDF check. Otherwise just correct language.
                if (filter === 'free') {
                    return isTr && hasPdf;
                }
                return isTr;
            });

            const books = filteredItems.map(item => {
                const info = item.volumeInfo;
                let cover = info.imageLinks ? (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail) : null;
                if (cover && cover.startsWith('http://')) cover = cover.replace('http://', 'https://');

                // Try to find a PDF link (rare, usually for public domain books)
                let pdf = null;
                if (item.accessInfo && item.accessInfo.pdf && item.accessInfo.pdf.isAvailable && item.accessInfo.pdf.downloadLink) {
                    pdf = item.accessInfo.pdf.downloadLink;
                }

                return {
                    title: info.title,
                    author: info.authors ? info.authors.join(', ') : 'Bilinmiyor',
                    description: info.description || '',
                    pages: info.pageCount || 0,
                    year: info.publishedDate ? parseInt(info.publishedDate.substring(0, 4)) : new Date().getFullYear(),
                    category: info.categories ? info.categories[0] : 'Genel',
                    cover: cover,
                    pdfUrl: pdf,
                    language: info.language
                };
            });

            return NextResponse.json({ success: true, books });
        }

        return NextResponse.json({ success: false, message: 'Kitap bulunamadı' });

    } catch (error) {
        console.error('Google Books API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch book data', details: error.message }, { status: 500 });
    }
}
