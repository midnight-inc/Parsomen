"use client";
import { useState } from 'react';
import { FaImage, FaBook, FaMusic, FaPaperPlane, FaTimes, FaSearch } from 'react-icons/fa';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function CreatePost({ onPostCreated, user }) {
    const [content, setContent] = useState('');
    const [image, setImage] = useState('');
    const [book, setBook] = useState(null);
    const [song, setSong] = useState(null);
    const [loading, setLoading] = useState(false);

    // Modal states
    const [showBookSearch, setShowBookSearch] = useState(false);
    const [bookSearchQuery, setBookSearchQuery] = useState('');
    const [bookResults, setBookResults] = useState([]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        toast.loading("Resim yükleniyor...", { id: 'upload' });
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                setImage(data.url);
                toast.success("Resim eklendi", { id: 'upload' });
            } else throw new Error();
        } catch (e) { toast.error("Hata", { id: 'upload' }); }
    };

    const searchBooks = async (q) => {
        setBookSearchQuery(q);
        if (q.length < 3) return;
        try {
            const res = await fetch(`/api/search?q=${q}&type=book`);
            const data = await res.json();
            setBookResults(data.results || []);
        } catch (e) { }
    };

    const handleSubmit = async () => {
        if (!content && !image && !book && !song) return;
        setLoading(true);
        try {
            const res = await fetch('/api/posts/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    image,
                    bookId: book?.id,
                    song
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Gönderildi!");
                setContent('');
                setImage('');
                setBook(null);
                setSong(null);
                if (onPostCreated) onPostCreated(data.post);
            }
        } catch (e) {
            toast.error("Gönderi paylaşılamadı");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mb-6 backdrop-blur-sm">
            <div className="flex gap-4">
                {/* User Avatar */}
                <div className="shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden relative border border-gray-600">
                        <Image
                            src={user?.avatar || '/default-avatar.png'}
                            alt={user?.username || 'User'}
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>

                <div className="flex-1">
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="Neler düşünüyorsun?"
                        className="w-full bg-transparent text-white placeholder-gray-500 outline-none resize-none min-h-[50px] text-lg pt-2"
                    />

                    {/* Previews */}
                    {image && (
                        <div className="relative w-full h-64 rounded-xl overflow-hidden mb-3 group">
                            <Image src={image} alt="Upload" fill className="object-cover" />
                            <button onClick={() => setImage('')} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white hover:bg-red-500"><FaTimes /></button>
                        </div>
                    )}

                    {book && (
                        <div className="flex items-center gap-3 bg-purple-900/20 border border-purple-500/30 p-3 rounded-lg mb-3 relative">
                            <FaBook className="text-purple-400" />
                            <div>
                                <p className="text-purple-200 text-sm font-bold">{book.title}</p>
                                <p className="text-purple-400/60 text-xs">{book.author}</p>
                            </div>
                            <span className="ml-auto text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">Alıntı</span>
                            <button onClick={() => setBook(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"><FaTimes /></button>
                        </div>
                    )}

                    <div className="flex items-center justify-between border-t border-gray-800 pt-3 mt-2">
                        <div className="flex gap-2 text-purple-400">
                            <label className="p-2 hover:bg-purple-500/10 rounded-full cursor-pointer transition-colors" title="Resim Ekle">
                                <FaImage />
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                            <button onClick={() => setShowBookSearch(true)} className="p-2 hover:bg-purple-500/10 rounded-full transition-colors" title="Kitap Alıntıla">
                                <FaBook />
                            </button>
                            <button className="p-2 hover:bg-purple-500/10 rounded-full transition-colors opacity-50 cursor-not-allowed" title="Müzik Ekle (Yakında)">
                                <FaMusic />
                            </button>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || (!content && !image && !book)}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <FaPaperPlane size={12} /> Paylaş
                        </button>
                    </div>
                </div>
            </div>

            {/* Book Search Modal */}
            {showBookSearch && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-gray-900 w-full max-w-md rounded-xl border border-gray-700 p-4">
                        <h3 className="text-white font-bold mb-4 flex justify-between items-center">
                            Kitap Seç
                            <button onClick={() => setShowBookSearch(false)}><FaTimes /></button>
                        </h3>
                        <div className="relative mb-4">
                            <FaSearch className="absolute left-3 top-3 text-gray-500" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Kitap ara..."
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white outline-none focus:border-purple-500"
                                value={bookSearchQuery}
                                onChange={e => searchBooks(e.target.value)}
                            />
                        </div>
                        <div className="max-h-60 overflow-y-auto space-y-2">
                            {bookResults.map(b => (
                                <button key={b.id} onClick={() => { setBook(b); setShowBookSearch(false); }} className="w-full flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg text-left">
                                    {b.cover ? <Image src={b.cover} width={40} height={60} alt="" className="rounded object-cover" /> : <div className="w-10 h-[60px] bg-gray-700 rounded" />}
                                    <div>
                                        <p className="text-white font-bold text-sm">{b.title}</p>
                                        <p className="text-gray-400 text-xs">{b.author}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
