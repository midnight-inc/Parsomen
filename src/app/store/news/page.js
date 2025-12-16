"use client";
import { useState, useEffect } from 'react';
import { FaClock, FaFire, FaBookOpen, FaCalendar, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

// Demo news data - in production, this would come from an API/database
const demoNews = [
    {
        id: 1,
        title: 'Yeni Yıl Okuma Maratonu Başlıyor!',
        excerpt: 'Ocak ayı boyunca sürecek okuma maratonumuzda 10.000+ puan kazanma şansı!',
        image: '/uploads/news-marathon.jpg',
        category: 'Etkinlik',
        date: '2024-12-15',
        featured: true
    },
    {
        id: 2,
        title: 'Aralık Ayının En Çok Okunan Kitapları',
        excerpt: 'Bu ay topluluk tarafından en çok tercih edilen 10 kitabı keşfedin.',
        image: '/uploads/news-top10.jpg',
        category: 'Liste',
        date: '2024-12-10',
        featured: false
    },
    {
        id: 3,
        title: 'Yeni Tema: Kış Masalları',
        excerpt: 'Puan dükkanında yeni tema ve çerçeveler kullanıma açıldı!',
        image: '/uploads/news-theme.jpg',
        category: 'Güncelleme',
        date: '2024-12-08',
        featured: false
    },
    {
        id: 4,
        title: 'Yazar Söyleşisi: Ahmet Ümit',
        excerpt: 'Polisiye edebiyatının ustası ile özel röportaj.',
        image: '/uploads/news-interview.jpg',
        category: 'Röportaj',
        date: '2024-12-05',
        featured: false
    },
];

const categoryColors = {
    'Etkinlik': 'bg-green-500',
    'Liste': 'bg-blue-500',
    'Güncelleme': 'bg-purple-500',
    'Röportaj': 'bg-orange-500',
};

export default function NewsPage() {
    const [news, setNews] = useState(demoNews);
    const featuredNews = news.find(n => n.featured);
    const regularNews = news.filter(n => !n.featured);

    return (
        <>
            <div className="min-h-screen pt-24 px-4 sm:px-8 max-w-[1600px] mx-auto text-white pb-20">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                        Haberler & Duyurular
                    </h1>
                    <p className="text-gray-400 text-lg">Kitap dünyasından ve Parsomen'den en güncel haberler.</p>
                </div>

                {/* Featured News */}
                {featuredNews && (
                    <div className="mb-12">
                        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900 to-cyan-900 group">
                            <div className="absolute inset-0 bg-black/50 z-10" />
                            {featuredNews.image && (
                                <div className="absolute inset-0">
                                    <div className="w-full h-full bg-gradient-to-r from-blue-600 to-cyan-600 opacity-30" />
                                </div>
                            )}
                            <div className="relative z-20 p-8 md:p-12">
                                <div className={`inline-block ${categoryColors[featuredNews.category] || 'bg-gray-500'} text-white text-xs font-bold px-3 py-1 rounded-full mb-4`}>
                                    🔥 {featuredNews.category}
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black mb-4 group-hover:text-blue-300 transition-colors">
                                    {featuredNews.title}
                                </h2>
                                <p className="text-gray-300 text-lg mb-6 max-w-2xl">{featuredNews.excerpt}</p>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                                        <FaCalendar />
                                        {new Date(featuredNews.date).toLocaleDateString('tr-TR')}
                                    </div>
                                    <Link href={`/news/${featuredNews.id}`} className="inline-flex items-center gap-2 bg-white text-black font-bold px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                                        Devamını Oku <FaArrowRight />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* News Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {regularNews.map(item => (
                        <article key={item.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition-all group">
                            {/* Thumbnail */}
                            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-700 relative">
                                <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                                    <FaBookOpen className="text-4xl" />
                                </div>
                                <div className={`absolute top-3 left-3 ${categoryColors[item.category] || 'bg-gray-500'} text-white text-xs font-bold px-2 py-1 rounded`}>
                                    {item.category}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <div className="flex items-center gap-2 text-gray-500 text-xs mb-3">
                                    <FaClock />
                                    {new Date(item.date).toLocaleDateString('tr-TR')}
                                </div>
                                <h3 className="font-bold text-lg text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                                    {item.title}
                                </h3>
                                <p className="text-gray-400 text-sm line-clamp-2 mb-4">{item.excerpt}</p>
                                <Link href={`/news/${item.id}`} className="text-blue-400 text-sm font-medium hover:underline">
                                    Devamını oku →
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </>
    );
}
