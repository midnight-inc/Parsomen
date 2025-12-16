"use client";
import { useState, useEffect } from 'react';
import { FaTrophy, FaClock, FaBook, FaStar, FaMedal } from 'react-icons/fa';

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [filteredLeaderboard, setFilteredLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeType, setActiveType] = useState('time');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchLeaderboard(activeType);
    }, [activeType]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredLeaderboard(leaderboard);
        } else {
            const lowerQuery = searchQuery.toLowerCase();
            const filtered = leaderboard.filter(user =>
                user.username?.toLowerCase().includes(lowerQuery)
            );
            setFilteredLeaderboard(filtered);
        }
    }, [searchQuery, leaderboard]);

    const fetchLeaderboard = async (type) => {
        setLoading(true);
        try {
            // Add timestamp to prevent caching
            const res = await fetch(`/api/leaderboard?type=${type}&limit=100&t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                setLeaderboard(data.leaderboard || []);
                setFilteredLeaderboard(data.leaderboard || []);
            }
        } catch (error) {
            console.error('Leaderboard fetch error');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours} saat ${minutes} dk`;
        }
        return `${minutes} dakika`;
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <FaTrophy className="text-yellow-400 text-xl" />;
        if (rank === 2) return <FaMedal className="text-gray-300 text-xl" />;
        if (rank === 3) return <FaMedal className="text-amber-600 text-xl" />;
        return <span className="text-white/50 font-bold text-lg">#{rank}</span>;
    };

    const getRankBg = (rank) => {
        if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-yellow-500/30';
        if (rank === 2) return 'bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/30';
        if (rank === 3) return 'bg-gradient-to-r from-amber-600/20 to-orange-500/10 border-amber-600/30';
        return 'bg-white/5 border-white/10';
    };

    const tabs = [
        { id: 'time', label: 'En Çok Okuyan', icon: <FaClock className="text-purple-400" />, description: 'Toplam okuma süresi' },
        { id: 'books', label: 'En Çok Kitap', icon: <FaBook className="text-emerald-400" />, description: 'Tamamlanan kitap sayısı' },
        { id: 'xp', label: 'En Yüksek XP', icon: <FaStar className="text-yellow-400" />, description: 'Toplam deneyim puanı' }
    ];

    return (
        <div className="min-h-screen pt-24 px-4 max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                    <FaTrophy className="text-yellow-400" />
                    Sıralamalar
                </h1>
                <p className="text-gray-400">En iyi okuyucuları keşfet!</p>
            </div>

            {/* Search Bar */}
            <div className="mb-8 relative max-w-xl mx-auto">
                <input
                    type="text"
                    placeholder="Kullanıcı ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-colors"
                />
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveType(tab.id)}
                        className={`p-4 rounded-xl border transition-all ${activeType === tab.id
                            ? 'bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/50 shadow-lg shadow-pink-500/10'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2 mb-2">
                            {tab.icon}
                            <span className={`font-bold ${activeType === tab.id ? 'text-white' : 'text-white/70'}`}>
                                {tab.label}
                            </span>
                        </div>
                        <p className="text-xs text-white/50 hidden sm:block">{tab.description}</p>
                    </button>
                ))}
            </div>

            {/* Leaderboard */}
            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-20 text-white/50">Yükleniyor...</div>
                ) : filteredLeaderboard.length === 0 ? (
                    <div className="text-center py-20 text-white/50">
                        {searchQuery ? 'Kullanıcı bulunamadı.' : 'Henüz veri yok.'}
                    </div>
                ) : (
                    filteredLeaderboard.map((user) => (
                        <a
                            href={`/profile/${user.username ? user.username : 'user/' + user.id}`} // Assuming robust profile routing or ID
                            // Actually, let's assume /profile/ID for safety if username not guaranteed unique or encoded
                            // Wait, schema has unique username. 
                            // Safer link: `/profile/${user.id}` if we implement ID routing, or just `/profile` if it's 'me'. 
                            // But for other users we need a public profile page. 
                            // Task 1: "kullanıcının profiline göndersin". 
                            // I haven't implemented public profile page yet. 
                            // I will use href={`/profile/${user.id}`} and assume I might need to create that page if not exists.
                            // Currently `profile/me` exists. I probably need `profile/[id]`.
                            // For now I'll link to `/profile/${user.id}`.

                            onClick={(e) => {
                                // If I haven't made dynamic profile page, this link will 404. 
                                // But the user requested "profiline göndersin". 
                                // I will check route structure next.
                            }}
                            key={user.id}
                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.01] cursor-pointer group ${getRankBg(user.rank)}`}
                        >
                            {/* Rank */}
                            <div className="w-12 flex justify-center">
                                {getRankIcon(user.rank)}
                            </div>

                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                                {user.username?.[0]?.toUpperCase() || '?'}
                            </div>

                            {/* User Info */}
                            <div className="flex-1">
                                <p className="text-white font-bold group-hover:text-purple-400 transition-colors">{user.username}</p>
                                <p className="text-white/50 text-sm">Seviye {user.level}</p>
                            </div>

                            {/* Stat */}
                            <div className="text-right">
                                {activeType === 'time' && (
                                    <>
                                        <p className="text-purple-400 font-bold text-lg">{formatTime(user.totalReadTime)}</p>
                                        <p className="text-white/40 text-xs">okuma süresi</p>
                                    </>
                                )}
                                {activeType === 'books' && (
                                    <>
                                        <p className="text-emerald-400 font-bold text-lg">{user.booksRead} kitap</p>
                                        <p className="text-white/40 text-xs">tamamlandı</p>
                                    </>
                                )}
                                {activeType === 'xp' && (
                                    <>
                                        <p className="text-yellow-400 font-bold text-lg">{user.xp?.toLocaleString()} XP</p>
                                        <p className="text-white/40 text-xs">deneyim puanı</p>
                                    </>
                                )}
                            </div>
                        </a>
                    ))
                )}
            </div>
        </div>
    );
}
