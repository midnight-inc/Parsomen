"use client";
import { useState, useEffect } from 'react';
import { FaUserPlus, FaUserFriends, FaCheck, FaTimes, FaSearch, FaSpinner, FaTrash, FaEnvelope, FaCommentAlt, FaGift } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { confirm } from '@/components/ui/ConfirmModal';
import Link from 'next/link';

export default function FriendsPage() {
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchUsername, setSearchUsername] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchResults, setSearchResults] = useState(null); // null when not searching
    const [activeTab, setActiveTab] = useState('friends');

    useEffect(() => {
        fetchFriends();
    }, []);

    const fetchFriends = async () => {
        try {
            const res = await fetch('/api/friends');
            const data = await res.json();
            if (data.success) {
                setFriends(data.friends);
                setPendingRequests(data.pendingRequests);
                setSentRequests(data.sentRequests);
            }
        } catch (error) {
            console.error('Failed to fetch friends:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchUsername.trim()) return;
        setSearching(true);
        setSearchResults(null);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(searchUsername)}`);
            const data = await res.json();
            if (data.success) {
                setSearchResults(data.users || []);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error(error);
            toast.error('Arama hatası');
        } finally {
            setSearching(false);
        }
    };

    const sendFriendRequest = async (targetUsername) => {
        const userToAdd = targetUsername || searchUsername;
        if (!userToAdd.trim()) return;

        try {
            const res = await fetch('/api/friends', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: userToAdd })
            });

            const data = await res.json();
            if (data.success) {
                toast.success(`Arkadaşlık isteği gönderildi: ${userToAdd}`);
                if (!targetUsername) setSearchUsername(''); // Clear only if direct add
                fetchFriends();
            } else {
                toast.error(data.error || 'İstek gönderilemedi');
            }
        } catch (error) {
            toast.error('Bağlantı hatası');
        }
    };

    const handleRequest = async (requestId, action) => {
        try {
            const res = await fetch('/api/friends', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId, action })
            });

            const data = await res.json();
            if (data.success) {
                toast.success(action === 'accept' ? 'Arkadaş eklendi!' : 'İstek reddedildi');
                fetchFriends();
            }
        } catch (error) {
            toast.error('İşlem başarısız');
        }
    };

    const removeFriend = async (friendshipId) => {
        const confirmed = await confirm({
            title: 'Arkadaşlığı Sil',
            message: 'Arkadaşlığı silmek istediğinize emin misiniz?',
            confirmText: 'Sil',
            cancelText: 'İptal',
            variant: 'danger'
        });
        if (!confirmed) return;

        try {
            const res = await fetch('/api/friends', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ friendshipId })
            });

            const data = await res.json();
            if (data.success) {
                toast.success('Arkadaş silindi');
                fetchFriends();
            } else {
                toast.error('Silme başarısız');
            }
        } catch (error) {
            toast.error('Bir hata oluştu');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <FaSpinner className="text-4xl text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 px-4 sm:px-8 max-w-[1200px] mx-auto text-white pb-20">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                    Arkadaşlar
                </h1>
                <p className="text-gray-400">Arkadaşlarınızı yönetin ve yeni arkadaşlar ekleyin</p>
            </div>

            {/* Add Friend & Search */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FaUserPlus className="text-green-500" /> Arkadaş Bul & Ekle
                </h2>
                <div className="flex gap-3 mb-4">
                    <div className="flex-1 relative">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            value={searchUsername}
                            onChange={(e) => setSearchUsername(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Kullanıcı adı ara..."
                            className="w-full bg-black border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white focus:border-green-500 focus:outline-none"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={searching || !searchUsername.trim()}
                        className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {searching ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                        Ara
                    </button>
                </div>

                {/* Search Results */}
                {searchResults && (
                    <div className="bg-black/50 rounded-xl p-4 border border-gray-800 animate-in fade-in slide-in-from-top-2">
                        <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Sonuçlar</h3>
                        {searchResults.length > 0 ? (
                            <div className="space-y-3">
                                {searchResults.map(user => (
                                    <div key={user.id} className="flex items-center justify-between bg-gray-900 p-3 rounded-lg border border-gray-800">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">{user.username}</div>
                                                <div className="text-xs text-gray-500">{user.role === 'ADMIN' ? 'Yönetici' : 'Üye'}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => sendFriendRequest(user.username)}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <FaUserPlus /> Ekle
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-4">
                                <p>"{searchUsername}" ile eşleşen kullanıcı bulunamadı.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('friends')}
                    className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'friends' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                    Arkadaşlar ({friends.length})
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'pending' ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                    Bekleyen ({pendingRequests.length})
                </button>
                <button
                    onClick={() => setActiveTab('sent')}
                    className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'sent' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                    Gönderilen ({sentRequests.length})
                </button>
            </div>

            {/* Friends List */}
            {activeTab === 'friends' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {friends.length > 0 ? friends.map(friend => (
                        <div key={friend.friendshipId} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-xl font-bold text-white">
                                {friend.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <Link href={`/profile/${friend.username}`} className="font-bold text-white hover:text-blue-400 transition-colors">
                                    {friend.username}
                                </Link>
                                <div className="text-sm text-gray-500">Seviye {friend.level || 1}</div>
                            </div>
                            <div className="flex gap-2">
                                <Link href={`/messages?startWith=${friend.id}`} className="p-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/40" title="Mesaj Gönder">
                                    <FaCommentAlt />
                                </Link>
                                <Link href={`/store/gift-list?send=${friend.id}`} className="p-2 bg-pink-600/20 text-pink-400 rounded-lg hover:bg-pink-600/40" title="Hediye Gönder">
                                    <FaGift />
                                </Link>
                                <button onClick={() => removeFriend(friend.friendshipId)} className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/40" title="Arkadaşlıktan Çıkar">
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full text-center py-12 bg-gray-900/50 rounded-2xl border border-gray-800">
                            <FaUserFriends className="text-4xl text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-500">Henüz arkadaşınız yok</p>
                            <p className="text-sm text-gray-600 mt-2">Yukarıdan arkadaş ekleyin!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Pending Requests */}
            {activeTab === 'pending' && (
                <div className="space-y-4">
                    {pendingRequests.length > 0 ? pendingRequests.map(req => (
                        <div key={req.requestId} className="bg-gray-900 border border-orange-500/30 rounded-xl p-4 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-600 to-yellow-600 flex items-center justify-center text-xl font-bold text-white">
                                {req.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-white">{req.username}</div>
                                <div className="text-sm text-gray-500">Arkadaşlık isteği gönderdi</div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleRequest(req.requestId, 'accept')} className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-green-500">
                                    <FaCheck /> Kabul
                                </button>
                                <button onClick={() => handleRequest(req.requestId, 'reject')} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-red-500">
                                    <FaTimes /> Reddet
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-12 bg-gray-900/50 rounded-2xl border border-gray-800">
                            <p className="text-gray-500">Bekleyen istek yok</p>
                        </div>
                    )}
                </div>
            )}

            {/* Sent Requests */}
            {activeTab === 'sent' && (
                <div className="space-y-4">
                    {sentRequests.length > 0 ? sentRequests.map(req => (
                        <div key={req.requestId} className="bg-gray-900 border border-purple-500/30 rounded-xl p-4 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-xl font-bold text-white">
                                {req.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-white">{req.username}</div>
                                <div className="text-sm text-gray-500">Yanıt bekliyor...</div>
                            </div>
                            <div className="text-sm text-gray-500">
                                {new Date(req.sentAt).toLocaleDateString('tr-TR')}
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-12 bg-gray-900/50 rounded-2xl border border-gray-800">
                            <p className="text-gray-500">Gönderilen istek yok</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
