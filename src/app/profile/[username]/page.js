"use client";
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaEdit, FaBookOpen, FaClock, FaBook, FaCheckCircle, FaSpinner, FaSave, FaTimes, FaCamera, FaLayerGroup, FaStar, FaCommentAlt, FaHeart, FaUsers } from 'react-icons/fa';
import { IconRenderer } from '@/components/ui/IconHelper';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import ReadingGoalCard from '@/components/gamification/ReadingGoalCard';
import DuelList from '@/components/gamification/DuelList';
import { useAuth } from '@/context/AuthContext';

export default function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { username } = params;
    const { reloadUser } = useAuth();

    // State
    const [profileData, setProfileData] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        username: '',
        bio: '',
        avatar: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (username) fetchProfile();
    }, [username]);

    const fetchProfile = async () => {
        try {
            const res = await fetch(`/api/user/profile/${username}?t=${Date.now()}`, { cache: 'no-store', headers: { 'Pragma': 'no-cache' } });
            if (res.ok) {
                const data = await res.json();
                setProfileData(data);
                setUser(data.user);
                setEditForm({
                    username: data.user.username || '',
                    bio: data.user.bio || '',
                    avatar: data.user.avatar || ''
                });
            } else {
                setError(true);
            }
        } catch (error) {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const fileInputRef = useRef(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith('image/')) {
            toast.error('Lütfen geçerli bir resim dosyası seçin');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Dosya boyutu 5MB\'dan küçük olmalı');
            return;
        }

        setUploadingAvatar(true);
        const loadingToast = toast.loading('Resim yükleniyor...');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                setEditForm(prev => ({ ...prev, avatar: data.url }));
                toast.success('Resim yüklendi!', { id: loadingToast });
            } else {
                toast.error(data.error || 'Yükleme başarısız', { id: loadingToast });
            }
        } catch (error) {
            console.error('Upload error', error);
            toast.error('Bağlantı hatası', { id: loadingToast });
        } finally {
            setUploadingAvatar(false);
            // Reset input so same file can be selected again if needed
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSave = async () => {
        setSaving(true);
        const loadingToast = toast.loading('Kaydediliyor...');

        try {
            const res = await fetch('/api/user/profile/edit', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Profil güncellendi', { id: loadingToast });
                await reloadUser(); // Sync header & session
                setIsEditing(false);
                if (editForm.username !== username) {
                    router.push(`/profile/${editForm.username}`);
                } else {
                    fetchProfile();
                    router.refresh();
                }
            } else {
                toast.error(data.error + (data.details ? `: ${data.details}` : '') || 'Güncelleme başarısız', { id: loadingToast });
            }
        } catch (error) {
            console.error('Save error', error);
            toast.error('Bir hata oluştu', { id: loadingToast });
        } finally {
            setSaving(false);
        }
    };

    const handleAddFriend = async () => {
        try {
            const loadingToast = toast.loading('Arkadaş isteği gönderiliyor...');
            const res = await fetch('/api/users/add-friend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ friendId: user.id })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message || 'Arkadaş isteği gönderildi!', { id: loadingToast });
            } else {
                toast.error(data.error || 'İstek gönderilemedi', { id: loadingToast });
            }
        } catch (error) {
            toast.error('Bir hata oluştu');
        }
    };

    const formatReadingTime = (seconds) => {
        if (!seconds || seconds === 0) return '0 dakika';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours} saat ${minutes} dk`;
        }
        return `${minutes} dakika`;
    };

    if (loading) return <div className="min-h-screen pt-24 text-white p-10 flex justify-center items-center gap-2"><FaSpinner className="animate-spin" /> Yükleniyor...</div>;
    if (error || !user) return <div className="min-h-screen pt-24 text-red-500 p-10 flex justify-center">Kullanıcı bulunamadı veya bir hata oluştu.</div>;

    const profile = {
        ...user,
        maxXp: user.level * 1000,
        badges: user.badges || [],
        reviews: user.reviews || [],
        totalReadingTime: user.stats?.totalReadTime || 0,
        booksCompleted: user.stats?.booksCompleted || 0,
        booksInProgress: user.stats?.booksInProgress || 0,
        _count: user._count || { library: 0, reviews: 0, collections: 0, posts: 0 }
    };

    const xpPercentage = profile.maxXp > 0 ? Math.min(100, (profile.xp / profile.maxXp) * 100) : 0;
    const isOwnProfile = user.isOwnProfile;

    const allActivities = [
        ...(user.recentActivity || []).map(a => ({ ...a, type: 'reading', date: new Date(a.lastRead) })),
        ...(user.reviews || []).map(r => ({ ...r, type: 'review', date: new Date(r.createdAt) })),
        ...(user.posts || []).map(p => ({ ...p, type: 'post', date: new Date(p.createdAt) }))
    ].sort((a, b) => b.date - a.date).slice(0, 10);

    return (
        <div className="max-w-5xl mx-auto pt-24 pb-20 animate-in fade-in duration-500 font-sans text-gray-300 px-4">
            <Toaster position="bottom-right" toastOptions={{
                style: {
                    background: '#333',
                    color: '#fff',
                },
            }} />

            {/* ... Rest of JSX is identical, just removing alerts if any were inline ... */}
            {/* The handleSave function handles the interactions now via toast. */}

            <div className={`bg-black border ${isEditing ? 'border-purple-500 shadow-[0_0_50px_rgba(168,85,247,0.2)]' : 'border-gray-800'} rounded-xl relative overflow-hidden shadow-2xl transition-all duration-300`}>

                <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black z-0">
                    <div className="opacity-5 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] w-full h-full"></div>
                </div>

                <div className="relative z-10 p-8 flex flex-col gap-8">

                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                        <div className="relative group shrink-0">
                            <div className="w-40 h-40 rounded-full border-4 border-gray-800 bg-black shadow-2xl relative overflow-hidden">
                                <div className="w-full h-full bg-gradient-to-b from-gray-700 to-gray-900">
                                    {(isEditing ? editForm.avatar : user.avatar) ? (
                                        <img src={isEditing ? editForm.avatar : user.avatar} className="w-full h-full object-cover" alt="avatar" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-6xl font-bold text-white/20">{profile.username.charAt(0).toUpperCase()}</span>
                                        </div>
                                    )}
                                </div>

                                {isEditing && (
                                    <div
                                        onClick={handleAvatarClick}
                                        className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center transition-opacity cursor-pointer hover:bg-black/70 group/edit"
                                    >
                                        {uploadingAvatar ? (
                                            <FaSpinner className="text-white text-2xl animate-spin" />
                                        ) : (
                                            <>
                                                <FaCamera className="text-white text-2xl mb-1 group-hover/edit:scale-110 transition-transform" />
                                                <span className="text-[10px] text-white font-medium">Değiştir</span>
                                            </>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleAvatarUpload}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 text-xs bg-white text-black font-bold px-3 py-1 rounded-full border-4 border-black shadow-lg">
                                Lvl {profile.level}
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-between py-2 text-center md:text-left w-full">
                            <div>
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs text-purple-400 font-bold ml-1">Kullanıcı Adı</label>
                                            <input
                                                type="text"
                                                value={editForm.username}
                                                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white font-bold text-2xl focus:border-purple-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-purple-400 font-bold ml-1">Hakkında (Bio)</label>
                                            <textarea
                                                value={editForm.bio}
                                                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-gray-300 resize-none h-24 focus:border-purple-500 focus:outline-none"
                                                placeholder="Biyografi yaz..."
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h1 className="text-4xl text-white font-bold tracking-tight flex items-center justify-center md:justify-start gap-4">
                                            {profile.username}
                                            {profile.role === 'ADMIN' && <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">ADMIN</span>}
                                        </h1>
                                        <div className="flex items-center justify-center md:justify-start gap-3 mt-2 text-sm text-gray-500 flex-wrap">
                                            <span>Seviye {profile.level || 1}</span>
                                            <span className="text-gray-700">|</span>
                                            <Link href={`/profile/${profile.username}/activity`} className="hover:text-white transition-colors">
                                                {user.friendCount || 0} Arkadaş
                                            </Link>
                                            <span className="text-gray-700">|</span>
                                            <span>{profile._count?.reviews || 0} Yorum</span>
                                        </div>
                                        <p className="mt-6 text-gray-400 text-lg font-light leading-relaxed max-w-2xl whitespace-pre-wrap">
                                            {user.bio || '"Kitap okumak, başka hayatları yaşamaktır."'}
                                        </p>
                                    </>
                                )}
                            </div>

                            {isOwnProfile ? (
                                <div className="flex justify-center md:justify-end mt-6 gap-3">
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2"
                                                disabled={saving}
                                            >
                                                <FaTimes /> İptal
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 rounded-full font-bold text-sm transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center gap-2"
                                                disabled={saving}
                                            >
                                                {saving ? <FaSpinner className="animate-spin" /> : <FaSave />} Kaydet
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="bg-white hover:bg-gray-200 text-black px-6 py-2 rounded-full font-bold text-sm transition-all shadow-lg flex items-center gap-2"
                                        >
                                            <FaEdit /> Profili Düzenle
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="flex justify-center md:justify-end mt-6 gap-3">
                                    <Link
                                        href={`/messages?startWith=${user.id}`}
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full font-bold text-sm transition-all shadow-lg flex items-center gap-2"
                                    >
                                        <FaCommentAlt /> Mesaj Gönder
                                    </Link>
                                    <button
                                        onClick={handleAddFriend}
                                        className="bg-white hover:bg-gray-200 text-black px-6 py-2 rounded-full font-bold text-sm transition-all shadow-lg flex items-center gap-2"
                                    >
                                        <FaUsers /> Arkadaş Ekle
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="h-px bg-gray-900 w-full"></div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-8">
                            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/50">
                                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-800">
                                    <h3 className="text-white font-bold text-sm tracking-wider">ROZET VİTRİNİ</h3>
                                </div>
                                <div className="flex gap-4">
                                    {profile.badges && profile.badges.length > 0 ? profile.badges.map(b => (
                                        <div key={b.id || Math.random()} className="w-20 h-20 bg-black border border-gray-800 rounded-lg flex items-center justify-center text-3xl text-yellow-500 hover:border-yellow-500/50 cursor-pointer transition-colors shadow-inner tooltip" title={b.name || b.badge?.name}>
                                            <IconRenderer iconName={b.icon || b.badge?.icon} />
                                        </div>
                                    )) : <div className="text-gray-600 italic">Henüz rozet kazanılmadı.</div>}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-gray-500 font-bold text-sm tracking-widest pl-1 mb-4 flex items-center gap-2">
                                    <span className="w-1 h-4 bg-pink-500 rounded-full"></span>
                                    SON AKTİVİTELER
                                </h3>

                                <div className="space-y-4">
                                    {allActivities.length > 0 ? allActivities.map((act) => {
                                        if (act.type === 'reading') {
                                            return (
                                                <Link href={`/books/${act.id}`} key={`reading-${act.id}`} className="bg-black border border-gray-800 rounded-xl p-3 flex gap-3 hover:bg-gray-900 transition-colors group">
                                                    <div className="w-14 h-20 shrink-0 relative rounded-lg overflow-hidden shadow-lg border border-gray-800">
                                                        {act.cover ? (
                                                            <img src={act.cover} alt={act.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs text-gray-600">No Img</div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 flex flex-col justify-center min-w-0">
                                                        <div className="flex items-center gap-2 text-xs text-pink-400 font-bold mb-1">
                                                            <FaBookOpen /> KİTAP OKUYOR
                                                        </div>
                                                        <h4 className="text-white text-sm font-bold line-clamp-1 group-hover:text-pink-400 transition-colors">{act.title}</h4>
                                                        <div className="mt-2 text-xs text-gray-500">
                                                            {act.percentage}% tamamlandı
                                                        </div>
                                                        <p className="text-[10px] text-gray-600 mt-1">
                                                            {act.date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                                        </p>
                                                    </div>
                                                </Link>
                                            );
                                        }
                                        if (act.type === 'review') {
                                            return (
                                                <div key={`review-${act.id}`} className="bg-black border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
                                                    <div className="flex items-center gap-2 text-xs text-yellow-400 font-bold mb-2">
                                                        <FaStar /> İNCELEME
                                                    </div>
                                                    <Link href={`/books/${act.bookId}`} className="flex gap-3 mb-2">
                                                        <div className="w-10 h-14 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                                                            {act.book?.cover ? <img src={act.book.cover} className="w-full h-full object-cover" /> : null}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-white text-sm font-bold">{act.book?.title}</h4>
                                                            <div className="flex text-yellow-500 text-xs mt-1">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <FaStar key={i} className={i < act.rating ? "" : "text-gray-800"} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                    <p className="text-gray-400 text-sm italic">"{act.content}"</p>
                                                    <p className="text-[10px] text-gray-600 mt-2 text-right">
                                                        {act.date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        if (act.type === 'post') {
                                            return (
                                                <div key={`post-${act.id}`} className="bg-black border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
                                                    <div className="flex items-center gap-2 text-xs text-blue-400 font-bold mb-2">
                                                        <FaCommentAlt /> GÖNDERİ
                                                    </div>
                                                    <p className="text-white text-sm">{act.content}</p>
                                                    {act.image && (
                                                        <div className="mt-2 rounded-lg overflow-hidden h-32 w-full relative">
                                                            <img src={act.image} className="object-cover w-full h-full" />
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1"><FaHeart /> {act._count?.likes || 0}</span>
                                                        <span className="flex items-center gap-1"><FaCommentAlt /> {act._count?.comments || 0}</span>
                                                        <span className="ml-auto">{act.date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    }) : (
                                        <div className="p-6 text-center bg-gray-900/30 rounded-xl border border-dashed border-gray-800 text-gray-600 text-sm">
                                            Henüz aktivite bulunmuyor.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gray-900/30 p-6 rounded-xl border border-gray-800">
                                <h3 className="text-white font-bold text-sm mb-4">SEVİYE {profile.level}</h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full border-4 border-white/10 flex items-center justify-center text-white font-bold bg-black text-2xl shadow-lg">
                                        {profile.level}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-xs text-gray-400 mb-2">
                                            <span>XP</span>
                                            <span>{profile.xp} / {profile.maxXp}</span>
                                        </div>
                                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all" style={{ width: `${xpPercentage}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Reading Goal (Only for Owner) */}
                            {isOwnProfile && (
                                <>
                                    <ReadingGoalCard />
                                    <DuelList userId={user.id} />
                                </>
                            )}

                            <div className="bg-gray-900/30 p-6 rounded-xl border border-gray-800 space-y-4">
                                <h3 className="text-white font-bold text-sm mb-2 opacity-50">İSTATİSTİKLER</h3>

                                <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
                                    <div className="flex items-center gap-3 text-gray-400">
                                        <FaBookOpen className="text-blue-500" />
                                        <span>Kitaplık</span>
                                    </div>
                                    <span className="text-white font-bold">{profile._count.library || 0}</span>
                                </div>

                                <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
                                    <div className="flex items-center gap-3 text-gray-400">
                                        <FaLayerGroup className="text-purple-500" />
                                        <span>Koleksiyonlar</span>
                                    </div>
                                    <span className="text-white font-bold">{profile._count.collections || 0}</span>
                                </div>

                                <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
                                    <div className="flex items-center gap-3 text-gray-400">
                                        <FaStar className="text-yellow-500" />
                                        <span>İncelemeler</span>
                                    </div>
                                    <span className="text-white font-bold">{profile._count.reviews || 0}</span>
                                </div>

                                <div className="flex justify-between items-center py-2">
                                    <div className="flex items-center gap-3 text-gray-400">
                                        <FaClock className="text-pink-500" />
                                        <span>Okuma Süresi</span>
                                    </div>
                                    <span className="text-white font-bold text-sm">{formatReadingTime(profile.totalReadingTime)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
