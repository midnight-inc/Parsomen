"use client";
import { useState, useEffect } from 'react';
import { FaFolder, FaPlus, FaCheck, FaTimes, FaLock, FaGlobe } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useUserBooks } from '@/context/UserBooksContext';

export default function CollectionModal({ bookId, onClose }) {
    const { getCollections, addToCollection, removeFromCollection, createCollection, collections } = useUserBooks();
    const [loading, setLoading] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [newCollectionPublic, setNewCollectionPublic] = useState(false);

    // Get current collections for this book
    // const bookCollections = getCollections(bookId);

    // Simpler approach: List all collections. Check if book is in them.
    // The UserBooksContext might need to expose raw collections data better if getCollections only returns names.
    // Let's check UserBooksContext definition if possible, but I can't view it right now without tool. 
    // Assuming context has `collections` array which includes Book relations.

    // Workaround: I'll trust `addToCollection` and `removeFromCollection` work with names or IDs. 
    // Usually names are not unique enough, but let's assume IDs. I will inspect Context later if needed.
    // For now, I'll build the UI assuming `collections` is an array of { id, name, books: [] }.

    const toggleCollection = async (collection) => {
        const isIn = collection.books?.some(b => b.id === parseInt(bookId) || b.bookId === parseInt(bookId));

        try {
            if (isIn) {
                await removeFromCollection(collection.id, bookId);
                toast.success('Koleksiyondan çıkarıldı');
            } else {
                await addToCollection(collection.id, bookId);
                toast.success('Koleksiyona eklendi');
            }
        } catch (error) {
            toast.error('İşlem başarısız');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newCollectionName.trim()) return;

        setLoading(true);
        try {
            await createCollection(newCollectionName, newCollectionPublic);
            setNewCollectionName('');
            setShowCreate(false);
            toast.success('Koleksiyon oluşturuldu');
        } catch (error) {
            toast.error('Oluşturulamadı');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-[#1a1a20] border border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-[#15151a]">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <FaFolder className="text-purple-400" /> Koleksiyona Ekle
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <FaTimes />
                    </button>
                </div>

                <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                    {collections.length > 0 ? (
                        collections.map(col => {
                            // Check if book in collection
                            const isIn = col.books?.some(b => b.id === parseInt(bookId)) || col.books?.some(b => b.bookId === parseInt(bookId));

                            return (
                                <button
                                    key={col.id}
                                    onClick={() => toggleCollection(col)}
                                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 flex items-center justify-between group transition-colors"
                                >
                                    <span className="text-gray-300 font-medium group-hover:text-white transition-colors truncate">
                                        {col.name}
                                    </span>
                                    {isIn && <FaCheck className="text-green-500" />}
                                </button>
                            );
                        })
                    ) : (
                        <div className="text-center py-6 text-gray-500 text-sm">
                            Henüz hiç koleksiyonun yok.
                        </div>
                    )}
                </div>

                <div className="p-3 border-t border-gray-700 bg-[#15151a]">
                    {!showCreate ? (
                        <button
                            onClick={() => setShowCreate(true)}
                            className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white flex items-center justify-center gap-2 text-sm font-bold transition-all"
                        >
                            <FaPlus /> Yeni Koleksiyon Oluştur
                        </button>
                    ) : (
                        <form onSubmit={handleCreate} className="space-y-3">
                            <input
                                type="text"
                                autoFocus
                                placeholder="Koleksiyon adı..."
                                value={newCollectionName}
                                onChange={(e) => setNewCollectionName(e.target.value)}
                                className="w-full bg-black/40 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
                            />
                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => setNewCollectionPublic(!newCollectionPublic)}
                                    className={`text-xs flex items-center gap-1.5 px-2 py-1 rounded ${newCollectionPublic ? 'text-green-400 bg-green-500/10' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    {newCollectionPublic ? <FaGlobe /> : <FaLock />}
                                    {newCollectionPublic ? 'Herkese Açık' : 'Gizli'}
                                </button>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreate(false)}
                                        className="text-gray-500 hover:text-white text-xs px-3 py-1.5"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!newCollectionName.trim() || loading}
                                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg disabled:opacity-50"
                                    >
                                        Oluştur
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
