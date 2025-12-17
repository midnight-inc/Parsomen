"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { FaUsers, FaComments, FaBook, FaFire, FaTrophy, FaStar, FaChartLine, FaNewspaper, FaUserFriends, FaHeart, FaArrowRight, FaClock } from 'react-icons/fa';

export default function CommunityPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ users: 0, books: 0, reviews: 0 });
    const [topUsers, setTopUsers] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch leaderboard for top users
            const leaderboardRes = await fetch('/api/leaderboard?limit=5');
            const leaderboardData = await leaderboardRes.json();
            if (leaderboardData.success) {
                setTopUsers(leaderboardData.users || []);
            }

            // Fetch basic stats (could add a dedicated API later)
            // For now use leaderboard data

            // Fetch Events
            const eventsRes = await fetch('/api/community/events');
            const eventsData = await eventsRes.json();
            if (eventsData.success) {
                setEvents(eventsData.events || []);
            }
        } catch (error) {
            console.error('Failed to fetch community data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
            {/* Hero Header - Glass */}
            <div className="relative overflow-hidden rounded-3xl mb-12">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-gray-900/80 to-blue-900/50"></div>
                <div className="absolute inset-0 backdrop-blur-xl"></div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>

                <div className="relative p-8 sm:p-12 text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                        <FaUsers className="inline mr-3 text-purple-400" />
                        Topluluk
                    </h1>
                    <p className="text-gray-300 max-w-2xl mx-auto text-lg">
                        Binlerce kitapseverle tanış, arkadaşlarınla etkileşime geç
                    </p>
                </div>
            </div>

            {/* Quick Links - Glass Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                {[
                    { href: '/feed', icon: FaNewspaper, label: 'Sosyal Akış', desc: 'Arkadaş aktiviteleri', color: 'blue' },
                    { href: '/friends', icon: FaUserFriends, label: 'Arkadaşlar', desc: 'Arkadaşlarını yönet', color: 'green' },
                    { href: '/leaderboard', icon: FaTrophy, label: 'Lider Tablosu', desc: 'En aktif okurları gör', color: 'amber' },
                    { href: '/store', icon: FaBook, label: 'Kitaplık', desc: 'Kitapları keşfet', color: 'purple' },
                ].map((link, i) => (
                    <Link
                        key={i}
                        href={link.href}
                        className="group relative overflow-hidden rounded-2xl transition-all hover:scale-[1.02]"
                    >
                        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm border border-white/10 group-hover:border-white/20 rounded-2xl"></div>
                        <div className="relative p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl bg-${link.color}-500/10 border border-${link.color}-500/20 flex items-center justify-center`}>
                                    <link.icon className={`text-xl text-${link.color}-400`} />
                                </div>
                                <FaArrowRight className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">{link.label}</h3>
                            <p className="text-sm text-gray-500">{link.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Dynamic Events Section */}
                    <div className="space-y-6">
                        <div className="relative overflow-hidden rounded-2xl">
                            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm border border-white/10"></div>
                            <div className="relative p-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                                    <FaFire className="text-orange-400" /> Etkinlikler & Yarışmalar
                                </h2>

                                <div className="space-y-4">
                                    {/* Fetch events component or server-side logic would be better here, 
                                       but since this is client component, we'll need to fetch in useEffect or convert to server component.
                                       The original file is 'use client'. I will add fetch logic to the existing useEffect.
                                   */}
                                    {events.length > 0 ? (
                                        events.map((event) => (
                                            <div key={event.id} className="group relative overflow-hidden rounded-xl bg-black/40 border border-white/10 hover:border-purple-500/50 transition-all">
                                                <div className="grid grid-cols-1 sm:grid-cols-3 h-full">
                                                    <div className="relative h-40 sm:h-auto">
                                                        <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                        <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                                                            {event.type}
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2 p-5 flex flex-col justify-center">
                                                        <h3 className="text-lg font-bold text-white mb-2">{event.title}</h3>
                                                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>
                                                        <div className="flex items-center justify-between mt-auto">
                                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                                <FaClock /> Bitiş: {new Date(event.endDate).toLocaleDateString()}
                                                            </span>
                                                            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors">
                                                                Katıl
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 text-gray-500">
                                            Aktif etkinlik bulunmuyor.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Leaderboard */}
                <div className="space-y-6">
                    {/* Top Contributors */}
                    <div className="relative overflow-hidden rounded-2xl">
                        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm border border-white/10"></div>
                        <div className="relative p-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                                <FaChartLine className="text-green-400" /> En Aktif Okurlar
                            </h2>

                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="w-8 h-8 border-2 border-green-500/50 border-t-green-500 rounded-full animate-spin mx-auto"></div>
                                </div>
                            ) : topUsers.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">Henüz kullanıcı yok</p>
                            ) : (
                                <div className="space-y-2">
                                    {topUsers.map((contributor, index) => (
                                        <Link
                                            key={contributor.id}
                                            href={`/profile/${contributor.username}`}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
                                        >
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                                index === 1 ? 'bg-gray-400/20 text-gray-300 border border-gray-400/30' :
                                                    index === 2 ? 'bg-amber-700/20 text-amber-500 border border-amber-600/30' :
                                                        'bg-white/5 text-gray-500 border border-white/10'
                                                }`}>
                                                {index + 1}
                                            </span>
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/20 flex items-center justify-center overflow-hidden">
                                                {contributor.avatar ? (
                                                    <img src={contributor.avatar} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-lg">{contributor.username?.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-white">{contributor.username}</p>
                                                <p className="text-xs text-gray-500">Seviye {contributor.level || 1}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-green-400">{contributor.xp || 0}</p>
                                                <p className="text-xs text-gray-600">XP</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            <Link
                                href="/leaderboard"
                                className="block text-center mt-4 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                            >
                                Tüm Listeyi Gör →
                            </Link>
                        </div>
                    </div>

                    {/* CTA for non-logged users */}
                    {!user && (
                        <div className="relative overflow-hidden rounded-2xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 to-teal-900/30"></div>
                            <div className="absolute inset-0 backdrop-blur-sm border border-green-500/20 rounded-2xl"></div>
                            <div className="relative p-6 text-center">
                                <FaHeart className="text-4xl text-green-400 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-white mb-2">Topluluğa Katıl!</h3>
                                <p className="text-sm text-gray-400 mb-4">
                                    Arkadaşlarınla etkileşime geç ve binlerce kitapseverle tanış.
                                </p>
                                <Link
                                    href="/register"
                                    className="inline-block px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-300 rounded-xl transition-all font-medium"
                                >
                                    Ücretsiz Kayıt Ol
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
