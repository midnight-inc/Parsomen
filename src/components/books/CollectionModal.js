"use client";
import { useState, useEffect } from 'react';
import { FaPlus, FaFolder, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function CollectionModal({ bookId, isOpen, onClose }) {
    const [collections, setCollections] = useState([]);
    const [newCollection, setNewCollection] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) fetchCollections();
    }, [isOpen]);

    const fetchCollections = async () => {
        const res = await fetch('/api/collections');
        if (res.ok) {
            setCollections(await res.json());
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/collections', {
            method: 'POST',
            body: JSON.stringify({ name: newCollection })
        });
        if (res.ok) {
            setCollections([await res.json(), ...collections]);
            setNewCollection('');
        }
    };

    const handleAddToCollection = async (collectionId) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/collections/${collectionId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookId })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(data.message || 'Kitap koleksiyona eklendi! ✅');
                onClose();
            } else {
                if (res.status === 409) {
                    toast.info(data.error || 'Bu kitap zaten koleksiyonda ℹ️');
                } else if (res.status === 401) {
                    toast.error(data.error || 'Lütfen giriş yapın');
                } else {
                    toast.error(data.error || 'Bir hata oluştu');
                }
            }
        } catch (error) {
            console.error('Collection add error:', error);
            toast.error('Bağlantı hatası. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-4">Koleksiyona Ekle</h3>

                <form onSubmit={handleCreate} className="flex gap-2 mb-6">
                    <input
                        className="flex-1 bg-black/40 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-500"
                        placeholder="Yeni Koleksiyon Oluştur..."
                        value={newCollection}
                        onChange={e => setNewCollection(e.target.value)}
                    />
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-lg"><FaPlus /></button>
                </form>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {collections.map(col => (
                        <button
                            key={col.id}
                            onClick={() => handleAddToCollection(col.id)}
                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-left group transition-colors"
                        >
                            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-white">
                                <FaFolder />
                            </div>
                            <div>
                                <div className="font-bold text-gray-200">{col.name}</div>
                                <div className="text-xs text-gray-500">{col._count?.books || 0} Kitap</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
