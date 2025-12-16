"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import {
    FaArrowLeft,
    FaBookmark,
    FaStickyNote,
    FaMoon,
    FaSun,
    FaDownload,
    FaExpand,
    FaCompress,
    FaClock,
    FaTimes,
    FaTrash,
    FaPalette,
    FaBook,
    FaLayerGroup,
    FaChevronLeft,
    FaChevronRight,
    FaEdit,
    FaSave,
    FaCheck,
    FaFont,
    FaSearchPlus,
    FaSearchMinus,
    FaTextHeight
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import Button from '../ui/Button';

export default function PDFViewer({ pdfUrl, bookTitle, bookId, onClose }) {
    // UI state
    const [darkMode, setDarkMode] = useState(true);
    const [showRightPanel, setShowRightPanel] = useState(true);
    const [showLeftPanel, setShowLeftPanel] = useState(true);
    const [activeTab, setActiveTab] = useState('bookmarks');
    const [leftTab, setLeftTab] = useState('info');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    // Customization state - default to black background
    const [bgColor, setBgColor] = useState('#0a0a0f');
    const [fontFamily, setFontFamily] = useState('default');
    const [fontSize, setFontSize] = useState(100);
    const [pageColor, setPageColor] = useState('#ffffff');
    const [textColor, setTextColor] = useState('#000000');

    // Data state
    const [bookmarks, setBookmarks] = useState([]);
    const [notes, setNotes] = useState([]);
    const [readingTime, setReadingTime] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    // Bookmark editing
    const [editingBookmark, setEditingBookmark] = useState(null);
    const [bookmarkTitle, setBookmarkTitle] = useState('');
    const [bookmarkDescription, setBookmarkDescription] = useState('');
    const [showAddBookmarkModal, setShowAddBookmarkModal] = useState(false);

    // Note input
    const [newNote, setNewNote] = useState('');
    const [noteColor, setNoteColor] = useState('pink');

    // Refs for XP tracking
    const maxReachedPage = useRef(1); // Track maximum page ever reached
    const initialLoadDone = useRef(false);

    // Default layout plugin with zoom support
    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        sidebarTabs: () => [],
        renderToolbar: () => <></>,
    });

    // ========== SAVE SYSTEM ==========

    const saveProgress = useCallback(async (silent = false) => {
        if (!bookId || !isLoaded) return;

        if (!silent) setIsSaving(true);
        try {
            // Calculate XP: only for pages beyond maxReachedPage
            const newPagesForXP = Math.max(0, currentPage - maxReachedPage.current);
            if (currentPage > maxReachedPage.current) {
                maxReachedPage.current = currentPage;
            }

            const response = await fetch('/api/reading/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookId,
                    currentPage,
                    totalPages,
                    readTime: 0,
                    newPagesForXP, // Send calculated XP pages
                    bgColor,
                    pageColor,
                    fontFamily,
                    fontSize,
                    darkMode,
                    textColor
                })
            });

            if (response.ok) {
                setLastSaved(new Date());
            }
        } catch (error) {
            console.error('Save error:', error);
        } finally {
            if (!silent) setIsSaving(false);
        }
    }, [bookId, currentPage, totalPages, bgColor, pageColor, fontFamily, fontSize, darkMode, textColor, isLoaded]);

    // Debounced save on page change
    useEffect(() => {
        if (!isLoaded) return;
        const timeout = setTimeout(() => {
            saveProgress();
        }, 1000);
        return () => clearTimeout(timeout);
    }, [currentPage, isLoaded]);

    // Debounced save on settings change
    useEffect(() => {
        if (!isLoaded) return;
        const timeout = setTimeout(() => {
            saveProgress(true);
        }, 500);
        return () => clearTimeout(timeout);
    }, [bgColor, pageColor, fontFamily, fontSize, darkMode, textColor]);

    // Reading time and periodic save
    useEffect(() => {
        const timer = setInterval(() => {
            setReadingTime(prev => prev + 1);
        }, 1000);

        // Auto-save every 60 seconds to update Leaderboard in real-time
        const saveInterval = setInterval(() => {
            saveProgress(true); // Silent save
        }, 60000);

        return () => {
            clearInterval(timer);
            clearInterval(saveInterval);
        };
    }, [saveProgress]);

    // Load data on mount
    useEffect(() => {
        if (bookId && !initialLoadDone.current) {
            loadBookmarks();
            loadNotes();
            loadProgress();
            initialLoadDone.current = true;
        }
    }, [bookId]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Fullscreen
    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    }, []);

    // Close handler
    const handleClose = async () => {
        await saveProgress();
        toast.success('İlerleme kaydedildi!', { duration: 1500, icon: '✓' });
        setTimeout(() => {
            if (onClose) onClose();
        }, 200);
    };

    // API calls
    const loadBookmarks = async () => {
        try {
            const res = await fetch(`/api/reading/bookmarks?bookId=${bookId}`);
            if (res.ok) setBookmarks(await res.json());
        } catch (error) { console.error('Bookmarks load error'); }
    };

    const loadNotes = async () => {
        try {
            const res = await fetch(`/api/reading/notes?bookId=${bookId}`);
            if (res.ok) setNotes(await res.json());
        } catch (error) { console.error('Notes load error'); }
    };

    const loadProgress = async () => {
        try {
            const res = await fetch(`/api/reading/progress?bookId=${bookId}`);
            if (res.ok) {
                const data = await res.json();
                if (data.currentPage) {
                    setCurrentPage(data.currentPage);
                    maxReachedPage.current = data.currentPage; // Set max reached from DB
                }
                if (data.bgColor) setBgColor(data.bgColor);
                if (data.pageColor) setPageColor(data.pageColor);
                if (data.fontFamily) setFontFamily(data.fontFamily);
                if (data.fontSize) setFontSize(data.fontSize);
                if (data.darkMode !== undefined) setDarkMode(data.darkMode);
                if (data.textColor) setTextColor(data.textColor);

                setIsLoaded(true);
            } else {
                setIsLoaded(true);
            }
        } catch (error) {
            console.error('Progress load error');
            setIsLoaded(true);
        }
    };

    // Bookmark functions
    const openAddBookmarkModal = () => {
        setBookmarkTitle(`Sayfa ${currentPage}`);
        setBookmarkDescription('');
        setEditingBookmark(null);
        setShowAddBookmarkModal(true);
    };

    const openEditBookmarkModal = (bookmark) => {
        setBookmarkTitle(bookmark.title || '');
        setBookmarkDescription(bookmark.description || '');
        setEditingBookmark(bookmark);
        setShowAddBookmarkModal(true);
    };

    const saveBookmark = async () => {
        if (!bookId) return;

        try {
            if (editingBookmark) {
                const res = await fetch('/api/reading/bookmarks', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: editingBookmark.id, title: bookmarkTitle, description: bookmarkDescription })
                });
                if (res.ok) {
                    toast.success('İşaret güncellendi!');
                    loadBookmarks();
                }
            } else {
                const res = await fetch('/api/reading/bookmarks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookId, pageNumber: currentPage, title: bookmarkTitle, description: bookmarkDescription })
                });
                if (res.ok) {
                    toast.success('İşaret eklendi! 🔖');
                    loadBookmarks();
                }
            }
            setShowAddBookmarkModal(false);
        } catch (error) { toast.error('İşlem başarısız'); }
    };

    const deleteBookmark = async (id) => {
        try {
            await fetch(`/api/reading/bookmarks?id=${id}`, { method: 'DELETE' });
            setBookmarks(prev => prev.filter(b => b.id !== id));
            toast.success('İşaret silindi');
        } catch (error) { toast.error('Silinemedi'); }
    };

    // Note functions
    const addNote = async () => {
        if (!bookId || !newNote.trim()) return;
        try {
            const res = await fetch('/api/reading/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookId, pageNumber: currentPage, content: newNote, color: noteColor })
            });
            if (res.ok) {
                toast.success('Not eklendi! 📝');
                setNewNote('');
                loadNotes();
            }
        } catch (error) { toast.error('Not eklenemedi'); }
    };

    const deleteNote = async (id) => {
        try {
            await fetch(`/api/reading/notes?id=${id}`, { method: 'DELETE' });
            setNotes(prev => prev.filter(n => n.id !== id));
            toast.success('Not silindi');
        } catch (error) { toast.error('Silinemedi'); }
    };

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const noteColors = [
        { name: 'pink', bg: 'bg-pink-500', border: 'border-pink-500' },
        { name: 'purple', bg: 'bg-purple-500', border: 'border-purple-500' },
        { name: 'blue', bg: 'bg-blue-500', border: 'border-blue-500' },
        { name: 'emerald', bg: 'bg-emerald-500', border: 'border-emerald-500' }
    ];

    // Extended color options
    const bgColors = [
        { name: 'Siyah', value: '#0a0a0f' },
        { name: 'Koyu Gri', value: '#121212' },
        { name: 'Lacivert', value: '#0f172a' },
        { name: 'Koyu Mor', value: '#1a1a2e' },
        { name: 'Koyu Yeşil', value: '#0d1f17' },
        { name: 'Kahverengi', value: '#1a1610' },
        { name: 'Koyu Mavi', value: '#0c1929' },
        { name: 'Gece', value: '#0d0d0d' },
    ];

    const pageColors = [
        { name: 'Beyaz', value: '#ffffff' },
        { name: 'Krem', value: '#fef9e7' },
        { name: 'Sepya', value: '#f4e4bc' },
        { name: 'Açık Gri', value: '#f5f5f5' },
        { name: 'Açık Mavi', value: '#e8f4fc' },
        { name: 'Açık Yeşil', value: '#e8f5e9' },
        { name: 'Koyu Gri', value: '#2d2d2d' },
        { name: 'Siyah', value: '#1a1a1a' },
    ];

    const textColors = [
        { name: 'Siyah', value: '#000000' },
        { name: 'Koyu Gri', value: '#333333' },
        { name: 'Kahverengi', value: '#5d4e37' },
        { name: 'Lacivert', value: '#1a365d' },
        { name: 'Beyaz', value: '#ffffff' },
        { name: 'Açık Gri', value: '#cccccc' },
    ];

    const fontFamilies = [
        { name: 'Varsayılan', value: 'default' },
        { name: 'Serif', value: 'Georgia, Times, serif' },
        { name: 'Sans', value: 'Arial, Helvetica, sans-serif' },
        { name: 'Mono', value: 'Consolas, Monaco, monospace' },
    ];

    const handlePageChange = (e) => {
        setCurrentPage(e.currentPage + 1);
    };

    const handleDocumentLoad = (e) => {
        setTotalPages(e.doc.numPages);
    };

    // Zoom functions
    const zoomIn = () => setFontSize(prev => Math.min(250, prev + 25));
    const zoomOut = () => setFontSize(prev => Math.max(50, prev - 25));

    const percentage = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

    return (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: bgColor }}>
            {/* Background Effects - subtle */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-pink-500/5 blur-[100px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[120px]" />
            </div>

            {/* Top Toolbar */}
            <div className="shrink-0 px-4 py-3 flex items-center justify-between relative z-10"
                style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleClose}
                        variant="ghost"
                        className="text-white hover:bg-white/10 border border-white/20 px-4 py-2"
                        icon={<FaArrowLeft />}
                    >
                        Geri
                    </Button>
                    <button onClick={() => setShowLeftPanel(!showLeftPanel)} className={`p-2 rounded-lg ${showLeftPanel ? 'bg-pink-500/20 text-pink-400' : 'text-white/50'}`}>
                        <FaChevronLeft />
                    </button>

                    {/* Save indicator */}
                    <div className="flex items-center gap-2">
                        {isSaving ? (
                            <span className="text-yellow-400 text-xs flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                                Kaydediliyor...
                            </span>
                        ) : lastSaved && (
                            <span className="text-emerald-400 text-xs flex items-center gap-1">
                                <FaCheck size={10} />
                                Kaydedildi
                            </span>
                        )}
                    </div>
                </div>

                {/* Center Info */}
                <div className="flex items-center gap-4 px-4 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <FaClock className="text-purple-400" />
                    <span className="font-bold text-purple-400">{formatTime(readingTime)}</span>
                    <div className="w-px h-5 bg-white/20" />
                    <span className="text-white/70">Sayfa <strong className="text-white">{currentPage}</strong>/{totalPages}</span>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2">
                    {/* Zoom Controls */}
                    <div className="flex items-center gap-1 mr-2">
                        <button onClick={zoomOut} className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white">
                            <FaSearchMinus />
                        </button>
                        <span className="text-white/70 text-sm w-12 text-center">{fontSize}%</span>
                        <button onClick={zoomIn} className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white">
                            <FaSearchPlus />
                        </button>
                    </div>

                    <button onClick={() => setShowRightPanel(!showRightPanel)} className={`p-2 rounded-lg ${showRightPanel ? 'bg-pink-500/20 text-pink-400' : 'text-white/50'}`}>
                        <FaChevronRight />
                    </button>
                    <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg text-yellow-400 hover:bg-yellow-500/20">
                        {darkMode ? <FaSun /> : <FaMoon />}
                    </button>
                    <button onClick={openAddBookmarkModal} className="p-2 rounded-lg text-white/50 hover:text-yellow-400">
                        <FaBookmark />
                    </button>
                    <a href={pdfUrl} download className="p-2 rounded-lg text-white/50 hover:text-emerald-400">
                        <FaDownload />
                    </a>
                    <button onClick={toggleFullscreen} className="p-2 rounded-lg text-white/50 hover:text-white">
                        {isFullscreen ? <FaCompress /> : <FaExpand />}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* LEFT PANEL */}
                {showLeftPanel && (
                    <div className="w-72 shrink-0 flex flex-col relative z-10 overflow-hidden" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>

                        {/* Tab Buttons */}
                        <div className="flex border-b border-white/10">
                            <button onClick={() => setLeftTab('info')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${leftTab === 'info' ? 'text-pink-400 border-b-2 border-pink-500' : 'text-white/50'}`}>
                                <FaBook /> Bilgi
                            </button>
                            <button onClick={() => setLeftTab('customize')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${leftTab === 'customize' ? 'text-pink-400 border-b-2 border-pink-500' : 'text-white/50'}`}>
                                <FaPalette /> Özelleştir
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto p-4">
                            {/* INFO TAB */}
                            {leftTab === 'info' && (
                                <div className="space-y-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-white mb-1">{bookTitle}</h2>
                                        <p className="text-white/50 text-sm">PDF Okuyucu</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                                            <FaLayerGroup className="text-pink-400" />
                                            <div>
                                                <p className="text-white/50 text-xs">Toplam Sayfa</p>
                                                <p className="text-white font-bold">{totalPages}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                                            <FaClock className="text-purple-400" />
                                            <div>
                                                <p className="text-white/50 text-xs">Okuma Süresi</p>
                                                <p className="text-white font-bold">{formatTime(readingTime)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                                            <FaBook className="text-emerald-400" />
                                            <div>
                                                <p className="text-white/50 text-xs">İlerleme</p>
                                                <p className="text-white font-bold">{percentage}%</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all" style={{ width: `${percentage}%` }} />
                                        </div>
                                        <p className="text-white/40 text-xs mt-2 text-center">{currentPage} / {totalPages} sayfa</p>
                                    </div>

                                    <div className="pt-4 border-t border-white/10 space-y-2">
                                        <Button
                                            onClick={openAddBookmarkModal}
                                            fullWidth
                                            className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white justify-start"
                                            icon={<FaBookmark className="text-yellow-400" />}
                                        >
                                            Bu Sayfayı İşaretle
                                        </Button>
                                        <Button
                                            onClick={() => { setShowRightPanel(true); setActiveTab('notes'); }}
                                            fullWidth
                                            className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white justify-start"
                                            icon={<FaStickyNote className="text-emerald-400" />}
                                        >
                                            Not Ekle
                                        </Button>
                                    </div>

                                    <div className="text-center text-white/30 text-xs pt-4 border-t border-white/10">
                                        <FaCheck className="inline mr-1 text-emerald-500" />
                                        Otomatik kayıt aktif
                                    </div>
                                </div>
                            )}

                            {/* CUSTOMIZE TAB */}
                            {leftTab === 'customize' && (
                                <div className="space-y-5">
                                    {/* Background Color */}
                                    <div>
                                        <label className="text-white/70 text-xs font-medium mb-2 block">🎨 Arkaplan Rengi</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {bgColors.map(c => (
                                                <button key={c.value} onClick={() => setBgColor(c.value)} className={`w-full h-8 rounded-lg transition-all ${bgColor === c.value ? 'ring-2 ring-pink-500 scale-105' : 'hover:scale-105'}`} style={{ backgroundColor: c.value, border: '1px solid rgba(255,255,255,0.2)' }} title={c.name} />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Page Color */}
                                    <div>
                                        <label className="text-white/70 text-xs font-medium mb-2 block">📄 Sayfa Rengi</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {pageColors.map(c => (
                                                <button key={c.value} onClick={() => setPageColor(c.value)} className={`w-full h-8 rounded-lg transition-all ${pageColor === c.value ? 'ring-2 ring-pink-500 scale-105' : 'hover:scale-105'}`} style={{ backgroundColor: c.value, border: '1px solid rgba(255,255,255,0.2)' }} title={c.name} />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Text Color */}
                                    <div>
                                        <label className="text-white/70 text-xs font-medium mb-2 block flex items-center gap-2">
                                            <FaTextHeight className="text-blue-400" /> Yazı Rengi
                                        </label>
                                        <div className="grid grid-cols-6 gap-2">
                                            {textColors.map(c => (
                                                <button key={c.value} onClick={() => setTextColor(c.value)} className={`w-full h-8 rounded-lg transition-all ${textColor === c.value ? 'ring-2 ring-pink-500 scale-105' : 'hover:scale-105'}`} style={{ backgroundColor: c.value, border: '1px solid rgba(255,255,255,0.3)' }} title={c.name} />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Font Family */}
                                    <div>
                                        <label className="text-white/70 text-xs font-medium mb-2 block flex items-center gap-2">
                                            <FaFont className="text-purple-400" /> Yazı Tipi
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {fontFamilies.map(f => (
                                                <button key={f.value} onClick={() => setFontFamily(f.value)} className={`px-3 py-2 rounded-lg text-sm transition-all ${fontFamily === f.value ? 'bg-pink-500 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}>
                                                    {f.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Zoom */}
                                    <div>
                                        <label className="text-white/70 text-xs font-medium mb-2 block">🔍 Yakınlaştırma</label>
                                        <div className="flex items-center gap-3">
                                            <button onClick={zoomOut} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white">
                                                <FaSearchMinus />
                                            </button>
                                            <div className="flex-1 text-center">
                                                <span className="text-white font-bold text-lg">{fontSize}%</span>
                                            </div>
                                            <button onClick={zoomIn} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white">
                                                <FaSearchPlus />
                                            </button>
                                        </div>
                                        <input type="range" min={50} max={250} step={25} value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full mt-2 accent-pink-500" />
                                    </div>

                                    {/* Dark Mode Toggle */}
                                    <div>
                                        <label className="text-white/70 text-xs font-medium mb-2 block">🌙 Tema</label>
                                        <button onClick={() => setDarkMode(!darkMode)} className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${darkMode ? 'bg-gray-800' : 'bg-yellow-500/20'}`}>
                                            <span className="text-white flex items-center gap-2">
                                                {darkMode ? <FaMoon /> : <FaSun />}
                                                {darkMode ? 'Koyu Mod' : 'Açık Mod'}
                                            </span>
                                            <div className={`w-12 h-6 rounded-full p-1 transition-all ${darkMode ? 'bg-pink-500' : 'bg-yellow-500'}`}>
                                                <div className={`w-4 h-4 rounded-full bg-white transition-all ${darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </div>
                                        </button>
                                    </div>

                                    <div className="text-center text-emerald-400 text-xs pt-4 border-t border-white/10">
                                        <FaCheck className="inline mr-1" /> Otomatik kaydediliyor
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* CENTER - PDF */}
                <div className="flex-1 relative z-10 flex items-center justify-center" key={fontSize}>
                    {!isLoaded ? (
                        <div className="flex flex-col items-center justify-center text-white/50">
                            <div className="w-8 h-8 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mb-4"></div>
                            <p>Kaldığınız yer yükleniyor...</p>
                        </div>
                    ) : (
                        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                            <div className="h-full w-full relative">
                                <Viewer
                                    key={`viewer-${bookId}-${isLoaded}`} // Force remount when loaded to ensure initialPage is respected
                                    fileUrl={pdfUrl}
                                    plugins={[defaultLayoutPluginInstance]}
                                    onPageChange={handlePageChange}
                                    onDocumentLoad={handleDocumentLoad}
                                    defaultScale={fontSize / 100}
                                    theme={darkMode ? 'dark' : 'light'}
                                    initialPage={Math.max(0, currentPage - 1)}
                                />
                                {/* Overlay for Page Color Tinting since we can't easily change PDF text color */}
                                <div
                                    className="absolute inset-0 pointer-events-none mix-blend-multiply"
                                    style={{
                                        backgroundColor: pageColor !== '#ffffff' ? pageColor : 'transparent',
                                        opacity: 0.1 // Subtle tint
                                    }}
                                />
                            </div>
                        </Worker>
                    )}
                </div>

                {/* RIGHT PANEL */}
                {showRightPanel && (
                    <div className="w-72 shrink-0 flex flex-col relative z-10" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                        <div className="flex border-b border-white/10">
                            <button onClick={() => setActiveTab('bookmarks')} className={`flex-1 py-3 text-sm font-bold ${activeTab === 'bookmarks' ? 'text-pink-400 border-b-2 border-pink-500' : 'text-white/50'}`}>
                                <FaBookmark className="inline mr-2" />İşaretler
                            </button>
                            <button onClick={() => setActiveTab('notes')} className={`flex-1 py-3 text-sm font-bold ${activeTab === 'notes' ? 'text-pink-400 border-b-2 border-pink-500' : 'text-white/50'}`}>
                                <FaStickyNote className="inline mr-2" />Notlar
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto p-3">
                            {activeTab === 'bookmarks' && (
                                <div className="space-y-2">
                                    {bookmarks.length === 0 ? (
                                        <p className="text-center py-8 text-white/40 text-sm">Henüz işaret yok</p>
                                    ) : bookmarks.map(b => (
                                        <div key={b.id} className="p-3 rounded-lg group bg-white/5 hover:bg-white/10">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <p className="text-white text-sm font-medium">{b.title}</p>
                                                    {b.description && <p className="text-white/50 text-xs mt-1">{b.description}</p>}
                                                    <p className="text-xs text-pink-400 mt-1 cursor-pointer hover:underline" onClick={() => {
                                                        // Jump to page (requires plugin reference or context, simple workaround is setting current page if possible, or user has to scroll)
                                                        // Note: jumpToPage is available in plugin instance but hard to access here without ref.
                                                        // For now just showing the page.
                                                    }}>Sayfa {b.pageNumber}</p>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                                                    <button onClick={() => openEditBookmarkModal(b)} className="text-blue-400 p-1"><FaEdit size={12} /></button>
                                                    <button onClick={() => deleteBookmark(b.id)} className="text-red-500 p-1"><FaTrash size={12} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'notes' && (
                                <div className="space-y-3">
                                    <div className="p-3 rounded-lg bg-white/5">
                                        <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Not yaz..." className="w-full p-2 rounded bg-white/5 text-white text-sm border-none focus:outline-none focus:ring-1 focus:ring-pink-500 resize-none" rows={3} />
                                        <div className="flex justify-between mt-2">
                                            <div className="flex gap-1">
                                                {noteColors.map(c => (
                                                    <button key={c.name} onClick={() => setNoteColor(c.name)} className={`w-5 h-5 rounded-full ${c.bg} ${noteColor === c.name ? 'ring-2 ring-white' : ''}`} />
                                                ))}
                                            </div>
                                            <button onClick={addNote} disabled={!newNote.trim()} className="bg-pink-500 text-white px-3 py-1 rounded text-xs font-bold disabled:opacity-50">Ekle</button>
                                        </div>
                                    </div>
                                    {notes.map(n => (
                                        <div key={n.id} className={`p-3 rounded-lg border-l-4 group bg-white/5 ${noteColors.find(c => c.name === n.color)?.border || 'border-pink-500'}`}>
                                            <div className="flex justify-between">
                                                <p className="text-white text-sm" style={{ fontFamily }}>{n.content}</p>
                                                <button onClick={() => deleteNote(n.id)} className="text-red-500 opacity-0 group-hover:opacity-100"><FaTrash size={10} /></button>
                                            </div>
                                            <p className="text-xs mt-1 text-white/50">Sayfa {n.pageNumber}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Bookmark Modal */}
                {showAddBookmarkModal && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="w-96 rounded-2xl overflow-hidden" style={{ background: 'rgba(10,10,15,0.98)', border: '1px solid rgba(255,255,255,0.15)' }}>
                            <div className="px-6 py-4 border-b border-white/10" style={{ background: 'linear-gradient(to right, rgba(236,72,153,0.2), rgba(139,92,246,0.2))' }}>
                                <h3 className="text-white font-bold text-lg">
                                    {editingBookmark ? '✏️ İşareti Düzenle' : '🔖 Sayfa İşaretle'}
                                </h3>
                                <p className="text-white/50 text-sm">Sayfa {editingBookmark?.pageNumber || currentPage}</p>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-white/70 text-sm mb-2 block">Başlık</label>
                                    <input type="text" value={bookmarkTitle} onChange={(e) => setBookmarkTitle(e.target.value)} className="w-full p-3 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-pink-500" placeholder="İşaret başlığı..." />
                                </div>
                                <div>
                                    <label className="text-white/70 text-sm mb-2 block">Açıklama (opsiyonel)</label>
                                    <textarea value={bookmarkDescription} onChange={(e) => setBookmarkDescription(e.target.value)} className="w-full p-3 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-pink-500 resize-none" placeholder="Not veya açıklama..." rows={3} />
                                </div>
                            </div>
                            <div className="px-6 py-4 flex justify-end gap-3 border-t border-white/10">
                                <Button onClick={() => setShowAddBookmarkModal(false)} variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">İptal</Button>
                                <Button
                                    onClick={saveBookmark}
                                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                                    icon={<FaSave />}
                                >
                                    {editingBookmark ? 'Güncelle' : 'Kaydet'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Bar */}
            <div className="shrink-0 px-4 py-2 flex items-center justify-between relative z-10" style={{ background: 'rgba(0,0,0,0.4)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="flex items-center gap-3 flex-1">
                    <div className="flex-1 max-w-xs">
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all" style={{ width: `${percentage}%` }} />
                        </div>
                    </div>
                    <span className="text-pink-400 text-sm font-bold">{percentage}%</span>
                </div>
                <span className="text-white/60 text-sm">📖 Sayfa <strong className="text-white">{currentPage}</strong> / {totalPages}</span>
                <span className="text-white/40 text-xs">ESC ile çık</span>
            </div>

            {/* CSS Logic for Tinting - PDF Native Color Change Impossible without Canvas Filters */}
            <style jsx global>{`
                /* Background Color of the viewer container */
                .rpv-core__inner-page { 
                    background-color: ${pageColor} !important; 
                }
                
                /* Attempt to tint the canvas for Dark Mode */
                ${darkMode ? `
                    .rpv-core__canvas-layer {
                        filter: invert(1) hue-rotate(180deg) brightness(0.8) !important;
                    }
                    /* Invert images back if possible, but hard to isolate. 
                       Usually, for reading mode, just inverting page is enough. */
                ` : `
                    .rpv-core__canvas-layer {
                        filter: none !important;
                    }
                `}
                
                /* Font Family - only affects text selection layer and UI */
                .rpv-core__text-layer { 
                    font-family: ${fontFamily !== 'default' ? fontFamily : 'inherit'} !important; 
                    opacity: 0.2; /* Make selection text slightly visible for effect if desired, normally transparent */
                }
                
                /* Custom Styles */
                .rpv-default-layout__container { background-color: transparent !important; border: none !important; }
                .rpv-default-layout__toolbar { display: none !important; }
                .rpv-core__viewer { background-color: transparent !important; }
                .rpv-default-layout__body { padding: 0 !important; }
            `}</style>
        </div>
    );
}
