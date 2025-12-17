"use client";
import { useState } from 'react';
import { FaSearch, FaCloudDownloadAlt, FaPlus, FaCheck, FaSpinner, FaBookOpen } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function BookImportPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState({}); // { externalId: boolean }

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setResults([]);
        try {
            const res = await fetch(`/api/admin/books/import-search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data.success) {
                setResults(data.books);
                if (data.books.length === 0) toast('Kitap bulunamadı', { icon: '🔍' });
            } else {
                toast.error('Arama başarısız');
            }
        } catch (err) {
            toast.error('Hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (book) => {
        setImporting(prev => ({ ...prev, [book.externalId]: true }));
        try {
            // Prepare book data for your existing API format
            const bookData = {
                title: book.title,
                author: book.author,
                publisher: book.publisher,
                description: `Kitapyurdu ID: ${book.externalId} - ${book.title}`, // Placeholder desc
                pageCount: book.pageCount || 300,
                cover: book.cover,
                category: 'Roman', // Default fallback, could be improved
                language: 'Türkçe'
            };

            const res = await fetch('/api/books', { // Assuming this is the create endpoint
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookData)
            });

            if (res.ok) {
                toast.success(`${book.title} eklendi!`);
                // Mark as imported visually
                setResults(prev => prev.map(b =>
                    b.externalId === book.externalId ? { ...b, imported: true } : b
                ));
            } else {
                toast.error('Ekleme başarısız');
            }
        } catch (e) {
            toast.error('Import hatası');
        } finally {
            setImporting(prev => ({ ...prev, [book.externalId]: false }));
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <FaCloudDownloadAlt className="text-blue-500" />
                    Kitap İçe Aktar (Scraper)
                </h1>
                <p className="text-gray-400">Kitapyurdu üzerinden kitap verilerini çekip veritabanına ekleyin.</p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-12 relative max-w-2xl">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Kitap adı, yazar veya ISBN ara..."
                    className="w-full pl-14 pr-6 py-5 bg-gray-900 border-2 border-gray-800 rounded-2xl text-xl text-white focus:border-blue-500 focus:outline-none transition-all shadow-lg"
                />
                <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-xl" />
                <button
                    type="submit"
                    disabled={loading}
                    className="absolute right-3 top-3 bottom-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                    {loading ? <FaSpinner className="animate-spin" /> : 'Ara'}
                </button>
            </form>

            {/* Results Grid */}
            {results.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4">
                    {results.map((book) => (
                        <div key={book.externalId} className={`bg-gray-900 border rounded-xl overflow-hidden flex flex-col transition-all ${book.imported ? 'border-green-500/50 opacity-75' : 'border-gray-800 hover:border-gray-600'}`}>
                            <div className="relative h-64 bg-gray-800 p-4 flex items-center justify-center">
                                {book.cover ? (
                                    <img src={book.cover} alt={book.title} className="h-full object-contain shadow-lg" />
                                ) : (
                                    <FaBookOpen className="text-4xl text-gray-600" />
                                )}
                                {book.imported && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                                        <div className="bg-green-500 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2">
                                            <FaCheck /> Eklendi
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-bold text-white line-clamp-2 mb-1" title={book.title}>{book.title}</h3>
                                <p className="text-gray-400 text-sm mb-1">{book.author}</p>
                                <p className="text-gray-500 text-xs mb-4">{book.publisher}</p>

                                <div className="mt-auto flex items-center justify-between">
                                    <span className="text-blue-400 font-bold">{book.price > 0 ? `${book.price} TL` : '-'}</span>
                                    <button
                                        onClick={() => !book.imported && handleImport(book)}
                                        disabled={book.imported || importing[book.externalId]}
                                        className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${book.imported
                                                ? 'bg-gray-800 text-gray-500 cursor-default'
                                                : 'bg-white text-black hover:bg-gray-200'
                                            }`}
                                    >
                                        {importing[book.externalId] ? <FaSpinner className="animate-spin" /> : (book.imported ? <FaCheck /> : <FaPlus />)}
                                        {book.imported ? 'Mevcut' : 'Ekle'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && results.length === 0 && query && (
                <div className="text-center text-gray-500 mt-12">
                    Sonuç bulunamadı.
                </div>
            )}
        </div>
    );
}
