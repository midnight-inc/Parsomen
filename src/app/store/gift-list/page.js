"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { FaHeart, FaGift, FaEnvelope, FaUsers, FaTrophy, FaBookOpen, FaSpinner, FaGem, FaTimes, FaCheck, FaBirthdayCake, FaHandHoldingHeart, FaCommentDots, FaGlassCheers } from 'react-icons/fa';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

// Gift card types with point costs
const giftCardTypes = [
    { id: 'birthday', name: 'Doğum Günün Kutlu Olsun', icon: <FaBirthdayCake />, gradient: 'from-pink-600 to-rose-500', minPoints: 50 },
    { id: 'thanks', name: 'Teşekkürler', icon: <FaHandHoldingHeart />, gradient: 'from-green-600 to-teal-500', minPoints: 25 },
    { id: 'thinking', name: 'Seni Düşünüyorum', icon: <FaCommentDots />, gradient: 'from-purple-600 to-indigo-500', minPoints: 25 },
    { id: 'congrats', name: 'Tebrikler!', icon: <FaGlassCheers />, gradient: 'from-yellow-500 to-orange-500', minPoints: 50 },
];

export default function GiftListPage() {
    const searchParams = useSearchParams();
    const preselectedFriendId = searchParams.get('send');

    const [wishlist, setWishlist] = useState([]);
    const [topGifters, setTopGifters] = useState([]);
    const [loading, setLoading] = useState(true);

    // Gift sending state
    const [friends, setFriends] = useState([]);
    const [userPoints, setUserPoints] = useState(0);
    const [showGiftModal, setShowGiftModal] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [giftPoints, setGiftPoints] = useState(50);
    const [giftMessage, setGiftMessage] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (preselectedFriendId && friends.length > 0) {
            const friend = friends.find(f => f.id === parseInt(preselectedFriendId));
            if (friend) {
                setSelectedFriend(friend);
                setShowGiftModal(true);
            }
        }
    }, [preselectedFriendId, friends]);

    const fetchData = async () => {
        try {
            // Fetch user's favorites as wishlist
            const favRes = await fetch('/api/user/books-data');
            const favData = await favRes.json();
            if (favData.favorites) {
                setWishlist(favData.favorites.slice(0, 6));
            }

            // Fetch top gifters
            const giftRes = await fetch('/api/gifts/top');
            const giftData = await giftRes.json();
            if (giftData.success) {
                setTopGifters(giftData.gifters);
            }

            // Fetch friends for gift sending
            const friendsRes = await fetch('/api/gifts/send');
            const friendsData = await friendsRes.json();
            if (friendsData.success) {
                setFriends(friendsData.friends || []);
                setUserPoints(friendsData.userPoints || 0);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const openGiftModal = (card) => {
        setSelectedCard(card);
        setGiftPoints(card.minPoints);
        setShowGiftModal(true);
    };

    const handleSendGift = async () => {
        if (!selectedFriend || !giftPoints) {
            toast.error('Lütfen bir arkadaş seçin');
            return;
        }

        if (giftPoints > userPoints) {
            toast.error('Yetersiz puan bakiyesi');
            return;
        }

        setSending(true);
        const loadingToast = toast.loading('Hediye gönderiliyor...');

        try {
            const res = await fetch('/api/gifts/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverId: selectedFriend.id,
                    points: giftPoints,
                    cardType: selectedCard?.id || 'thanks',
                    message: giftMessage
                })
            });

            const data = await res.json();

            if (data.success) {
                toast.success(data.message || 'Hediye gönderildi! 🎁', { id: loadingToast });
                setShowGiftModal(false);
                setSelectedCard(null);
                setSelectedFriend(null);
                setGiftPoints(50);
                setGiftMessage('');
                // Refresh data
                fetchData();
            } else {
                toast.error(data.error || 'Hediye gönderilemedi', { id: loadingToast });
            }
        } catch (error) {
            toast.error('Bağlantı hatası', { id: loadingToast });
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <FaSpinner className="text-4xl text-pink-500 animate-spin" />
            </div>
        );
    }

    return (
        <>
            {/* Gift Modal */}
            {showGiftModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <FaGift className="text-pink-500" /> Hediye Gönder
                            </h2>
                            <button onClick={() => setShowGiftModal(false)} className="text-gray-500 hover:text-white">
                                <FaTimes />
                            </button>
                        </div>

                        {/* Your Points */}
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 flex items-center justify-between">
                            <span className="text-gray-400">Puan Bakiyen:</span>
                            <span className="text-2xl font-bold text-amber-400 flex items-center gap-2">
                                <FaGem className="text-base" /> {userPoints.toLocaleString()}
                            </span>
                        </div>

                        {/* Select Friend */}
                        <div className="mb-6">
                            <label className="block text-sm text-gray-400 mb-2">Arkadaş Seç</label>
                            {friends.length === 0 ? (
                                <div className="text-center py-4 bg-gray-800 rounded-xl">
                                    <FaUsers className="text-3xl text-gray-600 mx-auto mb-2" />
                                    <p className="text-gray-500 text-sm">Henüz arkadaşın yok</p>
                                    <Link href="/friends" className="text-pink-400 text-sm hover:underline">Arkadaş ekle →</Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                                    {friends.map(friend => (
                                        <button
                                            key={friend.id}
                                            onClick={() => setSelectedFriend(friend)}
                                            className={`p-3 rounded-xl border text-center transition-all ${selectedFriend?.id === friend.id
                                                ? 'bg-pink-500/20 border-pink-500'
                                                : 'bg-gray-800 border-gray-700 hover:border-gray-500'
                                                }`}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mx-auto mb-1 flex items-center justify-center font-bold text-white">
                                                {friend.username?.charAt(0).toUpperCase()}
                                            </div>
                                            <p className="text-xs text-white truncate">{friend.username}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Select Card Type */}
                        {selectedCard && (
                            <div className={`mb-6 p-4 rounded-xl bg-gradient-to-br ${selectedCard.gradient} text-center`}>
                                <span className="text-4xl">{selectedCard.icon}</span>
                                <p className="font-bold text-white mt-2">{selectedCard.name}</p>
                            </div>
                        )}

                        {/* Points Amount */}
                        <div className="mb-6">
                            <label className="block text-sm text-gray-400 mb-2">Puan Miktarı</label>
                            <div className="flex gap-2">
                                {[25, 50, 100, 250, 500].map(amount => (
                                    <button
                                        key={amount}
                                        onClick={() => setGiftPoints(amount)}
                                        disabled={amount > userPoints}
                                        className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${giftPoints === amount
                                            ? 'bg-pink-500 text-white'
                                            : amount > userPoints
                                                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                            }`}
                                    >
                                        {amount}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Message */}
                        <div className="mb-6">
                            <label className="block text-sm text-gray-400 mb-2">Mesaj (Opsiyonel)</label>
                            <textarea
                                value={giftMessage}
                                onChange={(e) => setGiftMessage(e.target.value)}
                                maxLength={200}
                                placeholder="Hediyenle birlikte bir mesaj ekle..."
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:border-pink-500 outline-none resize-none"
                                rows={2}
                            />
                        </div>

                        {/* Send Button */}
                        <button
                            onClick={handleSendGift}
                            disabled={!selectedFriend || giftPoints > userPoints || sending || friends.length === 0}
                            className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {sending ? <FaSpinner className="animate-spin" /> : <FaGift />}
                            {selectedFriend ? `${selectedFriend.username}'a ${giftPoints} Puan Gönder` : 'Arkadaş Seç'}
                        </button>
                    </div>
                </div>
            )}

            <div className="min-h-screen pt-24 px-4 sm:px-8 max-w-[1600px] mx-auto text-white pb-20">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                        Hediye Merkezi
                    </h1>
                    <p className="text-gray-400 text-lg">Arkadaşlarınıza puan hediye edin (sadece arkadaşlara gönderilebilir)</p>
                </div>

                {/* Your Points Balance */}
                <div className="mb-8 bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border border-amber-500/30 rounded-2xl p-6 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm">Puan Bakiyen</p>
                        <p className="text-3xl font-black text-amber-400 flex items-center gap-2">
                            <FaGem /> {userPoints.toLocaleString()}
                        </p>
                    </div>
                    <Link href="/store/points-shop" className="px-4 py-2 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300 hover:bg-amber-500/30 transition-colors">
                        Puan Dükkanı →
                    </Link>
                </div>

                {/* Gift Cards */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <FaEnvelope className="text-purple-500" /> Dijital Hediye Kartları
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {giftCardTypes.map(card => (
                            <button
                                key={card.id}
                                onClick={() => openGiftModal(card)}
                                className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all text-left`}
                            >
                                <div className="text-4xl mb-4">{card.emoji}</div>
                                <h3 className="font-bold text-white text-lg mb-2">{card.name}</h3>
                                <p className="text-white/70 text-sm flex items-center gap-1">
                                    <FaGem className="text-xs" /> Min. {card.minPoints} puan
                                </p>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Wishlist (from Favorites) */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <FaHeart className="text-pink-500" /> Dilek Listem
                        </h2>
                        <Link href="/library/favorites" className="text-sm text-pink-400 hover:underline">Tümünü Gör →</Link>
                    </div>
                    <p className="text-gray-500 text-sm mb-4">Favorilediğiniz kitaplar dilek listeniz olarak görünür.</p>

                    {wishlist.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {wishlist.map(book => (
                                <Link key={book.id} href={`/books/${book.id}`} className="group">
                                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 bg-gray-800 shadow-lg group-hover:shadow-xl transition-shadow">
                                        {book.cover ? (
                                            <Image src={book.cover} alt={book.title} fill className="object-cover" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                                                <FaBookOpen className="text-4xl" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                        <div className="absolute bottom-0 left-0 right-0 p-3">
                                            <h4 className="font-bold text-white text-sm line-clamp-1">{book.title}</h4>
                                            <p className="text-gray-400 text-xs">{book.author}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-900/50 rounded-2xl border border-gray-800">
                            <FaHeart className="text-4xl text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-500">Henüz favori kitap eklemediniz.</p>
                            <Link href="/store" className="text-pink-400 text-sm hover:underline mt-2 inline-block">
                                Kitapları keşfet →
                            </Link>
                        </div>
                    )}
                </section>

                {/* Top Gifters - Real Data */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <FaTrophy className="text-yellow-500" /> En Cömertler
                    </h2>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        {topGifters.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {topGifters.slice(0, 3).map(user => {
                                    const colors = [
                                        'from-yellow-500 to-amber-500',
                                        'from-gray-300 to-gray-400',
                                        'from-amber-600 to-amber-700'
                                    ];
                                    return (
                                        <div key={user.userId} className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl">
                                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colors[user.rank - 1] || 'from-gray-500 to-gray-600'} flex items-center justify-center text-xl font-black text-gray-900`}>
                                                {user.rank}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">{user.username}</div>
                                                <div className="text-gray-500 text-sm">{user.giftCount} hediye gönderdi</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FaTrophy className="text-4xl text-gray-700 mx-auto mb-4" />
                                <p className="text-gray-500">Henüz hediye gönderen yok.</p>
                                <p className="text-gray-600 text-sm">İlk cömert sen ol!</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}
