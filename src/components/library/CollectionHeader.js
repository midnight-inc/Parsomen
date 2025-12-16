"use client";
import { useState } from 'react';
import Image from 'next/image';
import { FaBookOpen, FaEdit, FaCamera, FaSave, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function CollectionHeader({ collection, isOwner }) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: collection.name,
        description: collection.description || '',
        image: collection.image || ''
    });

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        const toastId = toast.loading('Fotoğraf yükleniyor...');

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData
            });
            const data = await res.json();

            if (data.success) {
                setFormData(prev => ({ ...prev, image: data.url }));
                toast.success('Fotoğraf yüklendi', { id: toastId });
            } else {
                toast.error('Yükleme başarısız', { id: toastId });
            }
        } catch (error) {
            toast.error('Hata oluştu', { id: toastId });
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/collections/${collection.id}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (data.success) {
                toast.success('Koleksiyon güncellendi');
                setIsEditing(false);
                router.refresh();
            } else {
                toast.error(data.error || 'Güncelleme başarısız');
            }
        } catch (error) {
            toast.error('Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    if (isEditing) {
        return (
            <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-8 mb-8 backdrop-blur-xl animate-in fade-in">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-800 shadow-2xl shrink-0 border-2 border-dashed border-gray-600 group-hover:border-purple-500 transition-colors">
                            {formData.image ? (
                                <Image src={formData.image} alt="Cover" fill className="object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600">
                                    <FaBookOpen className="text-4xl text-white/50" />
                                </div>
                            )}
                            <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer text-white opacity-100 hover:bg-black/40 transition-colors">
                                <FaCamera className="text-2xl mb-1" />
                                <span className="text-xs font-bold">Değiştir</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        </div>
                    </div>

                    <div className="flex-1 w-full space-y-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 ml-1">Koleksiyon Adı</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none font-bold text-xl"
                                placeholder="Koleksiyon Adı"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 ml-1">Açıklama</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none resize-none h-24"
                                placeholder="Bu koleksiyon hakkında bir şeyler yaz..."
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold flex items-center gap-2 transition-colors"
                            >
                                <FaSave /> {loading ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                disabled={loading}
                                className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-bold flex items-center gap-2 transition-colors"
                            >
                                <FaTimes /> İptal
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-8 mb-8 backdrop-blur-xl relative group">
            {/* Edit Button */}
            {isOwner && (
                <button
                    onClick={() => setIsEditing(true)}
                    className="absolute top-4 right-4 p-2 bg-gray-800/80 hover:bg-purple-600 text-gray-400 hover:text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Koleksiyonu Düzenle"
                >
                    <FaEdit size={18} />
                </button>
            )}

            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-32 h-32 rounded-xl overflow-hidden shadow-2xl shrink-0 bg-gray-800 relative">
                    {collection.image ? (
                        <Image src={collection.image} alt={collection.name} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600">
                            <FaBookOpen className="text-4xl text-white/80" />
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white mb-2">{collection.name}</h1>
                    <p className="text-gray-400 text-lg mb-4 leading-relaxed">
                        {collection.description || 'Açıklama yok.'}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                        <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full border border-gray-700">
                            {collection.books.length} Kitap
                        </span>
                        <span className="text-gray-500">
                            Oluşturan: <span className="text-white font-bold">{collection.user.username}</span>
                        </span>
                        {!collection.isPublic && (
                            <span className="bg-red-900/50 text-red-200 px-3 py-1 rounded-full text-xs font-bold uppercase border border-red-800">
                                Gizli
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
