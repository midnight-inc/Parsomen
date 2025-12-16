"use client";
import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSave, FaSpinner, FaCheck } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function AdminShowcasePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [heroData, setHeroData] = useState({
        title: '',
        description: '',
        bookId: '',
    });

    // Fetch initial data
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/admin/showcase');
                if (res.ok) {
                    const data = await res.json();
                    setHeroData({
                        title: data.hero_title || '',
                        description: data.hero_description || '',
                        bookId: data.hero_bookId || ''
                    });
                }
            } catch (error) {
                toast.error('Ayarlar yüklenemedi');
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/showcase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(heroData)
            });

            if (res.ok) {
                toast.success('Vitrin ayarları kaydedildi! 🚀');
            } else {
                throw new Error('Kaydetme hatası');
            }
        } catch (error) {
            toast.error('Bir hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-white flex justify-center"><FaSpinner className="animate-spin text-4xl" /></div>;
    }

    return (
        <div className="p-8 text-white max-w-4xl mx-auto animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                Vitrin Yönetimi
            </h1>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
                <h2 className="text-xl font-bold mb-4 border-b border-gray-800 pb-2">Ana Vitrin (Hero)</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Kitap Başlığı</label>
                        <input
                            type="text"
                            value={heroData.title}
                            onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
                            placeholder="Örn: Dune: Çöl Gezegeni"
                            className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Kitap ID</label>
                        <input
                            type="text"
                            value={heroData.bookId}
                            onChange={(e) => setHeroData({ ...heroData, bookId: e.target.value })}
                            placeholder="Örn: 5"
                            className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition-colors"
                        />
                        <p className="text-xs text-gray-500 mt-1">Öne çıkarılacak kitabın ID numarası.</p>
                    </div>
                </div>

                <div className="mt-4">
                    <label className="block text-sm text-gray-400 mb-1">Açıklama</label>
                    <textarea
                        value={heroData.description}
                        onChange={(e) => setHeroData({ ...heroData, description: e.target.value })}
                        placeholder="Kitap hakkında kısa ve çarpıcı bir açıklama..."
                        className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white h-24 focus:border-blue-500 outline-none resize-none transition-colors"
                    />
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-500/20"
                    >
                        {saving ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                        {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </button>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 opacity-50 pointer-events-none grayscale">
                <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                    <h2 className="text-xl font-bold">Mevsimsel Vitrinler</h2>
                    <span className="text-xs bg-gray-800 px-2 py-1 rounded border border-gray-700">Yakında</span>
                </div>
                <p className="text-gray-400 mb-4">Otomatik analiz veya manuel seçim ile vitrin oluşturun.</p>

                <div className="flex gap-4">
                    <button className="px-4 py-8 bg-black/40 border border-gray-700 rounded-xl text-gray-300 flex flex-col items-center justify-center w-32 gap-2">
                        <FaPlus className="text-2xl" />
                        <span>Yeni Ekle</span>
                    </button>
                    <div className="px-4 py-8 bg-indigo-900/20 border border-indigo-500/50 rounded-xl w-32 flex flex-col items-center justify-center gap-2">
                        <span className="font-bold">Kış Teması</span>
                        <span className="text-xs text-green-400">Aktif</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
