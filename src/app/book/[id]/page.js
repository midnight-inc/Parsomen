"use client";
import { useState, useEffect } from 'react';
import { FaStar, FaBookReader, FaHeart, FaShareAlt, FaPlus, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function BookDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [libraryStatus, setLibraryStatus] = useState(null); // null, 'WANT_TO_READ', 'READING', 'READ'
    const [addingToLib, setAddingToLib] = useState(false);

    // Review State
    const [userRating, setUserRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [spoiler, setSpoiler] = useState(false);
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        fetchBookDetails();
    }, [id]);

    const fetchBookDetails = async () => {
        try {
            const res = await fetch(`/api/books/${id}`, { cache: 'no-store' });
            const data = await res.json();
            if (data.success) {
                setBook(data.book);
                setLibraryStatus(data.userLibraryStatus);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToLibrary = async (status = 'WANT_TO_READ') => {
        if (!user) return toast.error('Kütüphaneye eklemek için giriş yapmalısınız!');
        setAddingToLib(true);
        try {
            const res = await fetch('/api/library', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookId: id, status })
            });
            const data = await res.json();
            if (data.success) {
                setLibraryStatus(status);
            }
        } catch (err) {
            toast.error('Bir hata oluştu');
        } finally {
            setAddingToLib(false);
        }
    };

    const handleSubmitReview = async () => {
        if (!user) return toast.error('Puan vermek için giriş yapın!');
        if (userRating === 0) return toast.error('Lütfen bir puan seçin!');

        setSubmittingReview(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookId: id,
                    rating: userRating,
                    text: reviewText,
                    spoiler
                })
            });
            if (res.ok) {
                setReviewText('');
                setUserRating(0);
                fetchBookDetails(); // Refresh to see new avg rating and review
                toast.success('İncelemeniz gönderildi! Teşekkürler.');
            }
        } catch (err) {
            toast.error('Gönderim hatası');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return <div className="text-white p-10 text-center text-xl animate-pulse">Kitap bilgileri yükleniyor...</div>;
    if (!book) return <div className="text-white p-10 text-center">Kitap bulunamadı.</div>;

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
            {/* Hero Section with Backdrop */}
            <div className="relative h-[400px] w-full rounded-xl overflow-hidden mb-8 group">
                <div className="absolute inset-0 bg-gradient-to-t from-[#1b2838] via-[#1b2838]/80 to-transparent z-10"></div>
                <img src={book.cover} className="w-full h-full object-cover blur-sm opacity-50 group-hover:scale-105 transition-transform duration-1000" />

                <div className="absolute bottom-0 left-0 p-8 z-20 flex items-end gap-8 w-full">
                    <img src={book.cover} className="w-48 rounded-lg shadow-2xl border-4 border-[#1b2838] transform translate-y-12" />
                    <div className="mb-4 flex-1">
                        <div className="flex gap-2 mb-2">
                            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">{book.category}</span>
                            {book.isNew && <span className="bg-green-500 text-black text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">YENİ</span>}
                        </div>
                        <h1 className="text-5xl font-black text-white mb-2 drop-shadow-lg leading-tight">{book.title}</h1>
                        <p className="text-xl text-gray-300 font-light">{book.author}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-16 px-4">
                {/* Left Column: Actions & Details */}
                <div className="space-y-6">
                    <div className="bg-[#1b2838] p-6 rounded-xl border border-gray-700 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="text-center">
                                <span className="text-4xl font-bold text-white block">{book.rating}</span>
                                <div className="flex text-yellow-500 text-sm gap-0.5 my-1">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <FaStar key={star} className={star <= Math.round(book.rating) ? "text-yellow-500" : "text-gray-600"} />
                                    ))}
                                </div>
                                <span className="text-xs text-gray-500">{book._count.reviews} İnceleme</span>
                            </div>
                            <div className="h-12 w-px bg-gray-700"></div>
                            <button className="flex flex-col items-center text-gray-400 hover:text-red-500 transition-colors">
                                <FaHeart className="text-2xl mb-1" />
                                <span className="text-xs">Favori</span>
                            </button>
                            <button className="flex flex-col items-center text-gray-400 hover:text-blue-500 transition-colors">
                                <FaShareAlt className="text-2xl mb-1" />
                                <span className="text-xs">Paylaş</span>
                            </button>
                        </div>

                        {libraryStatus ? (
                            <button className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-lg font-bold flex items-center justify-center gap-2 cursor-default">
                                <FaCheck /> Kütüphanende Ekli
                            </button>
                        ) : (
                            <button
                                onClick={() => handleAddToLibrary('WANT_TO_READ')}
                                disabled={addingToLib}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-4 rounded-lg font-bold shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1"
                            >
                                {addingToLib ? 'Ekleniyor...' : <><FaPlus /> Kütüphaneye Ekle</>}
                            </button>
                        )}

                        <div className="mt-4 grid grid-cols-2 gap-2">
                            <button onClick={() => handleAddToLibrary('READING')} className="bg-[#2a3f5a] hover:bg-[#344d6d] text-white py-2 rounded text-xs font-bold">Okuyorum</button>
                            <button onClick={() => handleAddToLibrary('READ')} className="bg-[#2a3f5a] hover:bg-[#344d6d] text-white py-2 rounded text-xs font-bold">Okudum</button>
                        </div>
                    </div>

                    <div className="bg-[#1b2838] p-6 rounded-xl border border-gray-700">
                        <h3 className="text-white font-bold mb-4 border-b border-gray-700 pb-2">KİTAP DETAYLARI</h3>
                        <div className="space-y-3 text-sm">
                            < div className="flex justify-between">
                                <span className="text-gray-500">Yazar</span>
                                <span className="text-blue-400 hover:underline cursor-pointer">{book.author}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Yıl</span>
                                <span className="text-gray-300">{book.year || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Sayfa</span>
                                <span className="text-gray-300">{book.pages || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Description & Reviews */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-[#0f151e]/50 p-6 rounded-xl border border-gray-800">
                        <h2 className="text-white font-bold text-xl mb-4">ÖZET</h2>
                        <p className="text-gray-300 leading-relaxed font-light">
                            {book.description || "Bu kitap için henüz bir açıklama girilmemiş."}
                        </p>
                    </div>

                    {/* Review Submission */}
                    <div className="bg-[#1b2838] p-6 rounded-xl border border-gray-700">
                        <h3 className="text-white font-bold mb-4">İNCELEME YAZ & PUAN VER</h3>
                        <div className="flex gap-2 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setUserRating(star)}
                                    className={`text-2xl transition-transform hover:scale-110 ${userRating >= star ? 'text-yellow-400' : 'text-gray-600'}`}
                                >
                                    <FaStar />
                                </button>
                            ))}
                            <span className="ml-2 text-gray-400 text-sm flex items-center">{userRating > 0 ? `${userRating} Puan` : 'Puan Ver'}</span>
                        </div>
                        <textarea
                            className="w-full bg-[#0a0f16] border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none h-32"
                            placeholder="Bu kitap hakkındaki düşüncelerin neler?..."
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                        />
                        <div className="flex justify-between items-center mt-3">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-white">
                                <input type="checkbox" checked={spoiler} onChange={e => setSpoiler(e.target.checked)} className="rounded bg-gray-700 border-gray-600" />
                                <span className="text-sm">Spoiler İçerir</span>
                            </label>
                            <button
                                onClick={handleSubmitReview}
                                disabled={submittingReview}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold transition-colors"
                            >
                                {submittingReview ? 'Gönderiliyor...' : 'Gönder'}
                            </button>
                        </div>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-4">
                        <h3 className="text-white font-bold text-lg">TOPLULUK İNCELEMELERİ ({book.reviews.length})</h3>
                        {book.reviews.length > 0 ? (
                            book.reviews.map((review) => (
                                <div key={review.id} className="bg-[#101822] p-4 rounded-xl border border-gray-800 flex gap-4">
                                    <div className="shrink-0 w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold border border-gray-700">
                                        {review.user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-blue-400 font-bold hover:underline cursor-pointer">{review.user.username}</span>
                                                <span className="text-gray-600 text-xs ml-2">Lvl {review.user.level}</span>
                                            </div>
                                            <div className="flex text-yellow-500 text-xs">
                                                {[...Array(review.rating)].map((_, i) => <FaStar key={i} />)}
                                            </div>
                                        </div>
                                        <div className="mt-2 text-gray-300 text-sm leading-relaxed">
                                            {review.spoiler ? (
                                                <div className="bg-gray-900/50 p-2 rounded border border-gray-800 flex gap-2 items-center text-yellow-600">
                                                    <FaExclamationTriangle />
                                                    <span className="italic">Bu inceleme spoiler içeriyor.</span>
                                                </div>
                                            ) : (
                                                review.text
                                            )}
                                        </div>
                                        <div className="mt-3 text-xs text-gray-600">{new Date(review.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-500 italic text-center py-10 bg-[#101822] rounded-xl">Henüz hiç inceleme yapılmamış. İlk değerlendiren sen ol!</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
