"use client";
import { useState, useEffect } from 'react';
import { FaBookOpen, FaHeart, FaDownload, FaCheck, FaShareAlt, FaFolderPlus, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useUserBooks } from '@/context/UserBooksContext';
import Button from '../ui/Button';

export default function BookActions({ bookId, pdfUrl, userId: propUserId }) {
    const { user } = useAuth();
    const userId = propUserId || user?.id; // Get user ID from props or context

    // Use centralized context for favorites and simplified logic
    const { isInFavorites, refetch, favorites } = useUserBooks();

    // Local state to track favorite status (syncs with context)
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);

    // Collection states
    const [collections, setCollections] = useState([]);
    const [showCollectionMenu, setShowCollectionMenu] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [isCreatingCollection, setIsCreatingCollection] = useState(false);

    // Sync favorite status
    useEffect(() => {
        if (userId) {
            setIsFavorite(isInFavorites(bookId));
        }
    }, [bookId, userId, isInFavorites, favorites]);

    // Fetch collections when menu is opened
    useEffect(() => {
        if (showCollectionMenu && userId) {
            fetchCollections();
        }
    }, [showCollectionMenu, userId]);

    const fetchCollections = async () => {
        try {
            const res = await fetch('/api/collections/list');
            const data = await res.json();
            if (data.success) setCollections(data.collections);
        } catch (e) { }
    };

    const handleRead = () => {
        window.location.href = `/read/${bookId}`;
    };

    const handleDownload = async () => {
        if (!pdfUrl) {
            toast.error('PDF bulunamadı');
            return;
        }

        setLoading(true);
        toast.loading('İndirme başlatılıyor...', { id: 'dl' });

        try {
            // Record download
            await fetch('/api/downloads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookId, userId })
            });

            // Trigger file download
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = pdfUrl.split('/').pop() || 'book.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('İndirme başladı! 📥', { id: 'dl' });
        } catch (error) {
            toast.error('İndirme hatası', { id: 'dl' });
        } finally {
            setLoading(false);
        }
    };

    const handleFavorite = async () => {
        if (!userId) {
            toast.error('Giriş yapmalısınız');
            return;
        }

        try {
            const res = await fetch('/api/favorites/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookId })
            });

            const data = await res.json();
            if (data.success) {
                // Determine new state based on API response
                const newState = data.isFavorited;
                setIsFavorite(newState);

                if (newState) toast.success('Favorilere eklendi ❤️');
                else toast.success('Favorilerden çıkarıldı 💔');

                // Refresh context
                if (refetch) refetch();
            } else {
                toast.error('İşlem başarısız');
            }
        } catch (error) {
            toast.error('Bağlantı hatası');
        }
    };

    const addToCollection = async (collectionId, bId, silent = false) => {
        console.log(`Adding book ${bId} to collection ${collectionId}`);
        if (!bId || !collectionId) {
            console.error("Missing ID:", { bId, collectionId });
            toast.error("Hata: ID eksik");
            return false;
        }

        try {
            const res = await fetch('/api/collections/add-book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ collectionId, bookId: parseInt(bId) })
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
                console.error("API Error:", data);
                if (res.status === 409 || data.code === 'ALREADY_EXISTS') {
                    if (!silent) toast.error('Bu kitap zaten koleksiyonda mevcut', { icon: '⚠️' });
                } else {
                    if (!silent) toast.error('Koleksiyona eklenirken hata oluştu');
                }
            }
        } catch (e) {
            console.error("Fetch error:", e);
            if (!silent) toast.error('Bağlantı hatası oluştu');
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
                addToCollection(data.collection.id, bookId);
            }
        } catch (e) {
            console.error("Create collection failed", e);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Bağlantı kopyalandı! 🔗');
    };

    return (
        <div className="space-y-4">
            {/* Read Button - Prominent */}
            <Button
                onClick={handleRead}
                variant="primary"
                size="xl"
                fullWidth
                className="group"
                icon={<FaBookOpen className="text-xl group-hover:scale-110 transition-transform" />}
            >
                Oku
            </Button>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-4 gap-3">
                {/* Download */}
                <Button
                    onClick={handleDownload}
                    title="İndir"
                    variant="secondary"
                    size="icon"
                    fullWidth
                    className="h-full"
                    icon={<FaDownload />}
                />

                {/* Favorite */}
                <Button
                    onClick={handleFavorite}
                    title={isFavorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}
                    variant={isFavorite ? 'danger' : 'secondary'}
                    size="icon"
                    fullWidth
                    className="h-full"
                    icon={isFavorite ? <FaCheck /> : <FaHeart />}
                />

                {/* Add to Collection - With Dropdown */}
                <div className="relative w-full aspect-square">
                    <Button
                        onClick={() => {
                            if (!userId) toast.error('Giriş yapmalısınız');
                            else setShowCollectionMenu(!showCollectionMenu);
                        }}
                        title="Koleksiyona Ekle"
                        variant="secondary"
                        size="icon"
                        fullWidth
                        className={`h-full ${showCollectionMenu ? 'border-blue-500 bg-gray-700 text-white' : 'text-gray-400'}`}
                        icon={<FaFolderPlus />}
                    />

                    {/* Collection Menu Dropdown */}
                    {showCollectionMenu && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-2 z-50">
                            <div className="max-h-48 overflow-y-auto mb-2 scrollbar-thin scrollbar-thumb-gray-700">
                                {collections.length > 0 ? collections.map(col => (
                                    <button
                                        type="button"
                                        key={col.id}
                                        onClick={() => addToCollection(col.id, bookId)}
                                        className="w-full text-left px-3 py-2 hover:bg-gray-800 rounded text-sm text-gray-300 hover:text-white transition-colors"
                                    >
                                        {col.name}
                                    </button>
                                )) : (
                                    <div className="px-3 py-2 text-xs text-gray-500">Hiç koleksiyon yok</div>
                                )}
                            </div>

                            {!isCreatingCollection ? (
                                <button
                                    type="button"
                                    onClick={() => setIsCreatingCollection(true)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-blue-400 hover:bg-blue-500/10 rounded text-sm font-bold border-t border-gray-800 pt-2 transition-colors"
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
                                        <Button
                                            onClick={handleCreateCollection}
                                            size="sm"
                                            className="flex-1 bg-blue-600 hover:bg-blue-500"
                                        >
                                            Oluştur
                                        </Button>
                                        <Button
                                            onClick={() => setIsCreatingCollection(false)}
                                            size="sm"
                                            variant="secondary"
                                            className="flex-1"
                                        >
                                            İptal
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Share */}
                <Button
                    onClick={handleShare}
                    title="Paylaş"
                    variant="secondary"
                    size="icon"
                    fullWidth
                    className="h-full"
                    icon={<FaShareAlt />}
                />
            </div>
        </div>
    );
}
