"use client";
import { useState } from 'react';
import { FaEdit, FaTrash, FaEllipsisV, FaCloudUploadAlt, FaTimes } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { confirm } from '@/components/ui/ConfirmModal';

export default function CollectionActions({ collection }) {
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Edit State
    const [name, setName] = useState(collection.name);
    const [image, setImage] = useState(collection.image || '');
    const [description, setDescription] = useState(collection.description || '');
    const [isPublic, setIsPublic] = useState(collection.isPublic);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`/api/collections/${collection.id}/edit`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, image, description, isPublic })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Koleksiyon güncellendi');
                setIsEditing(false);
                router.refresh();
            } else {
                toast.error(data.error || 'Güncelleme başarısız');
            }
        } catch (e) {
            toast.error('Hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: 'Koleksiyonu Sil',
            message: 'Bu koleksiyonu silmek istediğinize emin misiniz?',
            confirmText: 'Sil',
            cancelText: 'İptal',
            variant: 'danger'
        });
        if (!confirmed) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/collections/${collection.id}/delete`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Koleksiyon silindi');
                router.refresh();
            } else {
                toast.error(data.error || 'Silme başarısız');
            }
        } catch (e) {
            toast.error('Hata oluştu');
        } finally {
            setLoading(false);
            setIsDeleting(false);
        }
    };

    if (collection.name === 'Favoriler') return null;

    return (
        <div className="relative">
            {/* Menu Trigger */}
            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(!showMenu); }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors"
            >
                <FaEllipsisV size={14} />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(true); setShowMenu(false); }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-800 text-sm text-gray-300 hover:text-white flex items-center gap-2"
                    >
                        <FaEdit /> Düzenle
                    </button>
                    {collection.name !== 'Favoriler' && (
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(); setShowMenu(false); }}
                            className="w-full text-left px-4 py-3 hover:bg-red-900/20 text-sm text-red-400 hover:text-red-300 flex items-center gap-2 border-t border-gray-800"
                        >
                            <FaTrash /> Sil
                        </button>
                    )}
                </div>
            )}

            {/* Edit Modal toPortal logic can be complex in nested layout, standard fixed div works usually */}
            {isEditing && (
                <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-default">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg relative">
                        <button onClick={() => setIsEditing(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><FaTimes /></button>
                        <h2 className="text-2xl font-bold text-white mb-6">Koleksiyonu Düzenle</h2>

                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Koleksiyon Adı</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Açıklama</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Kapak Resmi (URL)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={image}
                                        onChange={e => setImage(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Özel bir kapak resmi URL'si girin.</p>
                            </div>

                            <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 cursor-pointer hover:bg-gray-800 transition-colors">
                                <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="w-4 h-4 rounded bg-gray-900 border-gray-600 text-blue-600" />
                                <span className="text-sm font-bold text-white">Herkese Açık</span>
                            </label>

                            <div className="flex gap-3 mt-4">
                                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2 bg-gray-800 text-white rounded-lg">İptal</button>
                                <button type="submit" disabled={loading} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    {loading ? 'Kaydediliyor...' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
