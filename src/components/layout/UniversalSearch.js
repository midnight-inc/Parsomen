"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaSearch, FaBook, FaUser, FaSpinner } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function UniversalSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ books: [], users: [] });
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true);
                try {
                    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                    const data = await res.json();
                    if (data.success) {
                        setResults({ books: data.books, users: data.users });
                        setIsOpen(true);
                    }
                } catch (error) {
                    console.error('Search failed', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults({ books: [], users: [] });
                setIsOpen(false);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [query]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            setIsOpen(false);
            router.push(`/store?search=${encodeURIComponent(query)}`);
        }
    };

    return (
        <div className="relative z-50" ref={searchRef}>
            <form onSubmit={handleSubmit} className="relative group bg-gray-900/80 hover:bg-black/50 transition-colors rounded-full flex items-center px-4 py-2 border border-white/5 focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/20 w-[280px]">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => { if (query.length >= 2) setIsOpen(true); }}
                    placeholder="Kitap, Yazar veya Kullanıcı Ara..."
                    className="bg-transparent border-none outline-none text-gray-200 placeholder-gray-500 text-sm w-full"
                />
                <button type="submit" className="p-1">
                    {loading ? (
                        <FaSpinner className="animate-spin text-purple-500" />
                    ) : (
                        <FaSearch className="text-gray-500 group-hover:text-white transition-colors" />
                    )}
                </button>
            </form>

            {/* Dropdown Results */}
            {isOpen && (results.books.length > 0 || results.users.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                    {/* Books Section */}
                    {results.books.length > 0 && (
                        <div className="p-2">
                            <div className="px-3 py-1 text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                <FaBook /> Kitaplar
                            </div>
                            {results.books.map(book => (
                                <Link
                                    key={book.id}
                                    href={`/books/${book.id}`}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors group"
                                >
                                    <div className="w-8 h-12 bg-gray-800 rounded overflow-hidden relative shadow-sm group-hover:shadow-md transition-shadow">
                                        {book.cover ? (
                                            <Image src={book.cover} alt={book.title} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-600">Kapak Yok</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-gray-200 truncate group-hover:text-white">{book.title}</div>
                                        <div className="text-xs text-gray-500 truncate">{book.author}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {results.books.length > 0 && results.users.length > 0 && <div className="h-px bg-white/5 mx-2 my-1"></div>}

                    {/* Users Section */}
                    {results.users.length > 0 && (
                        <div className="p-2">
                            <div className="px-3 py-1 text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                <FaUser /> Kullanıcılar
                            </div>
                            {results.users.map(user => (
                                <Link
                                    key={user.id}
                                    href={`/profile/${user.username}`}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors group"
                                >
                                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-xs font-bold text-gray-400 border border-gray-700 group-hover:border-gray-500">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-gray-200 group-hover:text-white">{user.username}</div>
                                        {user.role === 'ADMIN' && <div className="text-[10px] text-indigo-400">Yönetici</div>}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="bg-white/5 p-2 text-center text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer transition-colors border-t border-white/5" onClick={handleSubmit}>
                        Tüm sonuçları gör ({results.books.length + results.users.length}+)
                    </div>
                </div>
            )}

            {/* No Results */}
            {isOpen && query.length >= 2 && results.books.length === 0 && results.users.length === 0 && !loading && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 text-center text-gray-500 text-sm shadow-xl">
                    Sonuç bulunamadı.
                </div>
            )}
        </div>
    );
}
