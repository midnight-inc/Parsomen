"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { FaStar, FaBook, FaFolder } from 'react-icons/fa';
import { useUserBooks } from '@/context/UserBooksContext';
import TiltCard from '@/components/ui/TiltCard';

export default function BookCard({ book }) {
    const { getProgress, isInLibrary, getCollections, isInFavorites } = useUserBooks();

    const progress = getProgress(book.id);
    const inLibrary = isInLibrary(book.id);
    const inFavorites = isInFavorites(book.id);
    const collections = getCollections(book.id);
    const [liveReaders, setLiveReaders] = useState(0);

    useEffect(() => {
        // Fetch real live reader count
        fetch(`/api/books/live?bookId=${book.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.count > 0) {
                    setLiveReaders(data.count);
                }
            })
            .catch(() => { });
    }, [book.id]);

    // Dynamic 'New' check (7 days)
    const isNew = book.createdAt && (new Date() - new Date(book.createdAt) < 7 * 24 * 60 * 60 * 1000);

    return (
        <Link href={`/books/${book.id}`} className="group relative block perspective-1000">
            <TiltCard className="rounded-xl" scale={1.05} maxRotate={10}>
                <div className="aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-lg bg-gray-800 relative transform transition-all duration-300 group-hover:shadow-indigo-500/20 group-hover:shadow-2xl">
                    {book.cover ? (
                        <Image
                            src={book.cover}
                            alt={book.title}
                            fill
                            sizes="(max-width: 768px) 50vw, 20vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            unoptimized
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gray-900">Kapak Yok</div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

                    {/* Top Left Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
                        {isNew && (
                            <span className="bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow">
                                YENİ
                            </span>
                        )}

                        {/* In Library Badge */}
                        {inLibrary && (
                            <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                                <FaBook size={8} /> Kütüphanede
                            </span>
                        )}
                        {liveReaders > 0 && (
                            <span className="bg-orange-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1 animate-pulse">
                                <span className="w-1.5 h-1.5 bg-white rounded-full inline-block" /> {liveReaders} Okuyor
                            </span>
                        )}
                    </div>

                    {/* Top Right - Progress & Favorite */}
                    <div className="absolute top-2 right-2 flex flex-col items-end gap-1 z-20">
                        {progress && (
                            <div
                                className={`text-[11px] font-bold px-2 py-1 rounded-lg shadow-lg backdrop-blur-sm ${progress.percentage >= 100
                                    ? 'bg-emerald-500 text-white'
                                    : progress.percentage > 0
                                        ? 'bg-pink-500/90 text-white'
                                        : 'bg-gray-700/80 text-gray-300'
                                    }`}
                            >
                                {progress.percentage >= 100 ? '✓ Tamam' : `%${progress.percentage}`}
                            </div>
                        )}
                        {inFavorites && (
                            <div className="bg-red-500 text-white p-1.5 rounded-full shadow-lg">
                                <FaStar size={10} />
                            </div>
                        )}
                    </div>

                    {/* Bottom - Collection Labels */}
                    {collections.length > 0 && (
                        <div className="absolute bottom-14 left-2 right-2 flex flex-wrap gap-1 z-20">
                            {collections.slice(0, 2).map((name, idx) => (
                                <span
                                    key={idx}
                                    className="bg-purple-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow backdrop-blur-sm flex items-center gap-1"
                                >
                                    <FaFolder size={8} /> {name}
                                </span>
                            ))}
                            {collections.length > 2 && (
                                <span className="bg-gray-700/80 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                                    +{collections.length - 2}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Hover Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-black/60 backdrop-blur-md z-10">
                        <span className="block text-xs text-indigo-300 font-bold mb-1">{book.category?.name || 'Genel'}</span>
                        <span className="text-white text-xs font-bold bg-indigo-600 px-2 py-1 rounded inline-block">
                            İncele
                        </span>
                    </div>

                    {/* Bottom Progress Bar */}
                    {progress && progress.percentage > 0 && progress.percentage < 100 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50 z-10">
                            <div
                                className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                                style={{ width: `${progress.percentage}%` }}
                            />
                        </div>
                    )}
                </div>
            </TiltCard>
            <h3 className="font-bold text-gray-100 truncate group-hover:text-indigo-400 transition-colors mt-2 pl-1">{book.title}</h3>
            <div className="flex items-center justify-between mt-1 pl-1">
                <p className="text-xs text-gray-500 truncate max-w-[60%]">{book.author}</p>
                <div className="flex items-center gap-1 text-xs text-yellow-500">
                    <FaStar /> <span>{book.rating || '-'}</span>
                </div>
            </div>
        </Link>
    );
}
