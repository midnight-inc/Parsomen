
"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Added Image import
import { FaUser, FaBook, FaUsers } from 'react-icons/fa';

const avatarColors = [
    'bg-pink-600',
    'bg-blue-600',
    'bg-green-600',
    'bg-purple-600',
    'bg-orange-600',
];

export default function CuratorLists() {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            const res = await fetch('/api/collections/public');
            const data = await res.json();
            if (data.success) {
                setCollections(data.collections);
            }
        } catch (error) {
            console.error('Failed to fetch collections:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return null;

    if (collections.length === 0) {
        return (
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
                    <span className="w-1 h-8 bg-purple-500 rounded-full"></span>
                    Küratör Listeleri
                </h2>
                <div className="bg-gray-900/30 border border-gray-800 border-dashed rounded-xl p-8 text-center">
                    <p className="text-gray-400">Henüz oluşturulmuş bir küratör listesi bulunmuyor.</p>
                    <p className="text-sm text-gray-500 mt-2">İlk listeyi oluşturmak için koleksiyonlar sayfasına gidin!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="w-1 h-8 bg-purple-500 rounded-full"></span>
                    Küratör Listeleri
                </h2>
                <Link href="/library/collections" className="text-sm text-purple-400 hover:text-white transition-colors">
                    Tümünü Gör
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {collections.map((collection, idx) => (
                    <Link
                        key={collection.id}
                        href={`/library/collections/${collection.id}`}
                        className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:bg-gray-800 hover:border-gray-700 transition-all group cursor-pointer"
                    >
                        {/* Collection Books Preview */}
                        <div className="flex gap-1 mb-4 h-20 overflow-hidden rounded-lg">
                            {collection.books.length > 0 ? (
                                collection.books.slice(0, 4).map((book, i) => (
                                    <div key={i} className="flex-1 h-full bg-gray-800 overflow-hidden relative"> {/* Added relative */}
                                        {book.cover ? (
                                            <Image
                                                src={book.cover}
                                                alt={`Cover for ${book.title || 'book'}`} // Added alt text
                                                fill // Used fill to cover parent div
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Example sizes, adjust as needed
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-700" />
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-600">
                                    Kitap Yok
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 ${avatarColors[idx % avatarColors.length]} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                                {collection.curator?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors line-clamp-1">
                                    {collection.name}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <FaUser size={10} /> {collection.curator}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-400 border-t border-gray-800 pt-3">
                            <div className="flex items-center gap-1">
                                <FaBook /> {collection.bookCount} Kitap
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
