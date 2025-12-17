"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { FaBolt, FaCheck, FaTimes, FaHourglassHalf, FaTrophy, FaBook, FaPaperPlane, FaUserFriends } from 'react-icons/fa';

export default function DuelList({ userId }) {
    const { user } = useAuth();
    const [duels, setDuels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMe, setIsMe] = useState(false);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [friends, setFriends] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [books, setBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [searchBook, setSearchBook] = useState('');

    useEffect(() => {
        if (user && userId) {
            setIsMe(user.id.toString() === userId.toString() || user.username === userId); // userId prop might be username depending on parent
            fetchDuels();
        }
    }, [user, userId]);

    // Fetch Duels
    const fetchDuels = async () => {
        try {
            const res = await fetch('/api/gamification/duels');
            const data = await res.json();
            if (data.success) {
                setDuels(data.duels);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Helper: Initial Data for Modal
    const prepareModal = async () => {
        setShowModal(true);
        // Fetch Friends
        try {
            const fRes = await fetch('/api/friends');
            const fData = await fRes.json();
            if (fData.success) setFriends(fData.friends);
        } catch (e) { }
    };

    // Search Books for Modal
    useEffect(() => {
        if (!showModal || searchBook.length < 3) return;
        const delay = setTimeout(async () => {
            const res = await fetch(`/api/books/search?q=${searchBook}`);
            const data = await res.json();
            if (data.success) setBooks(data.books);
        }, 500);
        return () => clearTimeout(delay);
    }, [searchBook, showModal]);

    const handleChallenge = async () => {
        if (!selectedFriend || !selectedBook) return toast.error('Arkadaş ve kitap seçmelisin.');

        try {
            const res = await fetch('/api/gamification/duels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    opponentId: selectedFriend.id,
                    bookId: selectedBook.id
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Meydan okuma gönderildi!');
                setShowModal(false);
                fetchDuels();
            } else {
                toast.error(data.error || 'Hata oluştu');
            }
        } catch (e) {
            toast.error('Bağlantı hatası');
        }
    };

    const handleRespond = async (duelId, action) => {
        try {
            const res = await fetch('/api/gamification/duels', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ duelId, action })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(action === 'accept' ? 'Düello Başladı!' : 'Reddedildi');
                fetchDuels();
            }
        } catch (e) {
            toast.error('Hata');
        }
    };

    if (loading) return <div className="text-center py-4 text-gray-500">Yükleniyor...</div>;

    if (!isMe) return null; // Only show on own profile for now, or implement read-only view

    return (
        <div className="bg-[#0a0a0a] border border-[#333] rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <FaBolt className="text-red-500" /> Okuma Düelloları
                </h3>
                <Button onClick={prepareModal} variant="primary" className="text-xs">
                    + Meydan Oku
                </Button>
            </div>

            {duels.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                    <FaBolt className="mx-auto text-4xl mb-2 opacity-20" />
                    <p>Henüz aktif bir düello yok.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {duels.map(duel => {
                        const amIChallenger = duel.challengerId === user.id;
                        const otherUser = amIChallenger ? duel.opponent : duel.challenger;

                        return (
                            <div key={duel.id} className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-16 bg-gray-800 rounded overflow-hidden shrink-0">
                                        {duel.book.cover && <img src={duel.book.cover} className="w-full h-full object-cover" />}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                                            VS {otherUser.username}
                                        </h4>
                                        <p className="text-gray-400 text-xs">{duel.book.title}</p>
                                        <div className="mt-1">
                                            {duel.status === 'PENDING' && <span className="text-yellow-500 text-xs flex items-center gap-1"><FaHourglassHalf /> Bekliyor</span>}
                                            {duel.status === 'ACTIVE' && <span className="text-green-500 text-xs flex items-center gap-1 animate-pulse"><FaBolt /> Savaşıyor</span>}
                                            {duel.status === 'COMPLETED' && (
                                                <span className={`text-xs flex items-center gap-1 ${duel.winnerId === user.id ? 'text-green-400' : 'text-red-400'}`}>
                                                    <FaTrophy /> {duel.winnerId === user.id ? 'Kazandın!' : 'Kaybettin'}
                                                </span>
                                            )}
                                            {duel.status === 'REJECTED' && <span className="text-red-500 text-xs">Reddedildi</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div>
                                    {duel.status === 'PENDING' && !amIChallenger && (
                                        <div className="flex gap-2">
                                            <button onClick={() => handleRespond(duel.id, 'accept')} className="p-2 bg-green-600 rounded hover:bg-green-500 text-white"><FaCheck /></button>
                                            <button onClick={() => handleRespond(duel.id, 'reject')} className="p-2 bg-red-600 rounded hover:bg-red-500 text-white"><FaTimes /></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Challenge Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-[#111] border border-gray-800 rounded-xl w-full max-w-md p-6 animate-in zoom-in-95">
                        <h3 className="text-xl font-bold text-white mb-4">Yeni Meydan Okuma</h3>

                        {/* Step 1: Select Friend */}
                        <div className="mb-4">
                            <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Rakip Seç</label>
                            <select
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                                onChange={(e) => {
                                    const f = friends.find(fr => fr.id === parseInt(e.target.value));
                                    setSelectedFriend(f);
                                }}
                            >
                                <option value="">Arkadaş Seç...</option>
                                {friends.map(f => (
                                    <option key={f.id} value={f.id}>{f.username}</option>
                                ))}
                            </select>
                        </div>

                        {/* Step 2: Select Book */}
                        <div className="mb-6">
                            <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Kitap Seç (Ara)</label>
                            <input
                                type="text"
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-2"
                                placeholder="Kitap adı..."
                                value={searchBook}
                                onChange={(e) => setSearchBook(e.target.value)}
                            />
                            {books.length > 0 && (
                                <div className="max-h-32 overflow-y-auto bg-gray-900 border border-gray-800 rounded">
                                    {books.map(b => (
                                        <div
                                            key={b.id}
                                            className={`p-2 cursor-pointer flex items-center gap-2 hover:bg-gray-800 ${selectedBook?.id === b.id ? 'bg-indigo-900/50' : ''}`}
                                            onClick={() => setSelectedBook(b)}
                                        >
                                            {b.cover ? <img src={b.cover} className="w-6 h-8 object-cover" /> : <FaBook />}
                                            <span className="text-sm text-gray-300 truncate">{b.title}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Button onClick={handleChallenge} fullWidth className="flex items-center justify-center gap-2">
                                <FaPaperPlane /> Gönder
                            </Button>
                            <Button onClick={() => setShowModal(false)} variant="secondary" fullWidth>İptal</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
