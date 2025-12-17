"use client";
import { useState, useEffect } from 'react';
import { FaEdit, FaSave, FaPlus, FaTrash, FaFileAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { confirm } from '@/components/ui/ConfirmModal';

export default function CMSManager() {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPage, setSelectedPage] = useState(null);
    const [formData, setFormData] = useState({ slug: '', title: '', content: '' });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            const res = await fetch('/api/admin/cms');
            const data = await res.json();
            if (data.success) {
                setPages(data.pages);
            }
        } catch (error) {
            toast.error('Sayfalar yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (page) => {
        setSelectedPage(page);
        setFormData({ slug: page.slug, title: page.title, content: page.content });
        setIsEditing(true);
    };

    const handleNew = () => {
        setSelectedPage(null);
        setFormData({ slug: '', title: '', content: '' });
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!formData.slug || !formData.title) return toast.error('Slug ve Başlık zorunludur.');

        try {
            const res = await fetch('/api/admin/cms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('Sayfa kaydedildi ✅');
                fetchPages();
                setIsEditing(false);
                setSelectedPage(null);
            } else {
                toast.error('Kaydedilemedi.');
            }
        } catch (error) {
            toast.error('Hata oluştu');
        }
    };

    const handleDelete = async (slug) => {
        const confirmed = await confirm({
            title: 'Sayfayı Sil',
            message: 'Bu sayfayı silmek istediğine emin misin?',
            confirmText: 'Sil',
            variant: 'danger'
        });
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/admin/cms?slug=${slug}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Sayfa silindi');
                fetchPages();
                if (selectedPage?.slug === slug) {
                    setIsEditing(false);
                    setSelectedPage(null);
                }
            }
        } catch (error) {
            toast.error('Hata');
        }
    };

    if (loading) return <div className="text-white p-10">Yükleniyor...</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in gap-6">
            <div className="flex justify-between items-center bg-gray-900/40 p-6 rounded-2xl border border-white/5 backdrop-blur-xl">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <FaFileAlt className="text-orange-500" /> İçerik Yönetimi (CMS)
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">Sabit sayfaları (Hakkımızda, Gizlilik vb.) buradan yönetebilirsin.</p>
                </div>
                <button onClick={handleNew} className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all">
                    <FaPlus /> Yeni Sayfa
                </button>
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden">
                {/* List */}
                <div className="w-1/3 bg-gray-900/40 border border-white/5 rounded-2xl flex flex-col backdrop-blur-md overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-white/5 font-bold text-gray-300">Mevcut Sayfalar</div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {pages.map(page => (
                            <div key={page.slug} className={`p-4 rounded-xl flex justify-between items-center group cursor-pointer transition-all ${selectedPage?.slug === page.slug ? 'bg-orange-500/10 border border-orange-500/50' : 'bg-transparent border border-transparent hover:bg-white/5'}`} onClick={() => handleSelect(page)}>
                                <div>
                                    <div className="font-bold text-white text-sm">{page.title}</div>
                                    <div className="text-xs text-gray-500">/{page.slug}</div>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(page.slug); }} className="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FaTrash />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Editor */}
                <div className="flex-1 bg-gray-900/40 border border-white/5 rounded-2xl flex flex-col backdrop-blur-md overflow-hidden relative">
                    {isEditing ? (
                        <div className="flex flex-col h-full p-6 space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-400 mb-1 block">Sayfa Başlığı</label>
                                    <input type="text" className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 text-white focus:border-orange-500 outline-none" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-gray-400 mb-1 block">URL Slug (Örn: hakkimizda)</label>
                                    <input type="text" className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 text-white focus:border-orange-500 outline-none" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} disabled={!!selectedPage} />
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col">
                                <label className="text-xs text-gray-400 mb-1 block">İçerik (HTML veya Markdown)</label>
                                <textarea className="flex-1 w-full bg-black/30 border border-gray-700 rounded-lg p-4 text-white font-mono text-sm focus:border-orange-500 outline-none resize-none" value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })}></textarea>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5">İptal</button>
                                <button onClick={handleSave} className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 flex items-center gap-2">
                                    <FaSave /> Kaydet
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 opacity-60">
                            <FaFileAlt className="text-6xl mb-4" />
                            <p>Düzenlemek için bir sayfa seç veya yeni oluştur.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
