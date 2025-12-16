"use client";
import { useState, useRef, useMemo } from 'react';
import { FaStar, FaFilter, FaSearch, FaChevronDown } from 'react-icons/fa';
import Link from 'next/link';
import BookCard from '@/components/books/BookCard';

export default function StoreClient({ books, categories, category, search }) {
    // Local state for enhanced filtering
    const [localSearch, setLocalSearch] = useState(search || '');
    const [authorFilter, setAuthorFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [showFilters, setShowFilters] = useState(false);

    // Extract unique authors and years for dropdowns
    const uniqueAuthors = useMemo(() => {
        const authors = [...new Set(books.map(b => b.author).filter(Boolean))];
        return authors.sort();
    }, [books]);

    const uniqueYears = useMemo(() => {
        const years = [...new Set(books.map(b => b.year).filter(Boolean))];
        return years.sort((a, b) => b - a);
    }, [books]);

    // Apply local filters
    const filteredBooks = useMemo(() => {
        let result = books;

        if (localSearch) {
            const searchLower = localSearch.toLowerCase();
            result = result.filter(b =>
                b.title?.toLowerCase().includes(searchLower) ||
                b.author?.toLowerCase().includes(searchLower)
            );
        }

        if (authorFilter) {
            result = result.filter(b => b.author === authorFilter);
        }

        if (yearFilter) {
            result = result.filter(b => b.year === parseInt(yearFilter));
        }

        return result.slice(0, itemsPerPage);
    }, [books, localSearch, authorFilter, yearFilter, itemsPerPage]);

    // Drag to scroll logic
    const scrollRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    const clearFilters = () => {
        setLocalSearch('');
        setAuthorFilter('');
        setYearFilter('');
    };

    return (
        <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 space-y-4">
                {/* Search Input */}
                <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Kitap veya yazar ara..."
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="w-full bg-black/50 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 outline-none transition-colors"
                    />
                </div>

                {/* Filter Toggle */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                    >
                        <FaFilter />
                        Detaylı Filtreler
                        <FaChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Items Per Page */}
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Göster:</span>
                        {[25, 50, 100].map(num => (
                            <button
                                key={num}
                                onClick={() => setItemsPerPage(num)}
                                className={`px-3 py-1 rounded-lg font-medium transition-colors ${itemsPerPage === num
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                                    }`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-800 animate-in fade-in slide-in-from-top-2">
                        {/* Author Filter */}
                        <div>
                            <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Yazar</label>
                            <select
                                value={authorFilter}
                                onChange={(e) => setAuthorFilter(e.target.value)}
                                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none"
                            >
                                <option value="">Tüm Yazarlar</option>
                                {uniqueAuthors.map(author => (
                                    <option key={author} value={author}>{author}</option>
                                ))}
                            </select>
                        </div>

                        {/* Year Filter */}
                        <div>
                            <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Yayın Yılı</label>
                            <select
                                value={yearFilter}
                                onChange={(e) => setYearFilter(e.target.value)}
                                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none"
                            >
                                <option value="">Tüm Yıllar</option>
                                {uniqueYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        {/* Clear Filters */}
                        <div className="flex items-end">
                            <button
                                onClick={clearFilters}
                                className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                Filtreleri Temizle
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Categories */}
            <div
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide cursor-grab active:cursor-grabbing select-none"
            >
                <Link
                    href="/store"
                    scroll={false}
                    draggable={false}
                    className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all border border-transparent flex-shrink-0
                        ${!category || category === 'All' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                >
                    Tümü
                </Link>
                {categories.map((cat) => (
                    <Link
                        key={cat.id}
                        href={`/store?category=${cat.name}`}
                        scroll={false}
                        draggable={false}
                        className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all border border-transparent flex-shrink-0 flex items-center gap-2
                            ${category === cat.name ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                    >
                        {cat.name}
                    </Link>
                ))}
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-500">
                {filteredBooks.length} / {books.length} kitap gösteriliyor
            </div>

            {/* Books Grid */}
            {filteredBooks.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredBooks.map((book) => (
                        <BookCard key={book.id} book={book} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-800/30 rounded-3xl border border-gray-700/50 border-dashed">
                    <FaFilter className="text-4xl text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Sonuç Bulunamadı</h3>
                    <p className="text-gray-400">Aradığınız kriterlere uygun kitap bulunamadı.</p>
                    <button
                        onClick={clearFilters}
                        className="mt-6 inline-block bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Filtreleri Temizle
                    </button>
                </div>
            )}
        </div>
    );
}
