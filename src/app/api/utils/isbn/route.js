import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const isbn = searchParams.get('isbn');

    if (!isbn) {
        return NextResponse.json({ success: false, message: 'ISBN required' }, { status: 400 });
    }

    try {
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
        const data = await res.json();

        if (data.totalItems > 0) {
            const book = data.items[0].volumeInfo;
            return NextResponse.json({
                success: true,
                book: {
                    title: book.title,
                    author: book.authors ? book.authors.join(', ') : '',
                    description: book.description || '',
                    pages: book.pageCount || 0,
                    cover: book.imageLinks?.thumbnail || book.imageLinks?.smallThumbnail || '',
                    year: book.publishedDate ? parseInt(book.publishedDate.substring(0, 4)) : null,
                }
            });
        }

        return NextResponse.json({ success: false, message: 'Book not found' }, { status: 404 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
