"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FaHistory, FaBook, FaComment, FaImage, FaQuoteRight, FaArrowLeft, FaClock, FaStar } from 'react-icons/fa';
import Link from 'next/link';

export default function UserActivityPage() {
    const params = useParams();
    const { username } = params;
    const { user: currentUser } = useAuth();

    const [profileUser, setProfileUser] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const isOwnProfile = currentUser?.username === username;

    useEffect(() => {
        if (username) {
            fetchData();
        }
    }, [username]);

    const fetchData = async () => {
        try {
            // Fetch user profile with activities
            const res = await fetch(`/api/user/profile/${username}`);
            const data = await res.json();

            if (data.success && data.user) {
                setProfileUser(data.user);

                // Combine all activities
                const allActivities = [
                    ...(data.user.recentActivity || []).map(a => ({
                        type: 'reading',
                        title: a.title,
                        cover: a.cover,
                        percentage: a.percentage,
                        bookId: a.id,
                        date: new Date(a.lastRead)
                    })),
                    ...(data.user.reviews || []).map(r => ({
                        type: 'review',
                        bookTitle: r.book?.title,
                        rating: r.rating,
                        text: r.text,
                        bookId: r.bookId,
                        date: new Date(r.createdAt)
                    })),
                    ...(data.user.posts || []).map(p => ({
                        type: 'post',
                        content: p.content,
                        image: p.image,
                        likes: p._count?.likes || 0,
                        comments: p._count?.comments || 0,
                        date: new Date(p.createdAt)
                    }))
                ].sort((a, b) => b.date - a.date);

                setActivities(allActivities);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 60) return 'Az önce';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}dk önce`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}sa önce`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}g önce`;
        return date.toLocaleDateString('tr-TR');
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'reading': return <FaBook className="text-blue-400" />;
            case 'review': return <FaStar className="text-yellow-400" />;
            case 'post': return <FaImage className="text-purple-400" />;
            default: return <FaHistory className="text-gray-400" />;
        }
    };

    const getActivityText = (activity) => {
        switch (activity.type) {
            case 'reading':
                return `${activity.title} kitabını okuyor (%${Math.round(activity.percentage)})`;
            case 'review':
                return `${activity.bookTitle} için ${activity.rating}/5 puan verdi`;
            case 'post':
                return activity.content?.substring(0, 100) + (activity.content?.length > 100 ? '...' : '');
            default:
                return 'Aktivite';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 px-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-purple-500/50 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Aktiviteler yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="min-h-screen pt-24 px-8 flex items-center justify-center">
                <div className="text-center">
                    <FaHistory className="text-6xl text-gray-700 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Kullanıcı Bulunamadı</h2>
                    <Link href="/" className="text-purple-400 hover:text-purple-300">← Ana Sayfaya Dön</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8 max-w-4xl mx-auto">
            {/* Back link */}
            <Link
                href={`/profile/${username}`}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group"
            >
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                <span>{profileUser.username} profiline dön</span>
            </Link>

            {/* Glass Header Card */}
            <div className="relative overflow-hidden rounded-3xl mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-gray-900/80 to-purple-900/40"></div>
                <div className="absolute inset-0 backdrop-blur-xl"></div>

                <div className="relative p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                        {/* User Avatar */}
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-blue-500/30 flex items-center justify-center shrink-0 overflow-hidden">
                            {profileUser.avatar ? (
                                <img src={profileUser.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl font-bold text-white/30">{profileUser.username.charAt(0).toUpperCase()}</span>
                            )}
                        </div>

                        {/* Title */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-white mb-1">
                                <FaHistory className="inline mr-3 text-blue-400" />
                                {isOwnProfile ? 'Aktivitelerim' : `${profileUser.username} - Aktivite`}
                            </h1>
                            <p className="text-gray-400">
                                {activities.length === 0
                                    ? 'Henüz aktivite yok'
                                    : `${activities.length} aktivite`
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Timeline */}
            {activities.length === 0 ? (
                <div className="text-center py-16 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                    <FaHistory className="text-6xl text-gray-700 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Henüz Aktivite Yok</h3>
                    <p className="text-gray-500">
                        {isOwnProfile
                            ? 'Kitap oku, yorum yap veya paylaşım yap!'
                            : 'Bu kullanıcının henüz aktivitesi yok.'
                        }
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {activities.map((activity, index) => (
                        <div
                            key={index}
                            className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all"
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                    {getActivityIcon(activity.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-white">{getActivityText(activity)}</p>

                                    {/* Extra info based on type */}
                                    {activity.type === 'reading' && activity.cover && (
                                        <Link href={`/books/${activity.bookId}`} className="inline-flex items-center gap-2 mt-2 text-blue-400 hover:text-blue-300 text-sm">
                                            <FaBook /> Kitabı görüntüle
                                        </Link>
                                    )}

                                    {activity.type === 'review' && activity.text && (
                                        <p className="mt-2 text-gray-500 text-sm line-clamp-2">
                                            "{activity.text.substring(0, 150)}{activity.text.length > 150 ? '...' : ''}"
                                        </p>
                                    )}

                                    {activity.type === 'post' && activity.image && (
                                        <div className="mt-2 rounded-lg overflow-hidden max-w-xs">
                                            <img src={activity.image} alt="" className="w-full h-32 object-cover" />
                                        </div>
                                    )}
                                </div>

                                {/* Time */}
                                <span className="text-xs text-gray-500 whitespace-nowrap flex items-center gap-1">
                                    <FaClock className="text-[10px]" />
                                    {formatTimeAgo(activity.date)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
