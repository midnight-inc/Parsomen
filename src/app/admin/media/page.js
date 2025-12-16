"use client";
import { useState, useEffect } from 'react';
import { FaTrash, FaCopy, FaCloudUploadAlt, FaSearch } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { confirm } from '@/components/ui/ConfirmModal';

export default function MediaLibrary() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const res = await fetch('/api/media');
            const data = await res.json();
            if (data.success) {
                setFiles(data.files);
            }
        } catch (error) {
            console.error("Failed to fetch media", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                fetchFiles();
            }
        } catch (error) {
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (filename) => {
        const confirmed = await confirm({
            title: 'Dosyayı Sil',
            message: 'Bu dosyayı silmek istediğine emin misin?',
            confirmText: 'Sil',
            cancelText: 'İptal',
            variant: 'danger'
        });
        if (!confirmed) return;

        try {
            const res = await fetch('/api/media', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename })
            });

            if (res.ok) {
                fetchFiles();
                toast.success('Dosya silindi');
            } else {
                toast.error('Silme başarısız');
            }
        } catch (error) {
            toast.error('Bir hata oluştu');
        }
    };

    const copyToClipboard = (url) => {
        // Get absolute URL
        const fullUrl = window.location.origin + url;
        navigator.clipboard.writeText(fullUrl);
        toast.success('Link kopyalandı');
    };

    const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (loading) return <div className="text-white">Medya kütüphanesi yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Medya Kütüphanesi</h1>
                    <p className="text-gray-400 text-sm">Toplam {files.length} dosya</p>
                </div>

                <div className="flex gap-4">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-3 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Dosya ara..."
                            className="bg-gray-900 border border-gray-700 pl-10 pr-4 py-2 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                        <FaCloudUploadAlt />
                        {uploading ? 'Yükleniyor...' : 'Yeni Yükle'}
                        <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
                    </label>
                </div>
            </div>

            {filteredFiles.length === 0 ? (
                <div className="text-center py-20 text-gray-500 border-2 border-dashed border-gray-800 rounded-xl">
                    Henüz dosya yok veya sonuç bulunamadı.
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredFiles.map((file, idx) => (
                        <div key={idx} className="group relative bg-gray-900 border border-gray-800 rounded-lg overflow-hidden aspect-square hover:border-gray-600 transition-all">
                            <img src={file.url} alt={file.name} className="w-full h-full object-cover" />

                            {/* Overlay Actions */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                <button
                                    onClick={() => copyToClipboard(file.url)}
                                    className="text-xs bg-white text-black px-2 py-1 rounded flex items-center gap-1 hover:bg-gray-200"
                                >
                                    <FaCopy /> URL
                                </button>
                                <button
                                    onClick={() => handleDelete(file.name)}
                                    className="text-xs bg-red-600 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-red-500"
                                >
                                    <FaTrash /> Sil
                                </button>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-[10px] text-gray-300 p-1 truncate text-center">
                                {file.name}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
