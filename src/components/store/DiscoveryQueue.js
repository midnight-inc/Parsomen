"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowRight, FaCheck, FaHeart, FaPlus } from 'react-icons/fa';
import { useUserBooks } from '@/context/UserBooksContext';
import { toast } from 'react-hot-toast';

export default function DiscoveryQueue() {
    const [queue, setQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [completed, setCompleted] = useState(false);
    const [collections, setCollections] = useState([]);
    const [showCollectionMenu, setShowCollectionMenu] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [isCreatingCollection, setIsCreatingCollection] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);

    const { isInFavorites, refetch, favorites } = useUserBooks();

    useEffect(() => {
        fetchQueue();
        fetchCollections();
    }, []);

    // Correctly initialize favorite state
    useEffect(() => {
        if (!queue[currentIndex] || loading) return;

        const bookId = parseInt(queue[currentIndex].id);
        const isFav = isInFavorites(bookId);
        setIsFavorited(isFav);
    }, [currentIndex, queue, isInFavorites, loading, favorites]);

    const fetchQueue = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/store/discovery');
            if (!res.ok) throw new Error('API Error');
            const data = await res.json();
            if (data.success) {
                setQueue(data.queue);
                setCurrentIndex(0);
                setCompleted(false);
            }
        } catch (error) {
            console.error('Failed to fetch queue');
            // toast.error('Keşif kuyruğu yüklenemedi'); // Optional: uncomment if persistent
        } finally {
            setLoading(false);
        }
    };

    const fetchCollections = async () => {
        try {
            const res = await fetch('/api/collections/list');
            const data = await res.json();
            if (data.success) setCollections(data.collections);
        } catch (e) { }
    };

    const handleNext = () => {
        if (currentIndex < queue.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setCompleted(true);
        }
    };

    const handleRefresh = () => {
        fetchQueue();
    };

    const handleAddToFavorites = async () => {
        const book = queue[currentIndex];

        try {
            const res = await fetch('/api/favorites/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookId: book.id })
            });

            const data = await res.json();
            if (data.success) {
                setIsFavorited(data.isFavorited);
                // Refresh context to sync state
                if (refetch) refetch();

                if (data.isFavorited) {
                    toast.success('Favorilere eklendi', { icon: '❤️' });
                } else {
                    toast.success('Favorilerden çıkarıldı', { icon: '💔' });
                }
            } else {
                toast.error('İşlem başarısız');
            }
        } catch (e) {
            console.error("Toggle favorite failed", e);
            toast.error('Bağlantı hatası');
        }
    };

    const addToCollection = async (collectionId, bookId, silent = false) => {
        try {
            const res = await fetch('/api/collections/add-book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ collectionId, bookId })
            });

            if (res.ok) {
                if (!silent) {
                    toast.success('Kitap koleksiyona eklendi', {
                        icon: '📚'
                    });
                }
                setShowCollectionMenu(false);
                return true;
            } else {
                const data = await res.json();
                if (res.status === 409 || data.code === 'ALREADY_EXISTS') {
                    if (!silent) toast.error('Bu kitap zaten koleksiyonda mevcut', { icon: '⚠️' });
                } else {
                    if (!silent) toast.error('Koleksiyona eklenirken hata oluştu');
                }
            }
        } catch (e) {
            console.error("Add to collection failed", e);
            if (!silent) toast.error('Koleksiyona eklenirken hata oluştu');
        }
        return false;
    };

    const handleCreateCollection = async () => {
        if (!newCollectionName) return;
        try {
            const res = await fetch('/api/collections/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCollectionName, isPublic: true })
            });
            const data = await res.json();
            if (data.success) {
                setCollections(prev => [...prev, data.collection]);
                setNewCollectionName('');
                setIsCreatingCollection(false);
                // Auto add current book
                if (queue[currentIndex]) addToCollection(data.collection.id, queue[currentIndex].id);
            }
        } catch (e) {
            console.error("Create collection failed", e);
        }
    };

    if (loading) return null; // Or a skeleton
    if (queue.length === 0) return null;

    if (completed) {
        return (
            <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl p-8 text-center border border-white/10 mb-12 animate-in fade-in zoom-in">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/20">
                    <FaCheck className="text-3xl text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Harika! Günlük listeni tamamladın.</h3>
                <p className="text-gray-300 mb-6">Yarın okyanusun derinliklerinden yeni kitaplarla görüşmek üzere.</p>
                <div className="flex justify-center gap-4">
                    <button onClick={handleRefresh} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors">
                        Listeyi Yenile
                    </button>
                    <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors shadow-lg shadow-purple-900/20">
                        Kitaplığa Dön
                    </button>
                </div>
            </div>
        );
    }

    const book = queue[currentIndex];

    return (
        <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="w-1 h-8 bg-blue-500 rounded-full"></span>
                    Keşif Kuyruğu
                </h2>
                <div className="text-sm font-medium text-gray-400 bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
                    {currentIndex + 1} / {queue.length}
                </div>
            </div>

            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden group">
                {/* Book Cover */}
                <div className="relative w-full md:w-[200px] aspect-[2/3] flex-shrink-0 rounded-xl overflow-hidden shadow-2xl shadow-black/50 mx-auto md:mx-0">
                    {book.cover ? (
                        <Image src={book.cover} alt={book.title} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-600">Kapak Yok</div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="mb-1">
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{book.category?.name || 'Genel'}</span>
                    </div>
                    <h3 className="text-3xl font-black text-white mb-2">{book.title}</h3>
                    <p className="text-xl text-gray-400 mb-4">{book.author}</p>

                    <p className="text-gray-300 leading-relaxed mb-6 line-clamp-3 md:line-clamp-4 max-w-2xl">
                        {book.description || 'Bu kitap için açıklama bulunmuyor. Yine de kapağı ilginizi çekmiş olabilir mi?'}
                    </p>

                    <div className="mt-auto flex flex-wrap gap-3 justify-center md:justify-start w-full relative">
                        <Link href={`/books/${book.id}`} className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors">
                            Detaylar
                        </Link>

                        <button
                            onClick={handleAddToFavorites}
                            className={`px-6 py-3 font-bold rounded-lg transition-colors flex items-center gap-2 ${isFavorited ? 'bg-pink-600/20 text-pink-500 border border-pink-500/50' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                        >
                            <FaHeart className={isFavorited ? "text-pink-500" : "text-gray-400"} /> {isFavorited ? 'Favorilere Eklendi' : 'Favorilere Ekle'}
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowCollectionMenu(!showCollectionMenu)}
                                className="px-6 py-3 bg-blue-600/30 text-blue-300 border border-blue-500/50 hover:bg-blue-600 hover:text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                            >
                                <FaPlus /> Koleksiyona Ekle
                            </button>

                            {/* Collection Menu Dropdown */}
                            {showCollectionMenu && (
                                <div className="absolute bottom-full left-0 mb-2 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-2 z-20">
                                    <div className="max-h-48 overflow-y-auto mb-2 scrollbar-thin scrollbar-thumb-gray-700">
                                        {collections.length > 0 ? collections.map(col => (
                                            <button
                                                key={col.id}
                                                onClick={() => addToCollection(col.id, book.id)}
                                                className="w-full text-left px-3 py-2 hover:bg-gray-800 rounded text-sm text-gray-300 hover:text-white"
                                            >
                                                {col.name}
                                            </button>
                                        )) : (
                                            <div className="px-3 py-2 text-xs text-gray-500">Hiç koleksiyon yok</div>
                                        )}
                                    </div>

                                    {!isCreatingCollection ? (
                                        <button
                                            onClick={() => setIsCreatingCollection(true)}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-blue-400 hover:bg-blue-500/10 rounded text-sm font-bold border-t border-gray-800 pt-2"
                                        >
                                            <FaPlus size={10} /> Yeni Koleksiyon
                                        </button>
                                    ) : (
                                        <div className="p-1 border-t border-gray-800 pt-2">
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder="Koleksiyon Adı"
                                                className="w-full bg-black border border-gray-700 rounded p-1 text-sm text-white mb-2 focus:border-blue-500 outline-none"
                                                value={newCollectionName}
                                                onChange={e => setNewCollectionName(e.target.value)}
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={handleCreateCollection} className="flex-1 bg-blue-600 text-white text-xs py-1 rounded hover:bg-blue-500">Oluştur</button>
                                                <button onClick={() => setIsCreatingCollection(false)} className="flex-1 bg-gray-700 text-white text-xs py-1 rounded hover:bg-gray-600">İptal</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleNext}
                            className="ml-auto px-6 py-3 bg-green-600 text-white hover:bg-green-700 font-bold rounded-lg transition-all shadow-lg shadow-green-900/20 flex items-center gap-2 group/next"
                        >
                            Sıradaki <FaArrowRight className="group-hover/next:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
