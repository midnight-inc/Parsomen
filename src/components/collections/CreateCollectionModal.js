"use client";
import { useState } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function CreateCollectionModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            const res = await fetch('/api/collections/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, isPublic })
            });
            const data = await res.json();



            if (data.success) {
                setName('');
                setIsOpen(false);
                toast.success('Koleksiyon oluşturuldu');
                router.refresh();
            } else {
                toast.error(data.error || 'Oluşturulamadı');
            }
        } catch (error) {
            console.error(error);
            toast.error('Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div
                onClick={() => setIsOpen(true)}
                className="aspect-[16/9] bg-gray-900/50 border border-gray-800 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 hover:bg-gray-800/50 transition-colors cursor-pointer group"
            >
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <FaPlus className="text-2xl text-gray-400 group-hover:text-white" />
                </div>
                <span className="text-gray-400 font-bold group-hover:text-white">Yeni Koleksiyon</span>
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md relative">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <FaTimes />
                        </button>

                        <h2 className="text-2xl font-bold text-white mb-6">Yeni Koleksiyon</h2>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-1">Koleksiyon Adı</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                    placeholder="Örn: Favorilerim"
                                    autoFocus
                                />
                            </div>

                            <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 cursor-pointer hover:bg-gray-800 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={isPublic}
                                    onChange={(e) => setIsPublic(e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-900"
                                />
                                <div>
                                    <span className="font-bold text-white block">Herkese Açık</span>
                                    <span className="text-xs text-gray-400">Diğer kullanıcılar bu koleksiyonu görebilir.</span>
                                </div>
                            </label>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !name.trim()}
                                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
                                >
                                    {loading ? 'Oluşturuluyor...' : 'Oluştur'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
