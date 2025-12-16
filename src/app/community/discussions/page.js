"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FaComments, FaPlus, FaSearch, FaClock, FaEye, FaHeart, FaTimes, FaArrowLeft, FaHardHat, FaUsers } from 'react-icons/fa';

export default function DiscussionsPage() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8 max-w-5xl mx-auto">
            {/* Back link */}
            <Link
                href="/community"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group"
            >
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                <span>Topluluk</span>
            </Link>

            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-gray-900/80 to-blue-900/40"></div>
                <div className="absolute inset-0 backdrop-blur-xl"></div>

                <div className="relative p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                            <FaComments className="text-4xl text-purple-400" />
                        </div>

                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-white mb-1">Tartışmalar</h1>
                            <p className="text-gray-400">
                                Kitaplar hakkında sohbet et, fikirlerini paylaş
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Coming Soon */}
            <div className="text-center py-20 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 flex items-center justify-center">
                    <FaHardHat className="text-4xl text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Yakında Geliyor!</h2>
                <p className="text-gray-400 max-w-md mx-auto mb-6">
                    Tartışma forumu özelliği üzerinde çalışıyoruz. Çok yakında kitaplar hakkında tartışmalar başlatabilecek, fikirlerinizi paylaşabilecek ve diğer okurlarla sohbet edebileceksiniz.
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                        Geliştirme aşamasında
                    </span>
                </div>

                {/* Alternative - Feed link */}
                <div className="mt-8 pt-8 border-t border-white/10">
                    <p className="text-gray-500 mb-4">Şimdilik sosyal akışı kullanabilirsiniz:</p>
                    <Link
                        href="/feed"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 rounded-xl transition-all"
                    >
                        <FaUsers /> Sosyal Akış'a Git
                    </Link>
                </div>
            </div>
        </div>
    );
}
