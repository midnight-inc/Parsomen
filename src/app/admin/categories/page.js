"use client";
import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaCheck, FaTimes, FaCloudUpload, FaImage } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { confirm } from '@/components/ui/ConfirmModal';

export default function CategoryManager() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [newCat, setNewCat] = useState({ name: '', image: '', gradient: '' });
    const [isCreating, setIsCreating] = useState(false);
    const [uploadingId, setUploadingId] = useState(null);

    const fetchCategories = async () => {
        try {
            console.log('Fetching categories started...');
            const res = await fetch('/api/categories', { cache: 'no-store' });

            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

            const data = await res.json();
            console.log('Fetch data:', data);

            if (data.success) {
                setCategories(data.categories || []);
            }
        } catch (err) {
            console.error('Category fetch error:', err);
        } finally {
            console.log('Loading set to false');
            setLoading(false);
        }
    };

    useEffect(() => {
        // Run fetch
        fetchCategories();

        // Safety fallback: Force stop loading after 5 seconds if generic fetch hangs
        const timer = setTimeout(() => {
            setLoading(prev => {
                if (prev) {
                    console.warn('Force stopping loading state due to timeout');
                    return false;
                }
                return prev;
            });
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const handleFileUpload = async (e, categoryId, setUrlCallback) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingId(categoryId);
        const formData = new FormData();
        formData.append('file', file);

        try {
            console.log('Uploading file for category:', categoryId);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });

            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

            const data = await res.json();
            console.log('Upload response:', data);

            if (data.success) {
                setUrlCallback(data.url);
            } else {
                toast.error('Yükleme hatası: ' + data.message);
            }
        } catch (err) {
            console.error('Upload failed:', err);
            toast.error('Resim yüklenirken bir hata oluştu.');
        } finally {
            setUploadingId(null);
            e.target.value = null;
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm({
            title: 'Kategoriyi Sil',
            message: 'Bu kategoriyi silmek istediğine emin misin? Bu kategoriye bağlı kitaplar etkilenebilir.',
            confirmText: 'Sil',
            cancelText: 'İptal',
            variant: 'danger'
        });
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Kategori silindi');
                fetchCategories();
            } else {
                toast.error('Silme başarısız');
            }
        } catch (e) {
            toast.error('Bir hata oluştu');
        }
    };

    const handleUpdate = async (id, updatedData) => {
        try {
            const res = await fetch(`/api/categories/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (res.ok) {
                setEditing(null);
                await fetchCategories();
                toast.success('Kategori güncellendi');
            } else {
                const err = await res.json();
                toast.error('Güncelleme başarısız: ' + (err.message || ''));
            }
        } catch (e) {
            toast.error('Bağlantı hatası');
        }
    };

    const handleCreate = async () => {
        const res = await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCat)
        });
        if (res.ok) {
            setNewCat({ name: '', image: '', gradient: '' });
            setIsCreating(false);
            fetchCategories();
        }
    };

    if (loading) return <div className="text-white">Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Kategori Yönetimi</h1>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                    <FaPlus /> Yeni Ekle
                </button>
            </div>

            {isCreating && (
                <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl mb-6 shadow-xl animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-white font-bold mb-4 text-lg border-b border-gray-800 pb-2">Yeni Kategori Oluştur</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold">Kategori Adı</label>
                                <input className="w-full bg-black border border-gray-700 p-3 rounded text-white mt-1 focus:border-blue-500 outline-none" value={newCat.name} onChange={e => setNewCat({ ...newCat, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold">Gradient (Örn: from-red-500 to-blue-600)</label>
                                <input className="w-full bg-black border border-gray-700 p-3 rounded text-white mt-1" value={newCat.gradient} onChange={e => setNewCat({ ...newCat, gradient: e.target.value })} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 uppercase font-bold">Kapak Görseli</label>
                            <div className="flex gap-2">
                                <input className="flex-1 bg-black border border-gray-700 p-3 rounded text-white text-sm" placeholder="Resim URL..." value={newCat.image} onChange={e => setNewCat({ ...newCat, image: e.target.value })} />
                                <label className="bg-gray-800 hover:bg-gray-700 text-white px-4 rounded flex items-center justify-center cursor-pointer transition-colors border border-gray-600">
                                    {uploadingId === 'new' ? <span className="animate-spin">↻</span> : <FaCloudUpload />}
                                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'new', (url) => setNewCat({ ...newCat, image: url }))} />
                                </label>
                            </div>
                            {/* Preview */}
                            <div className={`h-32 w-full rounded-lg border border-gray-800 overflow-hidden relative flex items-center justify-center ${newCat.gradient ? `bg-gradient-to-r ${newCat.gradient}` : 'bg-gray-900'}`}>
                                {newCat.image ? (
                                    <img src={newCat.image} className="w-full h-full object-cover opacity-70" alt="Preview" />
                                ) : (
                                    <div className="flex flex-col items-center text-gray-600">
                                        <FaImage className="text-2xl mb-1" />
                                        <span className="text-xs">Önizleme</span>
                                    </div>
                                )}
                                <span className="absolute text-white font-bold text-xl drop-shadow-md uppercase">{newCat.name}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={() => setIsCreating(false)} className="px-5 py-2 text-gray-400 hover:text-white transition-colors">İptal</button>
                        <button onClick={handleCreate} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold shadow-lg shadow-blue-900/20">Kaydet</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(cat => (
                    <div key={cat.id} className="relative group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-all shadow-lg hover:shadow-xl">
                        {/* Visual Preview */}
                        <div className={`h-40 w-full ${cat.gradient ? `bg-gradient-to-r ${cat.gradient}` : 'bg-gray-800'} relative`}>
                            {cat.image && <img src={cat.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" alt={cat.name} />}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase tracking-widest">{cat.name}</span>
                            </div>
                        </div>

                        {editing === cat.id ? (
                            <div className="p-4 space-y-3 bg-gray-800 border-t border-gray-700">
                                <input className="w-full bg-black border border-gray-600 p-2 rounded text-white text-sm" value={cat.name} onChange={(e) => {
                                    setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, name: e.target.value } : c));
                                }} />

                                <div className="flex gap-1">
                                    <input className="flex-1 bg-black border border-gray-600 p-2 rounded text-white text-xs" placeholder="Resim URL" value={cat.image || ''} onChange={(e) => {
                                        setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, image: e.target.value } : c));
                                    }} />
                                    <label className="bg-gray-700 hover:bg-gray-600 text-white px-2 rounded flex items-center justify-center cursor-pointer">
                                        {uploadingId === cat.id ? <span className="animate-spin text-xs">↻</span> : <FaCloudUpload />}
                                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, cat.id, (url) => {
                                            setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, image: url } : c));
                                        })} />
                                    </label>
                                </div>

                                <input className="w-full bg-black border border-gray-600 p-2 rounded text-white text-xs" placeholder="Gradient Class" value={cat.gradient || ''} onChange={(e) => {
                                    setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, gradient: e.target.value } : c));
                                }} />

                                <div className="flex justify-end gap-2 pt-2">
                                    <button onClick={() => { fetchCategories(); setEditing(null); }} className="p-2 text-red-400 hover:bg-red-900/30 rounded"><FaTimes /></button>
                                    <button onClick={() => handleUpdate(cat.id, { name: cat.name, image: cat.image, gradient: cat.gradient })} className="p-2 text-green-400 hover:bg-green-900/30 rounded"><FaCheck /></button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 flex justify-between items-center bg-gray-900/50">
                                <span className="text-gray-500 text-xs font-mono">ID: {cat.id}</span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setEditing(cat.id)} className="p-2 hover:bg-blue-500/20 rounded text-blue-400 transition-colors"><FaEdit /></button>
                                    <button onClick={() => handleDelete(cat.id)} className="p-2 hover:bg-red-500/20 rounded text-red-500 transition-colors"><FaTrash /></button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
