"use client";
import { useState, useRef, useMemo, useEffect } from 'react';
import { FaStar, FaFilter, FaSearch, FaChevronDown, FaThLarge, FaList, FaChevronLeft, FaChevronRight, FaBook } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import BookCard from '@/components/books/BookCard';

export default function StoreClient({ books = [], categories = [], category, search }) {
    // Local state for enhanced filtering
    const [localSearch, setLocalSearch] = useState(search || '');
    const [authorFilter, setAuthorFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [showFilters, setShowFilters] = useState(false);

    // New State for Pagination & View
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

    // Load view preference on mount
    useEffect(() => {
        const savedView = localStorage.getItem('storeViewMode');
        if (savedView) setViewMode(savedView);
    }, []);

    // Save view preference
    const handleSetViewMode = (mode) => {
        setViewMode(mode);
        localStorage.setItem('storeViewMode', mode);
    };

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [localSearch, authorFilter, yearFilter, itemsPerPage, category]);

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

        return result;
    }, [books, localSearch, authorFilter, yearFilter]);

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentBooks = filteredBooks.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

    // Pagination Controls Component
    const PaginationControls = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-center items-center gap-2 mt-12">
                <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                >
                    <FaChevronLeft />
                </button>

                {/* Simplified Page Numbers */}
                <div className="flex gap-1.5 overflow-x-auto max-w-[300px] scrollbar-hide">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => paginate(i + 1)}
                            className={`w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${currentPage === i + 1
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                >
                    <FaChevronRight />
                </button>
            </div>
        );
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

                {/* Filter Toggle & View Modes */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                    >
                        <FaFilter />
                        Detaylı Filtreler
                        <FaChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>

                    <div className="flex items-center gap-4 flex-wrap">
                        {/* View Toggles */}
                        <div className="flex bg-gray-800 rounded-lg p-1">
                            <button
                                onClick={() => handleSetViewMode('grid')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                                title="Grid Görünümü"
                            >
                                <FaThLarge />
                            </button>
                            <button
                                onClick={() => handleSetViewMode('list')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                                title="Liste Görünümü"
                            >
                                <FaList />
                            </button>
                        </div>

                        <div className="w-px h-6 bg-gray-700 mx-2 hidden md:block"></div>

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

            {/* Results Count & Current Page */}
            <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Total {filteredBooks.length} kitap bulundu</span>
                <span>Sayfa {currentPage} / {totalPages}</span>
            </div>

            {/* Content Area */}
            {currentBooks.length > 0 ? (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
                            {currentBooks.map((book) => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-black/40 text-gray-400 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="p-4 w-16 text-center">#</th>
                                        <th className="p-4 w-24">Kapak</th>
                                        <th className="p-4">Kitap Detay</th>
                                        <th className="p-4 hidden md:table-cell">Kategori</th>
                                        <th className="p-4 hidden sm:table-cell">Yıl</th>
                                        <th className="p-4 w-32 text-right">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {currentBooks.map((book, idx) => (
                                        <tr key={book.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-4 text-center text-gray-600 font-mono text-xs">
                                                {indexOfFirstItem + idx + 1}
                                            </td>
                                            <td className="p-4">
                                                <div className="relative w-10 h-14 rounded overflow-hidden bg-gray-800 shadow-sm group-hover:scale-110 transition-transform cursor-pointer">
                                                    {book.cover ? (
                                                        <Image src={book.cover} alt={book.title} fill className="object-cover" />
                                                    ) : <div className="w-full h-full flex items-center justify-center text-[8px] p-1 text-center font-bold">Resim Yok</div>}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-white text-sm mb-0.5 max-w-[200px] truncate" title={book.title}>{book.title}</div>
                                                <div className="text-xs text-gray-500">{book.author}</div>
                                                <div className="flex items-center gap-1 mt-1 text-yellow-500 text-xs">
                                                    <FaStar size={10} /> {book.rating || '-'}
                                                </div>
                                            </td>
                                            <td className="p-4 hidden md:table-cell text-sm text-gray-400">
                                                <span className="bg-gray-800 px-2 py-1 rounded text-xs border border-gray-700">
                                                    {book.category?.name || 'Genel'}
                                                </span>
                                            </td>
                                            <td className="p-4 hidden sm:table-cell text-sm text-gray-500 font-mono">
                                                {book.year}
                                            </td>
                                            <td className="p-4 text-right">
                                                <Link
                                                    href={`/books/${book.id}`}
                                                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-lg shadow-indigo-500/20"
                                                >
                                                    <FaBook size={10} /> İncele
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <PaginationControls />
                </>
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
