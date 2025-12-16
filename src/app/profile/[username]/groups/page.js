"use client";
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { FaUsers, FaArrowLeft, FaHardHat } from 'react-icons/fa';
import Link from 'next/link';

export default function UserGroupsPage() {
    const params = useParams();
    const { username } = params;
    const { user: currentUser } = useAuth();

    const [profileUser, setProfileUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const isOwnProfile = currentUser?.username === username;

    useEffect(() => {
        if (username) {
            fetchProfile();
        }
    }, [username]);

    const fetchProfile = async () => {
        try {
            const res = await fetch(`/api/user/profile/${username}`);
            const data = await res.json();
            if (data.success && data.user) {
                setProfileUser(data.user);
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 px-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-green-500/50 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="min-h-screen pt-24 px-8 flex items-center justify-center">
                <div className="text-center">
                    <FaUsers className="text-6xl text-gray-700 mx-auto mb-4" />
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
                <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 via-gray-900/80 to-teal-900/40"></div>
                <div className="absolute inset-0 backdrop-blur-xl"></div>

                <div className="relative p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-600/20 to-teal-600/20 border border-green-500/30 flex items-center justify-center shrink-0">
                            <FaUsers className="text-4xl text-green-400" />
                        </div>

                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-white mb-1">
                                {isOwnProfile ? 'Okuma Gruplarım' : `${profileUser.username} - Gruplar`}
                            </h1>
                            <p className="text-gray-400">
                                Birlikte oku, tartış ve yeni arkadaşlıklar kur
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Coming Soon */}
            <div className="text-center py-20 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-600/20 to-teal-600/20 border border-green-500/30 flex items-center justify-center">
                    <FaHardHat className="text-4xl text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Yakında Geliyor!</h2>
                <p className="text-gray-400 max-w-md mx-auto mb-6">
                    Okuma grupları özelliği üzerinde çalışıyoruz. Çok yakında kitapseverlerle gruplar oluşturabilecek, birlikte okuyabilecek ve tartışabileceksiniz.
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Geliştirme aşamasında
                    </span>
                </div>
            </div>

            {/* Back to community */}
            <div className="mt-8 text-center">
                <Link
                    href="/community"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600/20 to-teal-600/20 hover:from-green-600/30 hover:to-teal-600/30 border border-green-500/30 text-white rounded-xl transition-all"
                >
                    <FaUsers className="text-green-400" /> Topluluk'a Git
                </Link>
            </div>
        </div>
    );
}
