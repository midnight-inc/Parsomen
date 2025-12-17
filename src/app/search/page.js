"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaSearch, FaBook, FaUser, FaSpinner, FaFire, FaTimes } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ books: [], users: [] });
    const [loading, setLoading] = useState(false);
    const [trending, setTrending] = useState([]); // Could fetch trending books here
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true);
                try {
                    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                    const data = await res.json();
                    if (data.success) {
                        setResults({ books: data.books, users: data.users });
                    }
                } catch (error) {
                    console.error('Search failed', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults({ books: [], users: [] });
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [query]);

    // Mock Trending Data for "Explore" feel when no query
    useEffect(() => {
        // In a real app, fetch from /api/store/featured
        const mockTrending = [
            { id: 1, title: "Popüler Kitap 1", author: "Yazar A" },
            { id: 2, title: "Popüler Kitap 2", author: "Yazar B" }
        ];
        setTrending(mockTrending);
    }, []);

    const clearSearch = () => {
        setQuery('');
        setResults({ books: [], users: [] });
    };

    return (
        <div className="min-h-screen pb-24 pt-4 px-4">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6 font-['Motiva Sans']">Keşfet</h1>

            {/* Search Input */}
            <div className="relative mb-8">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Kitap, yazar veya kullanıcı ara..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 pl-12 text-white placeholder-gray-500 focus:border-purple-500/50 outline-none text-lg transition-all shadow-lg"
                    autoFocus
                />
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                {query && (
                    <button onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-1">
                        <FaTimes />
                    </button>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <FaSpinner className="animate-spin text-purple-500 text-3xl" />
                </div>
            ) : query.length >= 2 ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    {/* Users Results */}
                    {results.users.length > 0 && (
                        <div>
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <FaUser /> Kullanıcılar
                            </h2>
                            <div className="grid grid-cols-1 gap-2">
                                {results.users.map(user => (
                                    <Link key={user.id} href={`/profile/${user.username}`} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-sm font-bold border border-white/10">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{user.username}</p>
                                            <p className="text-xs text-gray-500">Kullanıcı</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Books Results */}
                    {results.books.length > 0 && (
                        <div>
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <FaBook /> Kitaplar
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                {results.books.map(book => (
                                    <Link key={book.id} href={`/books/${book.id}`} className="block group">
                                        <div className="aspect-[2/3] bg-gray-800 rounded-xl overflow-hidden mb-2 relative shadow-lg">
                                            {book.cover ? (
                                                <Image src={book.cover} alt={book.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">Kapak Yok</div>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-white text-sm truncate">{book.title}</h3>
                                        <p className="text-xs text-gray-500 truncate">{book.author}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {results.books.length === 0 && results.users.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            Sonuç bulunamadı.
                        </div>
                    )}
                </div>
            ) : (
                /* Empty / Trending State */
                <div className="space-y-8 animate-in fade-in">
                    <div>
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <FaFire className="text-orange-500" /> Popüler Kategoriler
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {['Bilim Kurgu', 'Fantastik', 'Korku', 'Macera', 'Roman', 'Tarih'].map(tag => (
                                <Link key={tag} href={`/store?category=${tag}`} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm hover:bg-white/10 hover:border-purple-500/50 transition-colors">
                                    {tag}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
