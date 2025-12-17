"use client";
import { useState, useEffect, useRef } from 'react';
import { FaPlus, FaCloudUploadAlt, FaSearch, FaEdit, FaTrash, FaBook, FaTimes, FaSpinner, FaThLarge, FaList, FaFile } from 'react-icons/fa';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { confirm } from '@/components/ui/ConfirmModal';

export default function BookManager() {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form States
    // AI Import States
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importQuery, setImportQuery] = useState('');
    const [importResults, setImportResults] = useState([]);
    const [importing, setImporting] = useState(false);
    const [onlyFree, setOnlyFree] = useState(false); // Default false to ensure results appear
    const [addingIds, setAddingIds] = useState([]); // Track which books are currently being added

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

        if (savedMode) setViewMode(savedMode);

        fetchBooks();
        fetchCategories();
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
            category: book.category?.name || 'Bilim Kurgu',
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

    const handleImportSearch = async (e) => {
        e.preventDefault();
        if (!importQuery || importQuery.length < 3) {
            toast.error('Lütfen aranacak kitap adını girin');
            return;
        }

        setImporting(true);
        setImportResults([]);

        try {
            let url = `/api/admin/books/fetch-metadata?q=${encodeURIComponent(importQuery)}`;
            if (onlyFree) url += '&filter=free'; // Append filter

            const res = await fetch(url);
            const data = await res.json();

            if (data.success && data.books) {
                setImportResults(data.books);
            } else {
                toast.error('Kitap bulunamadı');
            }
        } catch (error) {
            toast.error('Arama sırasında hata oluştu');
        } finally {
            setImporting(false);
        }
    };

    const handleBulkImport = async () => {
        const booksToAdd = importResults.filter(book => !isBookExists(book.title));

        if (booksToAdd.length === 0) {
            toast.error('Eklenecek yeni kitap bulunamadı (hepsi zaten ekli).');
            return;
        }

        const confirmImport = await confirm({
            title: 'Toplu İçe Aktarım',
            message: `${booksToAdd.length} adet kitap veritabanına eklenecek. Onaylıyor musunuz?`,
            confirmText: `Hepsini Ekle (${booksToAdd.length})`,
            variant: 'primary'
        });

        if (!confirmImport) return;

        const loadingToast = toast.loading(`0/${booksToAdd.length} kitap ekleniyor...`);
        let successCount = 0;

        for (let i = 0; i < booksToAdd.length; i++) {
            const book = booksToAdd[i];

            // Auto-fill Data
            const newBookData = {
                ...initialFormState,
                title: book.title,
                author: book.author,
                description: book.description,
                pages: book.pages,
                year: book.year,
                cover: book.cover || '',
                pdfUrl: book.pdfUrl || '', // Will save empty if no PDF, but user wants automated imports
                visibility: 'PUBLIC'
                // Note: Without a manual cover upload, we rely on the external URL. 
                // Ensure your API/Component handles external image URLs correctly.
            };

            try {
                const res = await fetch('/api/books', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newBookData)
                });

                if (res.ok) successCount++;
            } catch (err) {
                console.error('Bulk import error for:', book.title);
            }

            toast.loading(`${i + 1}/${booksToAdd.length} kitap işlendi...`, { id: loadingToast });
        }

        toast.success(`${successCount} kitap başarıyla eklendi!`, { id: loadingToast });
        fetchBooks(); // Refresh list
        setIsImportModalOpen(false);
    };

    const handleQuickAdd = async (book) => {
        if (isBookExists(book.title)) {
            toast.error('Bu kitap zaten ekli!');
            return;
        }

        setAddingIds(prev => [...prev, book.id || book.title]); // Optimistic UI

        const newBookData = {
            ...initialFormState,
            title: book.title,
            author: book.author,
            description: book.description,
            pages: book.pages,
            year: book.year,
            cover: book.cover || '',
            pdfUrl: book.pdfUrl || '', // If empty, it's allowed on backend, but might be issues on frontend display unless handled.
            visibility: 'PUBLIC'
        };

        try {
            const res = await fetch('/api/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBookData)
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(`"${book.title}" kütüphaneye eklendi! 📚`);
                // Update local list without full refetch
                setBooks(prev => [data.book, ...prev]);
            } else {
                toast.error(data.error || 'Ekleme başarısız');
                setAddingIds(prev => prev.filter(id => id !== (book.id || book.title)));
            }
        } catch (error) {
            console.error('Quick add error:', error);
            toast.error('Bağlantı hatası');
            setAddingIds(prev => prev.filter(id => id !== (book.id || book.title)));
        }
    };

    // Auto-search effect when modal opens empty
    useEffect(() => {
        if (isImportModalOpen && importResults.length === 0 && !importQuery) {
            const autoFetch = async () => {
                setImporting(true);
                try {
                    // wildcard '*' fetches broadly. 
                    const res = await fetch(`/api/admin/books/fetch-metadata?q=*&filter=${onlyFree ? 'free' : ''}`);
                    const data = await res.json();
                    if (data.success && data.books) setImportResults(data.books);
                } catch (e) { } finally { setImporting(false); }
            };
            autoFetch();
        }
    }, [isImportModalOpen, onlyFree]);


    // Check if book exists in current list (simple check by title)
    const isBookExists = (title) => {
        return books.some(b => b.title.toLowerCase() === title.toLowerCase());
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
                            className={`p - 2 rounded ${viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'} `}
                            title="Izgara Görünümü"
                        >
                            <FaThLarge />
                        </button>
                        <button
                            onClick={() => changeViewMode('list')}
                            className={`p - 2 rounded ${viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'} `}
                            title="Liste Görünümü"
                        >
                            <FaList />
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            setImportQuery('');
                            setImportResults([]); // Clear previous results to force auto-fetch
                            setIsImportModalOpen(true);
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-semibold shadow-lg shadow-purple-900/20"
                    >
                        <span className="text-xl">✨</span> <span className="hidden sm:inline">AI Kütüphane</span>
                    </button>
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
                                                unoptimized
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
                                            <span className="text-xs font-bold text-pink-500 uppercase tracking-wider">{book.category?.name || 'Genel'}</span>
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
                                                    {book.cover && <Image src={book.cover} alt={book.title} fill unoptimized className="object-cover" />}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-white">{book.title}</div>
                                                <div className="text-sm">{book.author}</div>
                                            </td>
                                            <td className="p-4 hidden md:table-cell">
                                                <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs border border-gray-700">{book.category?.name || 'Genel'}</span>
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
                                    className={`w - full sm: w - 32 h - 48 bg - gray - 800 rounded - lg flex flex - col items - center justify - center cursor - pointer border - 2 border - dashed border - gray - 600 hover: border - pink - 500 transition - colors relative overflow - hidden group flex - shrink - 0 ${uploading ? 'opacity-50' : ''} `}
                                >
                                    {previewUrl ? (
                                        <Image src={previewUrl} alt="Preview" fill unoptimized className="object-cover" />
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
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-sm text-gray-400">Kitap Adı / ISBN</label>
                                        </div>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-pink-500 transition-colors"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Örn: Sefiller veya 978975... (ISBN)"
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
                                    <label className="block text-sm text-gray-400 mb-1">Kategori</label>
                                    <input
                                        list="category-options"
                                        className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-pink-500 transition-colors"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        placeholder="Kategori Seçin veya Yazın"
                                    />
                                    <datalist id="category-options">
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.name} />
                                        ))}
                                    </datalist>
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
                                    <FaFile className="text-red-500" /> PDF Dosyası (Zorunlu)
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
                                            <FaFile />
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

            {/* AI Import Modal */}
            {isImportModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-gray-900/50 sticky top-0 backdrop-blur z-10 shrink-0">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <span className="text-2xl">✨</span> AI Kitap İçe Aktar
                            </h2>
                            <button onClick={() => setIsImportModalOpen(false)} className="text-gray-400 hover:text-white transition-colors"><FaTimes size={24} /></button>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-gray-800 bg-gray-800/20 space-y-4">
                                <form onSubmit={handleImportSearch} className="flex gap-2">
                                    <input
                                        autoFocus
                                        type="text"
                                        className="flex-1 bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors text-lg"
                                        placeholder="Kitap adı, Yazar, 'Klasikler'..."
                                        value={importQuery}
                                        onChange={(e) => setImportQuery(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        disabled={importing}
                                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white px-8 py-3 rounded-lg font-bold transition-colors flex items-center gap-2"
                                    >
                                        {importing ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                                        Ara
                                    </button>
                                </form>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 text-gray-300 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={onlyFree}
                                            onChange={(e) => setOnlyFree(e.target.checked)}
                                            className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-gray-800"
                                        />
                                        <span className="text-sm">Sadece Ücretsiz PDF'li Kitaplar</span>
                                    </label>

                                    {importResults.length > 0 && (
                                        <button
                                            onClick={handleBulkImport}
                                            className="text-sm font-bold text-green-400 hover:text-green-300 flex items-center gap-2 bg-green-900/20 px-4 py-2 rounded-lg border border-green-500/30 hover:bg-green-900/40 transition-all"
                                        >
                                            <FaCloudUploadAlt /> Tüm Sonuçları Ekle (Bulk)
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Results Area */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {importing ? (
                                    <div className="flex flex-col items-center justify-center h-48 text-purple-400 gap-4">
                                        <FaSpinner className="text-4xl animate-spin" />
                                        <p className="animate-pulse">Sihirli kütüphaneler taranıyor...</p>
                                    </div>
                                ) : importResults.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {importResults.map((book, idx) => {
                                            const exists = isBookExists(book.title);
                                            return (
                                                <div key={idx} className={`bg-black border ${exists ? 'border-red-900/50 opacity-75' : 'border-gray-800 hover:border-purple-500'} rounded-xl p-4 flex gap-4 transition-all group relative overflow-hidden`}>
                                                    {/* Cover */}
                                                    <div className="w-20 h-28 bg-gray-800 rounded-lg flex-shrink-0 relative overflow-hidden">
                                                        {book.cover ? (
                                                            <Image src={book.cover} alt={book.title} fill unoptimized className="object-cover" />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full text-gray-600"><FaBook size={24} /></div>
                                                        )}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0 flex flex-col">
                                                        <h3 className="font-bold text-white line-clamp-2 mb-1" title={book.title}>{book.title}</h3>
                                                        <p className="text-sm text-gray-400 mb-2 truncate">{book.author}</p>

                                                        <div className="mt-auto flex items-center justify-between">
                                                            <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded border border-gray-800">{book.year}</span>

                                                            {exists ? (
                                                                <span className="text-green-500 text-xs font-bold border border-green-900/50 bg-green-900/10 px-2 py-1 rounded flex items-center gap-1"><FaBook /> Kütüphanede</span>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleQuickAdd(book)}
                                                                    disabled={addingIds.includes(book.id || book.title)}
                                                                    className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-all shadow-lg hover:shadow-purple-500/20 flex items-center gap-2 transform active:scale-95 disabled:opacity-50 disabled:cursor-wait"
                                                                >
                                                                    {addingIds.includes(book.id || book.title) ? (
                                                                        <><FaSpinner className="animate-spin" /> Ekleniyor</>
                                                                    ) : (
                                                                        <><FaPlus /> Hızlı Ekle</>
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 text-gray-500">
                                        <FaSearch className="text-4xl mx-auto mb-4 opacity-30" />
                                        <p>Aradığınız kitabı bulmak için yukarıya yazın.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
