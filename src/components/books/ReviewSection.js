"use client";
import { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaTrash, FaEdit, FaTimes, FaThumbsUp, FaThumbsDown, FaReply, FaChevronDown, FaChevronUp, FaFilter } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function ReviewSection({ bookId }) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState('newest');

    // Edit mode
    const [editingId, setEditingId] = useState(null);

    // Reply mode
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');

    // Expanded replies
    const [expandedReplies, setExpandedReplies] = useState({});

    // Confirm Modal
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [bookId, sortBy]);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/reviews?bookId=${bookId}&sort=${sortBy}`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (err) {
            console.error('Error fetching reviews:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error('Yorum yapmak için giriş yapmalısınız.');
            return;
        }

        setLoading(true);
        try {
            if (editingId) {
                const res = await fetch(`/api/reviews/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text, rating })
                });

                if (res.ok) {
                    toast.success('İnceleme güncellendi! ✏️');
                    setEditingId(null);
                    setText('');
                    setRating(5);
                    fetchReviews();
                } else {
                    const data = await res.json();
                    toast.error(data.error || 'Güncellenemedi');
                }
            } else {
                const res = await fetch('/api/reviews', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookId, text, rating })
                });

                if (res.ok) {
                    toast.success('İncelemeniz eklendi! +10 XP ⭐');
                    setText('');
                    setRating(5);
                    fetchReviews();
                } else {
                    const data = await res.json();
                    if (res.status === 409) {
                        toast.error('Bu kitabı zaten incelediniz.');
                    } else {
                        toast.error(data.error || 'İnceleme eklenemedi');
                    }
                }
            }
        } catch (err) {
            toast.error('Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (parentId) => {
        if (!user) {
            toast.error('Cevap vermek için giriş yapmalısınız.');
            return;
        }
        if (!replyText.trim()) return;

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookId, text: replyText, parentId })
            });

            if (res.ok) {
                toast.success('Cevabınız eklendi!');
                setReplyText('');
                setReplyingTo(null);
                fetchReviews();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Cevap eklenemedi');
            }
        } catch (err) {
            toast.error('Bir hata oluştu.');
        }
    };

    const handleVote = async (reviewId, type) => {
        if (!user) {
            toast.error('Oy vermek için giriş yapmalısınız.');
            return;
        }

        try {
            const res = await fetch('/api/reviews/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewId, type })
            });

            if (res.ok) {
                fetchReviews();
            }
        } catch (err) {
            console.error('Vote error:', err);
        }
    };

    const handleEdit = (review) => {
        setEditingId(review.id);
        setText(review.text);
        setRating(review.rating);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setText('');
        setRating(5);
    };

    const confirmDelete = (id) => {
        setDeleteTargetId(id);
        setShowConfirm(true);
    };

    const handleDelete = async () => {
        if (!deleteTargetId || deleting) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/reviews/${deleteTargetId}`, { method: 'DELETE' });
            const data = await res.json();

            if (res.ok || data.success) {
                toast.success('Yorum silindi.');
                fetchReviews();
            } else {
                toast.error(data.error || 'Silinemedi.');
            }
        } catch (e) {
            toast.error('Hata oluştu.');
        } finally {
            setDeleting(false);
            setShowConfirm(false);
            setDeleteTargetId(null);
        }
    };

    const toggleReplies = (reviewId) => {
        setExpandedReplies(prev => ({ ...prev, [reviewId]: !prev[reviewId] }));
    };

    const ReviewCard = ({ review, isReply = false }) => (
        <div className={`${isReply ? 'ml-12 border-l-2 border-gray-800 pl-4' : ''} bg-gray-900 p-5 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors group`}>
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className={`${isReply ? 'w-8 h-8 text-sm' : 'w-10 h-10'} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0`}>
                    {review.user?.username?.[0]?.toUpperCase() || 'U'}
                </div>

                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white">{review.user?.username || 'Kullanıcı'}</span>
                        {!isReply && (
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    i < review.rating ?
                                        <FaStar key={i} className="text-yellow-500 text-xs" /> :
                                        <FaRegStar key={i} className="text-gray-600 text-xs" />
                                ))}
                            </div>
                        )}
                        <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('tr-TR')}</span>
                    </div>

                    {/* Content */}
                    <p className="text-gray-400 text-sm mt-2 leading-relaxed">{review.text}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-3">
                        {/* Like */}
                        <button
                            onClick={() => handleVote(review.id, 'LIKE')}
                            className={`flex items-center gap-1 text-sm transition-colors ${review.userVote === 'LIKE' ? 'text-green-500' : 'text-gray-500 hover:text-green-500'}`}
                        >
                            <FaThumbsUp className="text-xs" />
                            <span>{review.likes || 0}</span>
                        </button>

                        {/* Dislike */}
                        <button
                            onClick={() => handleVote(review.id, 'DISLIKE')}
                            className={`flex items-center gap-1 text-sm transition-colors ${review.userVote === 'DISLIKE' ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                        >
                            <FaThumbsDown className="text-xs" />
                            <span>{review.dislikes || 0}</span>
                        </button>

                        {/* Reply - available for all reviews and replies */}
                        <button
                            onClick={() => setReplyingTo(replyingTo === review.id ? null : review.id)}
                            className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500 transition-colors"
                        >
                            <FaReply className="text-xs" />
                            <span>Yanıtla</span>
                        </button>

                        {/* Edit/Delete for owner */}
                        {(user?.id === review.user?.id || user?.role === 'ADMIN') && (
                            <div className="flex gap-2 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                {!isReply && (
                                    <button onClick={() => handleEdit(review)} className="text-blue-500 hover:text-blue-400 p-1" title="Düzenle">
                                        <FaEdit className="text-xs" />
                                    </button>
                                )}
                                <button onClick={() => confirmDelete(review.id)} className="text-red-500 hover:text-red-400 p-1" title="Sil">
                                    <FaTrash className="text-xs" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Reply Input */}
                    {replyingTo === review.id && (
                        <div className="mt-3 flex gap-2">
                            <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Yanıtınızı yazın..."
                                className="flex-1 bg-black/40 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none"
                            />
                            <button
                                onClick={() => handleReply(review.id)}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                            >
                                Gönder
                            </button>
                            <button
                                onClick={() => { setReplyingTo(null); setReplyText(''); }}
                                className="text-gray-500 hover:text-white px-2"
                            >
                                <FaTimes />
                            </button>
                        </div>
                    )}

                    {/* Show Replies Toggle */}
                    {!isReply && review.replies?.length > 0 && (
                        <button
                            onClick={() => toggleReplies(review.id)}
                            className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-400 mt-3 transition-colors"
                        >
                            {expandedReplies[review.id] ? <FaChevronUp /> : <FaChevronDown />}
                            {review.replies.length} yanıt
                        </button>
                    )}
                </div>
            </div>

            {/* Replies */}
            {!isReply && expandedReplies[review.id] && review.replies?.length > 0 && (
                <div className="mt-4 space-y-3">
                    {review.replies.map(reply => (
                        <ReviewCard key={reply.id} review={reply} isReply={true} />
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="mt-12">
            <h3 className="text-2xl font-bold text-white mb-6">Yorumlar ve İncelemeler</h3>

            {/* Add/Edit Review Form */}
            <div className="bg-gray-900/50 p-6 rounded-2xl mb-8 border border-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-bold text-white">
                        {editingId ? '✏️ İncelemeyi Düzenle' : 'Bir İnceleme Yaz'}
                    </h4>
                    {editingId && (
                        <button onClick={cancelEdit} className="text-gray-400 hover:text-white transition-colors">
                            <FaTimes />
                        </button>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-2 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                type="button"
                                key={star}
                                onClick={() => setRating(star)}
                                className={`text-2xl transition-colors ${rating >= star ? 'text-yellow-500' : 'text-gray-700'}`}
                            >
                                <FaStar />
                            </button>
                        ))}
                    </div>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Bu kitap hakkında ne düşünüyorsun?"
                        required
                        className="w-full bg-black/40 border border-gray-700 rounded-xl p-4 text-white focus:border-indigo-500 outline-none h-32 resize-none"
                    />
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Gönderiliyor...' : (editingId ? 'Güncelle' : 'Yorumu Paylaş')}
                        </button>
                        {editingId && (
                            <button type="button" onClick={cancelEdit} className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-bold transition-colors">
                                İptal
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-4 mb-6 flex-wrap">
                <div className="flex items-center gap-2 text-gray-400">
                    <FaFilter className="text-sm" />
                    <span className="text-sm font-bold">Sırala:</span>
                </div>
                <div className="flex gap-2">
                    {[
                        { value: 'newest', label: 'En Yeni' },
                        { value: 'oldest', label: 'En Eski' },
                        { value: 'most_liked', label: 'En Beğenilen' }
                    ].map(option => (
                        <button
                            key={option.value}
                            onClick={() => setSortBy(option.value)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${sortBy === option.value
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
                <span className="text-gray-500 text-sm ml-auto">{reviews.length} yorum</span>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.length > 0 ? reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                )) : (
                    <div className="text-gray-500 text-center py-8">Henüz yorum yapılmamış. İlk yorumu sen yap!</div>
                )}
            </div>

            {/* Confirm Delete Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-white mb-4 text-center">Yorumu Sil</h3>
                        <p className="text-gray-400 text-center mb-8">
                            Bu yorumu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={deleting}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
                            >
                                Hayır
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
                            >
                                {deleting ? 'Siliniyor...' : 'Evet, Sil'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
