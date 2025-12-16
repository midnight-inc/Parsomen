"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function SuggestedBooks() {
    const [books, setBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBooks = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/books/recommended');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setBooks(data.books || []);
                    } else {
                        // Silent fail or just empty
                        setBooks([]);
                    }
                } else {
                    setBooks([]);
                }
            } catch (error) {
                console.error("Failed to fetch suggested books", error);
                setBooks([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBooks();
    }, []);

    if (isLoading) return (
        <div className="bg-gray-900/30 rounded-xl border border-gray-800 p-4 backdrop-blur-sm animate-pulse">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Önerilen Kitaplar</h3>
            <div className="h-10 bg-gray-800 rounded mb-2"></div>
            <div className="h-10 bg-gray-800 rounded"></div>
        </div>
    );

    if (error) return null; // Hide on error

    if (!books || books.length === 0) return (
        <div className="bg-gray-900/30 rounded-xl border border-gray-800 p-4 backdrop-blur-sm">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Önerilen Kitaplar</h3>
            <p className="text-gray-500 text-xs italic">Henüz öneri yok.</p>
        </div>
    );

    return (
        <div className="bg-gray-900/30 rounded-xl border border-gray-800 p-4 backdrop-blur-sm">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Önerilen Kitaplar</h3>

            <div className="space-y-4">
                {books.slice(0, 5).map(book => (
                    <Link href={`/books/${book.id}`} key={book.id} className="flex gap-3 group">
                        <div className="w-10 h-14 bg-gray-800 rounded overflow-hidden flex-shrink-0 relative border border-gray-700 group-hover:border-purple-500 transition-colors">
                            {book.cover ? (
                                <Image src={book.cover} alt={book.title} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs text-gray-600">No</div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1 py-1">
                            <p className="text-sm font-bold text-white truncate group-hover:text-purple-400 transition-colors">{book.title}</p>
                            <p className="text-xs text-gray-500 truncate">{book.author || 'Yazar Bilinmiyor'}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
