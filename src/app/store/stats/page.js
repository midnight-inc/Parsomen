"use client";
import { useState, useEffect } from 'react';
import { FaFire, FaBook, FaClock, FaStar, FaChartPie, FaCalendarAlt, FaTrophy, FaUserAstronaut, FaSpinner } from 'react-icons/fa';

// Heatmap component (demo - would need real data API)
function ReadingHeatmap() {
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

    // TODO: Fetch from API when reading session logging is implemented
    const [heatmapData] = useState(() => {
        const data = [];
        for (let week = 0; week < 52; week++) {
            const weekData = [];
            for (let day = 0; day < 7; day++) {
                weekData.push(0); // Empty until real data
            }
            data.push(weekData);
        }
        return data;
    });

    const getColor = (level) => {
        const colors = ['bg-gray-800', 'bg-green-900', 'bg-green-700', 'bg-green-500', 'bg-green-400'];
        return colors[level] || colors[0];
    };

    return (
        <div className="overflow-x-auto">
            <div className="flex gap-1 min-w-[800px]">
                {heatmapData.map((week, weekIdx) => (
                    <div key={weekIdx} className="flex flex-col gap-1">
                        {week.map((day, dayIdx) => (
                            <div key={dayIdx} className={`w-3 h-3 rounded-sm ${getColor(day)}`} />
                        ))}
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
                {months.map(m => <span key={m}>{m}</span>)}
            </div>
        </div>
    );
}

// Progress Ring component
function ProgressRing({ progress, color, size = 120, label, value }) {
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" className="text-gray-800" />
                <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-500" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white">{value}</span>
                <span className="text-xs text-gray-500">{label}</span>
            </div>
        </div>
    );
}

const personalities = [
    { id: 'night_owl', name: 'Gece Kuşu', emoji: '🦉', min: 0 },
    { id: 'casual', name: 'Rahat Okur', emoji: '📖', min: 5 },
    { id: 'bookworm', name: 'Kitap Kurdu', emoji: '🐛', min: 20 },
    { id: 'page_monster', name: 'Sayfa Canavarı', emoji: '⚡', min: 50 },
];

export default function StatsPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/user/stats');
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Stats fetch failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPersonality = (totalBooks) => {
        for (let i = personalities.length - 1; i >= 0; i--) {
            if (totalBooks >= personalities[i].min) {
                return personalities[i];
            }
        }
        return personalities[0];
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <FaSpinner className="text-4xl text-indigo-500 animate-spin" />
            </div>
        );
    }

    const personality = stats ? getPersonality(stats.completedBooks) : personalities[0];
    const genreColors = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'];

    return (
        <>
            <div className="min-h-screen pt-24 px-4 sm:px-8 max-w-[1600px] mx-auto text-white pb-20">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
                        Okuma İstatistiklerin
                    </h1>
                    <p className="text-gray-400 text-lg">Okuma yolculuğunun detaylı analizi</p>
                </div>

                {/* Reading Personality */}
                <section className="mb-12">
                    <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-3xl p-8 border border-purple-500/30">
                        <div className="flex items-center gap-6">
                            <div className="text-6xl">{personality.emoji}</div>
                            <div>
                                <div className="text-sm text-purple-400 uppercase font-bold tracking-wider mb-1">Okuma Kişiliğin</div>
                                <h2 className="text-3xl font-black text-white mb-1">{personality.name}</h2>
                                <p className="text-gray-400">{stats?.completedBooks || 0} kitap okudun</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Quick Stats */}
                <section className="mb-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
                            <FaBook className="text-3xl text-blue-500 mx-auto mb-3" />
                            <div className="text-3xl font-black text-white">{stats?.completedBooks || 0}</div>
                            <div className="text-gray-500 text-sm">Kitap Okundu</div>
                        </div>
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
                            <FaFire className="text-3xl text-orange-500 mx-auto mb-3" />
                            <div className="text-3xl font-black text-white">{stats?.totalPages?.toLocaleString() || 0}</div>
                            <div className="text-gray-500 text-sm">Toplam Sayfa</div>
                        </div>
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
                            <FaClock className="text-3xl text-green-500 mx-auto mb-3" />
                            <div className="text-3xl font-black text-white">
                                {stats?.totalReadTimeHours || 0}s {stats?.totalReadTimeMinutes % 60 || 0}dk
                            </div>
                            <div className="text-gray-500 text-sm">Okuma Süresi</div>
                        </div>
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
                            <FaTrophy className="text-3xl text-yellow-500 mx-auto mb-3" />
                            <div className="text-3xl font-black text-white">{stats?.streak || 0}</div>
                            <div className="text-gray-500 text-sm">Gün Seri</div>
                        </div>
                    </div>
                </section>

                {/* Progress Rings */}
                <section className="mb-12">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <FaCalendarAlt className="text-indigo-500" /> Hedefler
                    </h3>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                        <div className="flex justify-around flex-wrap gap-8">
                            <div className="flex flex-col items-center">
                                <ProgressRing progress={stats?.readingBooks ? 100 : 0} color="#10B981" value={stats?.readingBooks || 0} label="okuyor" />
                                <span className="mt-3 text-gray-400">Devam Eden</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <ProgressRing progress={stats?.completedBooks ? Math.min(stats.completedBooks * 10, 100) : 0} color="#3B82F6" value={stats?.completedBooks || 0} label="kitap" />
                                <span className="mt-3 text-gray-400">Tamamlanan</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <ProgressRing progress={stats?.wantToReadBooks ? 50 : 0} color="#8B5CF6" value={stats?.wantToReadBooks || 0} label="bekliyor" />
                                <span className="mt-3 text-gray-400">Okumak İstiyor</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Heatmap */}
                <section className="mb-12">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <FaFire className="text-green-500" /> Okuma Isı Haritası
                    </h3>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <ReadingHeatmap />
                        <p className="text-center text-gray-500 text-sm mt-4">
                            Detaylı okuma verisi yakında eklenecek
                        </p>
                    </div>
                </section>

                {/* Top Authors & Genres */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <section>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <FaUserAstronaut className="text-pink-500" /> En Çok Okuduğun Yazarlar
                        </h3>
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                            {stats?.topAuthors?.length > 0 ? (
                                stats.topAuthors.map((author, idx) => (
                                    <div key={author.name} className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-sm font-bold">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-1">
                                                <span className="font-medium text-white">{author.name}</span>
                                                <span className="text-gray-500 text-sm">{author.count} kitap</span>
                                            </div>
                                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" style={{ width: `${Math.min(author.count * 20, 100)}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">Henüz kitap eklenmedi</p>
                            )}
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <FaChartPie className="text-blue-500" /> Tür Dağılımı
                        </h3>
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                            {stats?.genreDistribution?.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {stats.genreDistribution.map((genre, idx) => (
                                        <div key={genre.name} className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: genreColors[idx % genreColors.length] }} />
                                            <span className="text-sm text-gray-300">{genre.name}</span>
                                            <span className="text-sm text-gray-500">%{genre.percentage}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">Henüz tür verisi yok</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
