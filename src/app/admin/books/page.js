"use client";
import { useState, useEffect, useRef } from 'react';
import { FaPlus, FaCloudUploadAlt, FaSearch, FaEdit, FaTrash, FaBook, FaTimes, FaSpinner, FaThLarge, FaList, FaFilePdf } from 'react-icons/fa';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { confirm } from '@/components/ui/ConfirmModal';

export default function BookManager() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form States
    const [editingId, setEditingId] = useState(null); // ID of book being edited
    const [uploading, setUploading] = useState(false);
    const [uploadingPdf, setUploadingPdf] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);
    const pdfInputRef = useRef(null);

    const initialFormState = {
        title: '',
        author: '',
        category: 'Bilim Kurgu',
        pages: '',
        year: new Date().getFullYear(),
        description: '',
        cover: '',
        pdfUrl: '',
        visibility: 'PUBLIC'
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        // Load view preference
        const savedMode = localStorage.getItem('bookViewMode');
        if (savedMode) setViewMode(savedMode);

        fetchBooks();
    }, []);

    const changeViewMode = (mode) => {
        setViewMode(mode);
        localStorage.setItem('bookViewMode', mode);
    };

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

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Preview
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        // Upload
        setUploading(true);
        const data = new FormData();
        data.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: data
            });

            if (!res.ok) throw new Error('Upload failed');

            const result = await res.json();
            setFormData(prev => ({ ...prev, cover: result.url }));
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Resim yüklenirken hata oluştu!');
        } finally {
            setUploading(false);
        }
    };

    const openEditModal = (book) => {
        setEditingId(book.id);
        setFormData({
            title: book.title,
            author: book.author,
            category: book.category,
            pages: book.pages || '',
            year: book.year || '',
            description: book.description || '',
            cover: book.cover,
            pdfUrl: book.pdfUrl || '',
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
            message: 'Bu kitabı silmek istediğine emin misin? Bu işlem geri alınamaz.',
            confirmText: 'Sil',
            cancelText: 'İptal',
            variant: 'danger'
        });
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Kitap silindi');
                fetchBooks(); // Refresh list
            } else {
                toast.error('Kitap silinemedi.');
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Bir hata oluştu');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.cover) {
            toast.error('Lütfen bir kapak resmi yükleyin.');
            return;
        }

        if (!formData.pdfUrl) {
            toast.error('Lütfen kitabın PDF dosyasını yükleyin.');
            return;
        }

        try {
            const url = editingId ? `/api/books/${editingId}` : '/api/books';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(editingId ? 'Kitap güncellendi! ✅' : 'Kitap başarıyla eklendi! ✅');
                setIsModalOpen(false);
                fetchBooks();
                setFormData(initialFormState);
                setPreviewUrl(null);
            } else {
                toast.error('İşlem sırasında hata oluştu.');
            }
        } catch (error) {
            console.error('Submit error:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-gray-900/50 p-4 rounded-xl border border-gray-800 gap-4">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <FaBook className="text-pink-500" /> Kitap Yönetimi
                </h1>

                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
                        <button
                            onClick={() => changeViewMode('grid')}
                            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                            title="Izgara Görünümü"
                        >
                            <FaThLarge />
                        </button>
                        <button
                            onClick={() => changeViewMode('list')}
                            className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                            title="Liste Görünümü"
                        >
                            <FaList />
                        </button>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-semibold"
                    >
                        <FaPlus /> <span className="hidden sm:inline">Yeni Kitap</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="text-center py-20 text-gray-400 animate-pulse">Yükleniyor...</div>
            ) : books.length === 0 ? (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center text-gray-400">
                    <FaBook className="text-5xl mx-auto mb-4 opacity-50" />
                    <p>Henüz kitap eklenmemiş. "Yeni Kitap" butonuna basarak başlayın.</p>
                </div>
            ) : (
                <>
                    {/* Grid View */}
                    {viewMode === 'grid' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {books.map((book) => (
                                <div key={book.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-pink-500/50 transition-all group shadow-lg flex flex-col">
                                    <div className="h-48 relative bg-gray-800 overflow-hidden">
                                        {book.cover ? (
                                            <Image
                                                src={book.cover}
                                                alt={book.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-600"><FaBook className="text-4xl" /></div>
                                        )}
                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button onClick={() => openEditModal(book)} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 transform hover:scale-110 transition-all"><FaEdit /></button>
                                            <button onClick={() => handleDelete(book.id)} className="p-2 bg-red-600 text-white rounded-full hover:bg-red-500 transform hover:scale-110 transition-all"><FaTrash /></button>
                                        </div>
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <div className="mb-2">
                                            <span className="text-xs font-bold text-pink-500 uppercase tracking-wider">{book.category}</span>
                                            <h3 className="font-bold text-white text-lg line-clamp-1" title={book.title}>{book.title}</h3>
                                            <p className="text-sm text-gray-400">{book.author}</p>
                                        </div>
                                        <div className="mt-auto pt-3 border-t border-gray-800 flex justify-between items-center text-xs text-gray-500">
                                            <span>{book.year}</span>
                                            <span>{book.pages} Syf.</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* List View */}
                    {viewMode === 'list' && (
                        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-gray-400">
                                <thead className="bg-gray-800 text-gray-300 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="p-4 w-20">Kapak</th>
                                        <th className="p-4">Başlık / Yazar</th>
                                        <th className="p-4 hidden md:table-cell">Kategori</th>
                                        <th className="p-4 hidden sm:table-cell">Yıl</th>
                                        <th className="p-4 text-right">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {books.map((book) => (
                                        <tr key={book.id} className="hover:bg-gray-800/50 transition-colors">
                                            <td className="p-3">
                                                <div className="w-12 h-16 relative rounded overflow-hidden bg-gray-800">
                                                    {book.cover && <Image src={book.cover} alt={book.title} fill className="object-cover" />}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-white">{book.title}</div>
                                                <div className="text-sm">{book.author}</div>
                                            </td>
                                            <td className="p-4 hidden md:table-cell">
                                                <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs border border-gray-700">{book.category}</span>
                                            </td>
                                            <td className="p-4 hidden sm:table-cell">{book.year}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openEditModal(book)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded"><FaEdit /></button>
                                                    <button onClick={() => handleDelete(book.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded"><FaTrash /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* Add/Edit Book Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-gray-900/50 sticky top-0 backdrop-blur z-10">
                            <h2 className="text-2xl font-bold text-white">{editingId ? 'Kitabı Düzenle' : 'Yeni Kitap Ekle'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors"><FaTimes size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Image Upload Area */}
                            <div className="flex flex-col sm:flex-row gap-6">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`w-full sm:w-32 h-48 bg-gray-800 rounded-lg flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-600 hover:border-pink-500 transition-colors relative overflow-hidden group flex-shrink-0 ${uploading ? 'opacity-50' : ''}`}
                                >
                                    {previewUrl ? (
                                        <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                                    ) : (
                                        <>
                                            <FaCloudUploadAlt className="text-3xl text-gray-500 mb-2 group-hover:text-pink-500" />
                                            <span className="text-xs text-gray-400 text-center px-2">Kapak Resmi</span>
                                        </>
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <FaSpinner className="animate-spin text-white text-2xl" />
                                        </div>
                                    )}
                                    {/* Hover overlay to indicate change is possible */}
                                    {previewUrl && !uploading && (
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <FaEdit className="text-white text-xl" />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Kitap Adı</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-pink-500 transition-colors"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Örn: Sefiller"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Yazar</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-pink-500 transition-colors"
                                            value={formData.author}
                                            onChange={e => setFormData({ ...formData, author: e.target.value })}
                                            placeholder="Örn: Victor Hugo"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Kategori</label>
                                    <select
                                        className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-pink-500 transition-colors"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option>Bilim Kurgu</option>
                                        <option>Polisiye</option>
                                        <option>Tarih</option>
                                        <option>Fantastik</option>
                                        <option>Kişisel Gelişim</option>
                                        <option>Edebiyat</option>
                                        <option>Klasik</option>
                                        <option>Dram</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Yıl</label>
                                    <input
                                        type="number"
                                        className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-pink-500 transition-colors"
                                        value={formData.year}
                                        onChange={e => setFormData({ ...formData, year: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm text-gray-400 mb-1">Görünürlük</label>
                                    <select
                                        className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-pink-500 transition-colors"
                                        value={formData.visibility}
                                        onChange={e => setFormData({ ...formData, visibility: e.target.value })}
                                    >
                                        <option value="PUBLIC">Herkes (Görünür)</option>
                                        <option value="ADMIN_ONLY">Sadece Yöneticiler</option>
                                        <option value="PRIVATE">Gizli</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Sayfa Sayısı</label>
                                <input
                                    type="number"
                                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-pink-500 transition-colors"
                                    value={formData.pages}
                                    onChange={e => setFormData({ ...formData, pages: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Özet / Açıklama</label>
                                <textarea
                                    rows="4"
                                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-pink-500 transition-colors"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Kitap hakkında kısa bilgi..."
                                ></textarea>
                            </div>

                            {/* PDF Upload Section */}
                            <div className="border border-gray-700 rounded-lg p-4 bg-gray-800/50">
                                <label className="block text-sm text-gray-300 mb-3 font-semibold flex items-center gap-2">
                                    <FaFilePdf className="text-red-500" /> PDF Dosyası (Zorunlu)
                                </label>
                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => pdfInputRef.current?.click()}
                                        disabled={uploadingPdf}
                                        className="bg-red-600/20 border border-red-500/50 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {uploadingPdf ? (
                                            <><FaSpinner className="animate-spin" /> Yükleniyor...</>
                                        ) : (
                                            <><FaCloudUploadAlt /> PDF Yükle</>
                                        )}
                                    </button>
                                    {formData.pdfUrl && (
                                        <div className="flex items-center gap-2 text-green-400 text-sm">
                                            <FaFilePdf />
                                            <span className="truncate max-w-[200px]">{formData.pdfUrl.split('/').pop()}</span>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, pdfUrl: '' })}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={pdfInputRef}
                                    className="hidden"
                                    accept=".pdf,application/pdf"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;

                                        setUploadingPdf(true);
                                        const data = new FormData();
                                        data.append('file', file);

                                        try {
                                            const res = await fetch('/api/upload', {
                                                method: 'POST',
                                                body: data
                                            });

                                            if (!res.ok) throw new Error('Upload failed');

                                            const result = await res.json();
                                            setFormData(prev => ({ ...prev, pdfUrl: result.url }));
                                            toast.success('PDF başarıyla yüklendi!');
                                        } catch (error) {
                                            console.error('PDF upload error:', error);
                                            toast.error('PDF yüklenirken hata oluştu!');
                                        } finally {
                                            setUploadingPdf(false);
                                        }
                                    }}
                                />
                                <p className="text-xs text-gray-500 mt-2">Sadece PDF dosyaları kabul edilir. Maksimum 50MB.</p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors font-semibold"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading || !formData.cover}
                                    className="flex-[2] bg-pink-600 hover:bg-pink-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-pink-900/20"
                                >
                                    {uploading ? 'Resim Yükleniyor...' : (editingId ? 'Güncellemeyi Kaydet' : 'Kitabı Oluştur')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
