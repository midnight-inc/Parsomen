import { NextResponse } from 'next/server';
import { searchKitapyurdu } from '@/lib/scrapers/kitapyurdu';
import { getSession } from '@/lib/auth';

export async function GET(req) {
    try {
        const session = await getSession();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');

        if (!query) {
            return NextResponse.json({ books: [] });
        }

        const books = await searchKitapyurdu(query);

        return NextResponse.json({
            success: true,
            books: books,
            count: books.length
        });

    } catch (error) {
        console.error('Import Search Error:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
