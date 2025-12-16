"use client";
import { FaStar, FaBook, FaFolder } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { useUserBooks } from '@/context/UserBooksContext';

function BookCardCarousel({ book }) {
    const { getProgress, isInLibrary, getCollections } = useUserBooks();

    const progress = getProgress(book.id);
    const inLibrary = isInLibrary(book.id);
    const collections = getCollections(book.id);

    return (
        <Link href={`/books/${book.id}`} className="min-w-[200px] w-[200px] group snap-start cursor-pointer block">
            <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden mb-4 shadow-lg shadow-black/50 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-indigo-500/20">
                {book.cover ? (
                    <Image
                        src={book.cover}
                        alt={book.title}
                        fill
                        sizes="200px"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-600">Kapak Yok</div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <span className="glass-button bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-white font-semibold">İncele</span>
                </div>

                {/* Top Left Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {book.isNew && (
                        <span className="bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow">
                            YENİ
                        </span>
                    )}
                    {inLibrary && (
                        <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                            <FaBook size={8} /> Kütüphanede
                        </span>
                    )}
                </div>

                {/* Top Right - Progress */}
                {progress && (
                    <div className="absolute top-2 right-2">
                        <div
                            className={`text-[11px] font-bold px-2 py-1 rounded-lg shadow-lg ${progress.percentage >= 100
                                    ? 'bg-emerald-500 text-white'
                                    : progress.percentage > 0
                                        ? 'bg-pink-500 text-white'
                                        : 'bg-gray-700 text-gray-300'
                                }`}
                        >
                            {progress.percentage >= 100 ? '✓' : `%${progress.percentage}`}
                        </div>
                    </div>
                )}

                {/* Collection Labels */}
                {collections.length > 0 && (
                    <div className="absolute bottom-2 left-2 right-2">
                        <span className="bg-purple-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1 w-fit">
                            <FaFolder size={8} /> {collections[0]}
                        </span>
                    </div>
                )}

                {/* Progress Bar */}
                {progress && progress.percentage > 0 && progress.percentage < 100 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                        <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500" style={{ width: `${progress.percentage}%` }} />
                    </div>
                )}
            </div>
            <h3 className="font-bold text-lg truncate group-hover:text-indigo-400 transition-colors">{book.title}</h3>
            <p className="text-gray-400 text-sm mb-2">{book.author}</p>
            <div className="flex items-center gap-1 text-yellow-500 text-sm bg-yellow-500/10 w-fit px-2 py-0.5 rounded-lg border border-yellow-500/20">
                <FaStar /> <span>{book.rating}</span>
            </div>
        </Link>
    );
}

export default function FeaturedCarousel({ title, books }) {
    return (
        <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-indigo-500 rounded-full"></span>
                    {title}
                </h2>
                <Link href="/store" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Tümünü Gör →
                </Link>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x">
                {books.map((book) => (
                    <BookCardCarousel key={book.id} book={book} />
                ))}
            </div>
        </div>
    );
}
