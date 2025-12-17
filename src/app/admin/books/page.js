"use client";
import { useState, useEffect, useRef } from 'react';
import { FaPlus, FaCloudUploadAlt, FaSearch, FaEdit, FaTrash, FaBook, FaTimes, FaSpinner, FaThLarge, FaList, FaFile, FaFilter, FaSort, FaEye, FaEyeSlash, FaLock, FaExclamationTriangle, FaSatellite, FaCheck } from 'react-icons/fa';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { confirm } from '@/components/ui/ConfirmModal';
import Link from 'next/link';

export default function BookManager() {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // Default to list for admin
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    // Duplicate Manager State
    const [duplicates, setDuplicates] = useState([]);
    const [showDupesModal, setShowDupesModal] = useState(false);



    const initialFormState = {
        title: '',
        author: '',
        category: 'Bilim Kurgu',
        pages: '',
        year: new Date().getFullYear(),
        description: '',
        cover: '',
        visibility: 'PUBLIC'
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchBooks();
        fetchCategories();
    }, []);

    const fetchBooks = async () => {
        try {
            const res = await fetch('/api/books?admin=true');
            if (res.ok) {
                const data = await res.json();
                setBooks(data);
            }
        } catch (error) {
            console.error('Failed to fetch books', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            if (data.success) {
                setCategories(data.categories);
            }
        } catch (error) {
            console.error('Failed to fetch categories', error);
        }
    };

    const handleFileChange = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        if (type === 'cover') {
            setPreviewUrl(URL.createObjectURL(file));
            setUploading(true);
        }

        const data = new FormData();
        data.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: data
            });

            if (!res.ok) throw new Error('Upload failed');

            const result = await res.json();
            if (type === 'cover') {
                setFormData(prev => ({ ...prev, cover: result.url }));
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Yükleme başarısız!');
            if (type === 'cover') setPreviewUrl(null);
        } finally {
            if (type === 'cover') setUploading(false);
        }
    };

    const openEditModal = (book) => {
        setEditingId(book.id);
        setFormData({
            title: book.title,
            author: book.author,
            category: book.category?.name || 'Bilim Kurgu',
            pages: book.pages || '',
            year: book.year || '',
            description: book.description || '',
            cover: book.cover,
            visibility: book.visibility || 'PUBLIC'
        });
        setPreviewUrl(book.cover);
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingId(null);
        setFormData(initialFormState);
        setPreviewUrl(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm({
            title: 'Kitabı Sil',
            message: 'Bu kitabı silmek istediğine emin misin? Envanterlerden de silinecektir.',
            confirmText: 'Sil',
            variant: 'danger'
        });
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Kitap silindi');
                setBooks(prev => prev.filter(b => b.id !== id));
            } else {
                toast.error('Silinemedi.');
            }
        } catch (error) {
            toast.error('Hata oluştu');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.cover) return toast.error('Kapak resmi gerekli.');

        try {
            const url = editingId ? `/api/books/${editingId}` : '/api/books';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(editingId ? 'Güncellendi! ✅' : 'Eklendi! ✅');
                setIsModalOpen(false);
                fetchBooks();
            } else {
                toast.error('Hata oluştu.');
            }
        } catch (error) {
            console.error(error);
        }
    };

    // --- AI Import Logic (Simplified for brevity but functional) ---
    const handleImportSearch = async (e) => {
        e.preventDefault();
        if (!importQuery) return;
        setImporting(true);
        try {
            let url = `/api/admin/books/fetch-metadata?q=${encodeURIComponent(importQuery)}`;
            if (onlyFree) url += '&filter=free';
            const res = await fetch(url);
            const data = await res.json();
            if (data.success && data.books) setImportResults(data.books);
            else toast.error('Sonuç bulunamadı');
        } catch (e) {
            toast.error('Arama hatası');
        } finally {
            setImporting(false);
        }
    };

    const handleQuickAdd = async (book) => {
        // ... (Similar logic to original, keeping it compact)
        const newBookData = {
            ...initialFormState,
            title: book.title,
            author: book.author,
            description: book.description,
            pages: book.pages,
            year: book.year,
            cover: book.cover || ''
        };

        try {
            const res = await fetch('/api/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBookData)
            });
            if (res.ok) {
                toast.success(`${book.title} eklendi`);
                fetchBooks();
            }
        } catch (e) { toast.error('Hata'); }
    }

    // Filter Logic
    const filteredBooks = books.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'ALL' || book.category?.name === filterCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header / Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-gray-900/40 p-6 rounded-2xl border border-white/5 backdrop-blur-xl gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <FaBook className="text-pink-500" /> Kitap Yönetimi
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">{books.length} adet kitap listeleniyor</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Kitap Ara..."
                            className="bg-black/30 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-pink-500 transition-colors w-40 md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        className="bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="ALL">Tüm Kategoriler</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>

                    <Link
                        href="/admin/books/import"
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
                    >
                        <span className="text-lg">📡</span> Görsel Import
                    </Link>

                    <button
                        onClick={async () => {
                            const loadingToast = toast.loading('Mükerrer kontrolü yapılıyor...');
                            try {
                                const res = await fetch('/api/admin/books/check-duplicates');
                                const data = await res.json();
                                toast.dismiss(loadingToast);
                                if (data.success) {
                                    if (data.totalDuplicates > 0) {
                                        setDuplicates(data.groups);
                                        setShowDupesModal(true);
                                        toast.error(`${data.totalDuplicates} adet tekrar eden kayıt bulundu.`);
                                    } else {
                                        toast.success('Mükerrer kitap yok! Veritabanı temiz. ✨');
                                    }
                                }
                            } catch (e) {
                                toast.error('Kontrol sırasında hata oluştu');
                            }
                        }}
                        className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2"
                    >
                        <FaSort /> Mükerrer Kontrolü ({duplicates.length > 0 ? duplicates.length : 'AI'})
                    </button>

                    <button
                        onClick={openCreateModal}
                        className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-pink-500/20 transition-all flex items-center gap-2"
                    >
                        <FaPlus /> Yeni Ekle
                    </button>
                </div>
            </div>

            {/* Content Table/Grid */}
            {loading ? (
                <div className="flex justify-center p-12"><FaSpinner className="animate-spin text-4xl text-pink-500" /></div>
            ) : (
                <div className="bg-gray-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-gray-300 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="p-4 w-16">#</th>
                                    <th className="p-4 w-20">Kapak</th>
                                    <th className="p-4">Kitap Bilgisi</th>
                                    <th className="p-4">Kategori</th>
                                    <th className="p-4">Durum (Görünürlük)</th>
                                    <th className="p-4 text-right">Eylemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredBooks.length > 0 ? filteredBooks.map((book, index) => (
                                    <tr key={book.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 text-gray-500 font-mono text-sm">#{book.id}</td>
                                        <td className="p-4">
                                            <div className="relative w-10 h-14 rounded-md overflow-hidden bg-gray-800 shadow-sm group-hover:scale-110 transition-transform">
                                                {book.cover ? (
                                                    <Image src={book.cover} alt={book.title} fill className="object-cover" />
                                                ) : <div className="w-full h-full flex items-center justify-center text-xs">P</div>}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-white text-sm">{book.title}</div>
                                            <div className="text-xs text-gray-400">{book.author} • {book.year}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-white/5 border border-white/10 px-2 py-1 rounded text-xs text-gray-300">
                                                {book.category?.name || '-'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className={`flex items-center gap-2 text-xs font-bold px-2 py-1 rounded-full w-fit ${book.visibility === 'PUBLIC' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                book.visibility === 'PRIVATE' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                }`}>
                                                {book.visibility === 'PUBLIC' && <FaEye />}
                                                {book.visibility === 'PRIVATE' && <FaEyeSlash />}
                                                {book.visibility === 'ADMIN_ONLY' && <FaLock />}
                                                {book.visibility}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEditModal(book)} className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-all" title="Düzenle">
                                                    <FaEdit />
                                                </button>
                                                <button onClick={() => handleDelete(book.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all" title="Sil">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-gray-500">
                                            Aradığınız kriterlere uygun kitap bulunamadı.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Components */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-[#0f172a] border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-[#0f172a] sticky top-0 z-10">
                            <h2 className="text-xl font-bold text-white">{editingId ? 'Kitabı Düzenle' : 'Yeni Kitap Ekle'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><FaTimes /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="flex gap-6">
                                <div onClick={() => fileInputRef.current?.click()} className="w-32 h-44 bg-gray-800 rounded-lg flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-600 hover:border-pink-500 relative overflow-hidden group">
                                    {previewUrl ? <Image src={previewUrl} alt="Cover" fill className="object-cover" /> : <FaCloudUploadAlt className="text-2xl text-gray-500" />}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs text-center p-1">Değiştir</div>
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'cover')} accept="image/*" />

                                <div className="flex-1 space-y-4">
                                    <input required type="text" placeholder="Kitap Adı" className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-pink-500 outline-none" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                    <input required type="text" placeholder="Yazar" className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-pink-500 outline-none" value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} />
                                    <div className="flex gap-4">
                                        <select className="flex-1 bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-pink-500 outline-none" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                        </select>
                                        <input type="number" placeholder="Yıl" className="w-24 bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-pink-500 outline-none" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <textarea rows="3" placeholder="Açıklama" className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-pink-500 outline-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Sayfa Sayısı</label>
                                    <input type="number" className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-pink-500 outline-none" value={formData.pages} onChange={e => setFormData({ ...formData, pages: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Görünürlük</label>
                                    <select
                                        className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-pink-500 outline-none"
                                        value={formData.visibility}
                                        onChange={e => setFormData({ ...formData, visibility: e.target.value })}
                                    >
                                        <option value="PUBLIC">Herkes (Görünür)</option>
                                        <option value="ADMIN_ONLY">Sadece Yöneticiler</option>
                                        <option value="PRIVATE">Gizli</option>
                                    </select>
                                </div>
                            </div>



                            <button disabled={uploading} className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-pink-500/20 disabled:opacity-50">
                                {editingId ? 'Kaydet' : 'Oluştur'}
                            </button>
                        </form>
                    </div>
                </div>
            )}



            {/* Duplicate Manager Modal */}
            {showDupesModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
                    <div className="bg-[#0f172a] border border-red-500/30 rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 flex flex-col">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-red-900/10">
                            <div>
                                <h2 className="text-xl font-bold text-red-400 flex items-center gap-2"><FaExclamationTriangle /> Mükerrer Kitap Yönetimi</h2>
                                <p className="text-sm text-gray-400">Veritabanında aynı başlık ve yazara sahip kitaplar gruplandı.</p>
                            </div>
                            <button onClick={() => setShowDupesModal(false)} className="text-gray-400 hover:text-white"><FaTimes /></button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6 flex-1">
                            {duplicates.map((group, idx) => (
                                <div key={idx} className="bg-black/40 border border-gray-700 rounded-xl p-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{group.title}</h3>
                                            <p className="text-gray-400 text-sm">{group.author} (Toplam {group.count} adet)</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {group.ids.map(id => {
                                            const book = books.find(b => b.id === id); // Try to find in local state if refreshed
                                            return (
                                                <div key={id} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                                                    <div className="flex items-center gap-4">
                                                        <span className="font-mono text-xs text-gray-500">#{id}</span>
                                                        {book && (
                                                            <div className="flex gap-2 text-xs">
                                                                <span className="bg-gray-700 px-2 py-0.5 rounded text-gray-300">{book.publisher || 'Yayınevi Yok'}</span>
                                                                <span className="text-gray-400">{book.year}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleDelete(id).then(() => {
                                                            // Update local duplicates state
                                                            setDuplicates(prev => {
                                                                const newDupes = prev.map(g => {
                                                                    if (g.key === group.key) {
                                                                        return { ...g, count: g.count - 1, ids: g.ids.filter(i => i !== id) };
                                                                    }
                                                                    return g;
                                                                }).filter(g => g.count > 1); // Remove group if no longer duplicate

                                                                if (newDupes.length === 0) setShowDupesModal(false);
                                                                return newDupes;
                                                            });
                                                        })}
                                                        className="flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors text-sm font-bold"
                                                    >
                                                        <FaTrash /> Sil
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-gray-800 bg-black/20 text-center text-xs text-gray-500">
                            Dikkat: Silme işlemi geri alınamaz. Kütüphane kayıtları da silinir.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
