"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FaMedal, FaCheck, FaTrophy, FaUsers, FaArrowLeft } from 'react-icons/fa';
import * as FaIcons from 'react-icons/fa';
import Link from 'next/link';

// Helper to render icon
function IconRenderer({ iconName, className }) {
    const Icon = FaIcons[iconName] || FaMedal;
    return <Icon className={className} />;
}

export default function UserBadgesPage() {
    const params = useParams();
    const { username } = params;
    const { user: currentUser } = useAuth();

    const [profileUser, setProfileUser] = useState(null);
    const [userBadges, setUserBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBadge, setSelectedBadge] = useState(null);

    const isOwnProfile = currentUser?.username === username;

    useEffect(() => {
        if (username) {
            fetchData();
        }
    }, [username]);

    const fetchData = async () => {
        try {
            // Fetch user profile with badges
            const profileRes = await fetch(`/api/user/profile/${username}`);
            const profileData = await profileRes.json();

            if (profileData.success && profileData.user) {
                setProfileUser(profileData.user);
                // User badges come with badge details included
                setUserBadges(profileData.user.badges || []);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 px-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-purple-500/50 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Rozetler yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="min-h-screen pt-24 px-8 flex items-center justify-center">
                <div className="text-center">
                    <FaMedal className="text-6xl text-gray-700 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Kullanıcı Bulunamadı</h2>
                    <Link href="/" className="text-purple-400 hover:text-purple-300">← Ana Sayfaya Dön</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8 max-w-6xl mx-auto">
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
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-gray-900/80 to-blue-900/40"></div>
                <div className="absolute inset-0 backdrop-blur-xl"></div>

                <div className="relative p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                        {/* User Avatar */}
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 p-0.5 shrink-0">
                            <div className="w-full h-full rounded-2xl bg-gray-900 flex items-center justify-center overflow-hidden">
                                {profileUser.avatar ? (
                                    <img src={profileUser.avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-white/30">{profileUser.username.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                        </div>

                        {/* Title */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-white mb-1">
                                <FaMedal className="inline mr-3 text-purple-400" />
                                {isOwnProfile ? 'Rozetlerim' : `${profileUser.username} - Rozetler`}
                            </h1>
                            <p className="text-gray-400">
                                {userBadges.length === 0
                                    ? 'Henüz rozet kazanılmamış'
                                    : `${userBadges.length} rozet kazanıldı`
                                }
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-4">
                            <div className="text-center px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-2xl font-bold text-white">{userBadges.length}</p>
                                <p className="text-xs text-gray-400">Rozet</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Badge Grid */}
            {userBadges.length === 0 ? (
                <div className="text-center py-16 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                    <FaMedal className="text-6xl text-gray-700 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Henüz Rozet Yok</h3>
                    <p className="text-gray-500">
                        {isOwnProfile
                            ? 'Kitap okuyarak ve aktiviteler yaparak rozet kazanabilirsin!'
                            : 'Bu kullanıcı henüz rozet kazanmamış.'
                        }
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {userBadges.map((userBadge) => {
                        const badge = userBadge.badge;
                        if (!badge) return null;

                        return (
                            <button
                                key={userBadge.id}
                                onClick={() => setSelectedBadge(userBadge)}
                                className="group relative aspect-square rounded-2xl border backdrop-blur-sm transition-all duration-300 overflow-hidden 
                                    bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
                            >
                                {/* Shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                {/* Badge content */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                                    <div className="text-3xl sm:text-4xl mb-2 transition-transform group-hover:scale-110 text-white">
                                        <IconRenderer iconName={badge.icon} className="w-8 h-8 sm:w-10 sm:h-10" />
                                    </div>
                                    <p className="text-xs font-medium text-center line-clamp-2 text-white/90">
                                        {badge.name}
                                    </p>
                                </div>

                                {/* Earned indicator */}
                                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500/80 backdrop-blur-sm flex items-center justify-center">
                                    <FaCheck className="text-white text-[10px]" />
                                </div>

                                {/* Earned date */}
                                <div className="absolute bottom-2 left-2 text-[10px] text-gray-400">
                                    {new Date(userBadge.earnedAt).toLocaleDateString('tr-TR')}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Badge Detail Modal */}
            {selectedBadge && selectedBadge.badge && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedBadge(null)}
                >
                    <div
                        className="relative bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md w-full animate-in zoom-in-95 duration-200 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedBadge(null)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        >
                            ✕
                        </button>

                        <div className="text-center">
                            {/* Badge Icon */}
                            <div className="w-24 h-24 mx-auto rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br from-purple-600/30 to-blue-600/30 border border-purple-500/30">
                                <IconRenderer iconName={selectedBadge.badge.icon} className="text-5xl text-white" />
                            </div>

                            {/* Badge Name */}
                            <h2 className="text-2xl font-bold text-white mb-2">{selectedBadge.badge.name}</h2>

                            {/* Status */}
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm mb-4">
                                <FaCheck /> Kazanıldı
                            </span>

                            {/* Description */}
                            <p className="text-gray-400 mb-4">{selectedBadge.badge.description || 'Bu rozet hakkında açıklama yok.'}</p>

                            {/* Earned date */}
                            <p className="text-gray-500 text-sm border-t border-white/10 pt-4">
                                Kazanılma Tarihi: {new Date(selectedBadge.earnedAt).toLocaleDateString('tr-TR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
