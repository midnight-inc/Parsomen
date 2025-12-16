"use client";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaEnvelope, FaPaperPlane, FaSearch, FaInbox, FaSpinner, FaPlus, FaTimes, FaSmile, FaImage, FaFilePdf } from 'react-icons/fa';
import toast from 'react-hot-toast';

// Extended emoji list
const EMOJI_CATEGORIES = {
    'Yüzler': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐'],
    'Jestler': ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '💪'],
    'Kalpler': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
    'Semboller': ['⭐', '🌟', '✨', '💫', '🔥', '💥', '💯', '✅', '❌', '❓', '❗', '💬', '💭', '🎵', '🎶', '📚', '📖', '📕', '📗', '📘', '📙', '📔', '📒', '📓', '📰', '🔖', '🏷️'],
    'Aktiviteler': ['🎉', '🎊', '🎁', '🎈', '🎂', '🍰', '🥂', '🍾', '☕', '🍵', '🍺', '🍻', '🥤', '🎮', '🎯', '🎨', '🎭', '🎪', '🎬', '🎤', '🎧', '🎹', '🎸', '🎺', '🎻', '🥁']
};

export default function MessagesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // User search state
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    // Media state
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [gifSearch, setGifSearch] = useState('');
    const [gifs, setGifs] = useState([]);
    const [trendingGifs, setTrendingGifs] = useState([]);
    const [loadingGifs, setLoadingGifs] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [selectedEmojiCategory, setSelectedEmojiCategory] = useState('Yüzler');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user]);

    useEffect(() => {
        if (selectedConv) {
            fetchMessages(selectedConv.partnerId);
        }
    }, [selectedConv]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.length >= 2) {
                searchUsers();
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Load trending GIFs on picker open
    useEffect(() => {
        if (showGifPicker && trendingGifs.length === 0) {
            loadTrendingGifs();
        }
    }, [showGifPicker]);

    // GIF search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (gifSearch.length >= 2) {
                searchGifs();
            } else if (gifSearch.length === 0) {
                setGifs([]);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [gifSearch]);

    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/messages');
            const data = await res.json();
            if (data.success) {
                setConversations(data.conversations || []);
            }
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (partnerId) => {
        try {
            const res = await fetch(`/api/messages/${partnerId}`);
            const data = await res.json();
            if (data.success) {
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const searchUsers = async () => {
        setSearching(true);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=users`);
            const data = await res.json();
            if (data.success) {
                const filtered = (data.users || []).filter(u => u.id !== user?.id);
                setSearchResults(filtered);
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setSearching(false);
        }
    };

    const loadTrendingGifs = async () => {
        setLoadingGifs(true);
        try {
            const res = await fetch('https://api.giphy.com/v1/gifs/trending?api_key=GlVGYHkr3WSBnllca54iNt0yFbjz7L65&limit=20&rating=g');
            const data = await res.json();
            setTrendingGifs(data.data || []);
        } catch (error) {
            console.error('Trending GIFs failed:', error);
        } finally {
            setLoadingGifs(false);
        }
    };

    const searchGifs = async () => {
        setLoadingGifs(true);
        try {
            const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=GlVGYHkr3WSBnllca54iNt0yFbjz7L65&q=${encodeURIComponent(gifSearch)}&limit=20&rating=g`);
            const data = await res.json();
            setGifs(data.data || []);
        } catch (error) {
            console.error('GIF search failed:', error);
        } finally {
            setLoadingGifs(false);
        }
    };

    const startConversation = (selectedUser) => {
        const existing = conversations.find(c => c.partnerId === selectedUser.id);
        if (existing) {
            setSelectedConv(existing);
        } else {
            setSelectedConv({
                partnerId: selectedUser.id,
                partner: selectedUser,
                lastMessage: null,
                unreadCount: 0
            });
            setMessages([]);
        }
        setShowSearch(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleSendMessage = async (e) => {
        e?.preventDefault();
        if ((!newMessage.trim() && !selectedMedia) || !selectedConv || sending) return;

        setSending(true);
        try {
            const payload = {
                receiverId: parseInt(selectedConv.partnerId, 10), // Ensure it's a number
                content: newMessage.trim() || null,
                mediaType: selectedMedia?.type || null,
                mediaUrl: selectedMedia?.url || null
            };

            console.log('Sending message:', payload);

            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            console.log('Response:', data);

            if (data.success) {
                setMessages(prev => [...prev, data.message]);
                setNewMessage('');
                setSelectedMedia(null);
                fetchConversations();
            } else {
                toast.error(data.error || 'Mesaj gönderilemedi');
            }
        } catch (error) {
            console.error('Send error:', error);
            toast.error('Bağlantı hatası');
        } finally {
            setSending(false);
        }
    };

    const handleEmojiSelect = (emoji) => {
        setNewMessage(prev => prev + emoji);
    };

    const handleGifSelect = (gif) => {
        setSelectedMedia({
            type: 'gif',
            url: gif.images.fixed_height.url,
            name: 'GIF'
        });
        setShowGifPicker(false);
        setGifSearch('');
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const isPdf = file.type === 'application/pdf';
        const isImage = file.type.startsWith('image/');

        if (!isPdf && !isImage) {
            toast.error('Sadece resim veya PDF yüklenebilir');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Dosya 5MB\'dan büyük olamaz');
            return;
        }

        // Create blob URL for preview (in production, upload to server)
        const blobUrl = URL.createObjectURL(file);
        setSelectedMedia({
            type: isPdf ? 'pdf' : 'image',
            url: blobUrl,
            name: file.name
        });
    };

    const formatTime = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;

        if (diff < 60000) return 'Az önce';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}dk`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}sa`;
        return d.toLocaleDateString('tr-TR');
    };

    const renderMessageContent = (msg) => (
        <div>
            {msg.mediaType === 'gif' && msg.mediaUrl && (
                <img src={msg.mediaUrl} alt="GIF" className="rounded-lg max-w-full mb-1" style={{ maxHeight: '200px' }} />
            )}
            {msg.mediaType === 'image' && msg.mediaUrl && (
                <img src={msg.mediaUrl} alt="Resim" className="rounded-lg max-w-full mb-1" style={{ maxHeight: '200px' }} />
            )}
            {msg.mediaType === 'pdf' && msg.mediaUrl && (
                <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg mb-1 hover:bg-white/20">
                    <FaFilePdf className="text-red-400" />
                    <span className="text-sm">PDF Dosyası</span>
                </a>
            )}
            {msg.content && <p className="break-words">{msg.content}</p>}
        </div>
    );

    if (authLoading || !user) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const displayGifs = gifSearch.length >= 2 ? gifs : trendingGifs;

    return (
        <div className="min-h-screen pt-20 pb-6 px-4 sm:px-8 max-w-7xl mx-auto">
            <div className="mb-3">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <FaEnvelope className="text-purple-400" />
                    Mesajlar
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-140px)]">
                {/* Conversations List */}
                <div className="lg:col-span-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <h2 className="font-bold text-white">Sohbetler</h2>
                        <button
                            onClick={() => setShowSearch(!showSearch)}
                            className={`p-2 rounded-lg transition-colors ${showSearch ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-white/10 text-gray-400'}`}
                        >
                            {showSearch ? <FaTimes /> : <FaPlus />}
                        </button>
                    </div>

                    {showSearch && (
                        <div className="p-3 border-b border-white/10 bg-white/5">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Kullanıcı ara..."
                                    className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500/50 outline-none"
                                    autoFocus
                                />
                            </div>

                            {searchQuery.length >= 2 && (
                                <div className="mt-2 max-h-48 overflow-y-auto">
                                    {searching ? (
                                        <div className="flex justify-center py-4"><FaSpinner className="animate-spin text-purple-500" /></div>
                                    ) : searchResults.length > 0 ? (
                                        <div className="space-y-1">
                                            {searchResults.map(u => (
                                                <button key={u.id} onClick={() => startConversation(u)} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 text-left">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600/30 to-blue-600/30 border border-purple-500/30 flex items-center justify-center text-sm overflow-hidden">
                                                        {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : u.username?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">{u.username}</p>
                                                        <p className="text-xs text-gray-500">Seviye {u.level || 1}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : <p className="text-center text-gray-500 text-sm py-4">Kullanıcı bulunamadı</p>}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center h-32"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>
                        ) : conversations.length === 0 && !showSearch ? (
                            <div className="text-center py-12 px-4">
                                <FaInbox className="text-4xl text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-500">Henüz mesajın yok</p>
                                <button onClick={() => setShowSearch(true)} className="text-sm text-purple-400 hover:text-purple-300 mt-2">Yeni sohbet başlat →</button>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {conversations.map((conv) => (
                                    <button key={conv.partnerId} onClick={() => setSelectedConv(conv)} className={`w-full p-4 flex items-center gap-3 hover:bg-white/5 text-left ${selectedConv?.partnerId === conv.partnerId ? 'bg-white/10' : ''}`}>
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600/30 to-blue-600/30 border border-purple-500/30 flex items-center justify-center text-lg overflow-hidden">
                                                {conv.partner.avatar ? <img src={conv.partner.avatar} alt="" className="w-full h-full object-cover" /> : conv.partner.username?.charAt(0).toUpperCase()}
                                            </div>
                                            {conv.unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">{conv.unreadCount}</span>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-white truncate">{conv.partner.username}</p>
                                            <p className="text-sm text-gray-500 truncate">{conv.lastMessage?.mediaType ? '📎 Medya' : conv.lastMessage?.content || 'Mesaj yok'}</p>
                                        </div>
                                        {conv.lastMessage && <span className="text-xs text-gray-600">{formatTime(conv.lastMessage.createdAt)}</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                    {selectedConv ? (
                        <>
                            <div className="p-4 border-b border-white/10 flex items-center gap-3">
                                <Link href={`/profile/${selectedConv.partner.username}`} className="flex items-center gap-3 hover:opacity-80">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600/30 to-blue-600/30 border border-purple-500/30 flex items-center justify-center overflow-hidden">
                                        {selectedConv.partner.avatar ? <img src={selectedConv.partner.avatar} alt="" className="w-full h-full object-cover" /> : selectedConv.partner.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-bold text-white">{selectedConv.partner.username}</span>
                                </Link>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {messages.length === 0 ? (
                                    <div className="text-center py-12"><p className="text-gray-500">Henüz mesaj yok. İlk mesajı gönder!</p></div>
                                ) : (
                                    messages.map((msg) => (
                                        <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${msg.senderId === user?.id ? 'bg-purple-600/40 text-white rounded-tr-sm' : 'bg-white/10 text-gray-200 rounded-tl-sm'}`}>
                                                {renderMessageContent(msg)}
                                                <p className="text-[10px] text-gray-400 mt-1 text-right">{formatTime(msg.createdAt)}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {selectedMedia && (
                                <div className="px-4 py-2 border-t border-white/10 bg-white/5">
                                    <div className="flex items-center gap-3">
                                        {selectedMedia.type === 'gif' && <img src={selectedMedia.url} alt="GIF" className="h-16 rounded" />}
                                        {selectedMedia.type === 'image' && <img src={selectedMedia.url} alt="Resim" className="h-16 rounded" />}
                                        {selectedMedia.type === 'pdf' && (
                                            <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded">
                                                <FaFilePdf className="text-red-400" /><span className="text-sm text-white">{selectedMedia.name}</span>
                                            </div>
                                        )}
                                        <button onClick={() => setSelectedMedia(null)} className="text-red-400 hover:text-red-300"><FaTimes /></button>
                                    </div>
                                </div>
                            )}

                            {showEmojiPicker && (
                                <div className="px-4 py-3 border-t border-white/10 bg-white/5">
                                    <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
                                        {Object.keys(EMOJI_CATEGORIES).map(cat => (
                                            <button key={cat} onClick={() => setSelectedEmojiCategory(cat)} className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${selectedEmojiCategory === cat ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400'}`}>{cat}</button>
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                                        {EMOJI_CATEGORIES[selectedEmojiCategory].map((emoji, i) => (
                                            <button key={i} onClick={() => handleEmojiSelect(emoji)} className="text-xl hover:scale-125 transition-transform p-1">{emoji}</button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {showGifPicker && (
                                <div className="px-4 py-3 border-t border-white/10 bg-white/5">
                                    <input
                                        type="text"
                                        value={gifSearch}
                                        onChange={(e) => setGifSearch(e.target.value)}
                                        placeholder="GIF ara... (Giphy)"
                                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 mb-2 text-sm"
                                        autoFocus
                                    />
                                    <p className="text-xs text-gray-500 mb-2">{gifSearch.length >= 2 ? 'Arama Sonuçları' : 'Trend GIF\'ler'}</p>
                                    {loadingGifs ? (
                                        <div className="flex justify-center py-4"><FaSpinner className="animate-spin text-purple-500" /></div>
                                    ) : (
                                        <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                                            {displayGifs.map(gif => (
                                                <button key={gif.id} onClick={() => handleGifSelect(gif)} className="hover:opacity-80 rounded overflow-hidden">
                                                    <img src={gif.images.fixed_height_small.url} alt="" className="w-full h-16 object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-[10px] text-gray-600 mt-2 text-center">Powered by GIPHY</p>
                                </div>
                            )}

                            <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10">
                                <div className="flex gap-2 items-center">
                                    <div className="flex gap-1">
                                        <button type="button" onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowGifPicker(false); }} className={`p-2 rounded-lg ${showEmojiPicker ? 'bg-yellow-500/20 text-yellow-400' : 'hover:bg-white/10 text-gray-400'}`} title="Emoji"><FaSmile /></button>
                                        <button type="button" onClick={() => { setShowGifPicker(!showGifPicker); setShowEmojiPicker(false); }} className={`p-2 rounded-lg text-xs font-bold ${showGifPicker ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-white/10 text-gray-400'}`} title="GIF">GIF</button>
                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-lg hover:bg-white/10 text-gray-400" title="Resim/PDF"><FaImage /></button>
                                        <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleFileSelect} className="hidden" />
                                    </div>

                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Mesaj yaz..."
                                        maxLength={2000}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500/50 outline-none"
                                    />
                                    <button type="submit" disabled={(!newMessage.trim() && !selectedMedia) || sending} className="px-4 py-2.5 bg-purple-600/80 hover:bg-purple-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl">
                                        {sending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <FaEnvelope className="text-5xl text-gray-700 mx-auto mb-4" />
                                <p className="text-gray-500">Sohbet seçin veya yeni bir sohbet başlatın</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
