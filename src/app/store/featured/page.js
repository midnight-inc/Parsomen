import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar, FaFire, FaTheaterMasks, FaBookOpen, FaQuestionCircle, FaClock, FaFilm } from 'react-icons/fa';
import LiveReadingTicker from '@/components/store/LiveReadingTicker';
import QuoteOfTheDay from '@/components/store/QuoteOfTheDay';

// Mood options
const moods = [
    { id: 'sad', label: 'Hüzünlü', emoji: '😢', gradient: 'from-blue-900 to-gray-900' },
    { id: 'happy', label: 'Neşeli', emoji: '😄', gradient: 'from-yellow-600 to-orange-600' },
    { id: 'adventure', label: 'Maceracı', emoji: '🗺️', gradient: 'from-green-700 to-teal-600' },
    { id: 'romantic', label: 'Romantik', emoji: '💕', gradient: 'from-pink-600 to-rose-500' },
    { id: 'thriller', label: 'Gerilim', emoji: '😱', gradient: 'from-red-900 to-black' },
    { id: 'philosophical', label: 'Düşündürücü', emoji: '🤔', gradient: 'from-purple-900 to-indigo-800' },
];

export const dynamic = 'force-dynamic'; // Ensure page regenerates on every request for randomness

export default async function FeaturedPage() {
    // 1. Fetch featured book for Spotlight
    const spotlightBook = await prisma.book.findFirst({
        where: { rating: { gte: 4.5 } },
        include: { category: true },
        orderBy: { id: 'desc' }
    });

    // 2. Fetch "Rising Stars"
    const risingStars = await prisma.book.findMany({
        where: { rating: { gte: 4.0 } },
        include: { category: true },
        orderBy: { rating: 'desc' },
        take: 6
    });

    // 3. Randomize "Blind Date" Books
    const totalBooks = await prisma.book.count();
    const skip = Math.max(0, Math.floor(Math.random() * Math.max(0, totalBooks - 4)));

    const blindDateBooks = await prisma.book.findMany({
        include: { category: true },
        skip: skip,
        take: 4
    });

    // 4. Fetch Popular Categories
    const popularCategories = await prisma.category.findMany({
        include: {
            _count: {
                select: { books: true }
            }
        },
        orderBy: {
            books: {
                _count: 'desc'
            }
        },
        take: 6
    });

    // 5. Film Books
    const filmBooks = await prisma.book.findMany({
        include: { category: true },
        take: 4
    });

    // 6. Popular Books (Most Read)
    const popularBooks = await prisma.book.findMany({
        include: {
            category: true,
            _count: {
                select: { readingProgress: true }
            }
        },
        orderBy: {
            readingProgress: {
                _count: 'desc'
            }
        },
        take: 10
    });

    return (
        <div className="min-h-screen bg-black text-white pb-20 overflow-x-hidden">
            <LiveReadingTicker />

            <div className="pt-8 px-4 sm:px-8 max-w-[1600px] mx-auto">
                {/* Page Header */}
                <div className="mb-12 relative">
                    <h1 className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                        ÖNE<br />ÇIKANLAR
                    </h1>
                    <p className="text-gray-400 text-xl max-w-2xl font-light">
                        Topluluğun en çok konuştuğu, okuduğu ve puanladığı eserler burada.
                    </p>
                </div>

                {/* CINEMATIC HERO SPOTLIGHT */}
                {spotlightBook && (
                    <section className="mb-20">
                        <div className="relative rounded-[3rem] overflow-hidden bg-gray-900 border border-white/5 shadow-2xl group">
                            {/* Animated Background Glow */}
                            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-r from-indigo-900/30 via-purple-900/30 to-pink-900/30 group-hover:animate-spin-slow opacity-50 blur-3xl pointer-events-none" />

                            {/* Content */}
                            <div className="relative z-10 p-8 md:p-16 flex flex-col md:flex-row gap-12 items-center">
                                {/* 3D Cover Effect Area */}
                                <div className="w-64 md:w-80 flex-shrink-0 perspective-1000 group-hover:scale-105 transition-transform duration-500">
                                    <div className="relative aspect-[2/3] rounded-2xl shadow-2xl transform rotate-y-12 group-hover:rotate-y-0 transition-transform duration-700 bg-gray-800">
                                        {spotlightBook.cover ? (
                                            <Image src={spotlightBook.cover} alt={spotlightBook.title} fill className="object-cover rounded-2xl" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">Kapak Yok</div>
                                        )}
                                        {/* Reflection */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent rounded-2xl pointer-events-none" />
                                    </div>
                                </div>

                                <div className="flex-1 text-center md:text-left">
                                    <div className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-400 px-4 py-1.5 rounded-full text-sm font-bold tracking-wider mb-6 border border-orange-500/20">
                                        <FaFire /> HAFTANIN YILDIZI
                                    </div>
                                    <h2 className="text-4xl md:text-6xl font-black mb-4 leading-tight">{spotlightBook.title}</h2>
                                    <p className="text-2xl text-gray-300 font-serif italic mb-6">{spotlightBook.author}</p>
                                    <p className="text-gray-400 leading-relaxed mb-8 max-w-2xl mx-auto md:mx-0 text-lg">
                                        {spotlightBook.description || 'Bu kitap, sürükleyici anlatımı ve derin karakter analizleriyle editör ekibimizden tam not aldı.'}
                                    </p>

                                    <Link
                                        href={`/books/${spotlightBook.id}`}
                                        className="inline-flex items-center gap-3 bg-white text-black font-black text-lg px-10 py-4 rounded-2xl hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10"
                                    >
                                        <FaBookOpen /> ŞİMDİ OKU
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                <QuoteOfTheDay />

                {/* POPULAR BOOKS - MOST READ */}
                <section className="mb-20">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-orange-500/20 p-3 rounded-xl border border-orange-500/30">
                            <FaFire className="text-orange-500 text-xl" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold">Popüler Kitaplar</h2>
                            <p className="text-gray-500">Topluluğun elinden düşürmediği eserler</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {popularBooks.map((book, idx) => (
                            <Link key={book.id} href={`/books/${book.id}`} className="group relative">
                                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-white text-black font-black flex items-center justify-center shadow-lg border-2 border-orange-500 z-10">
                                    {idx + 1}
                                </div>
                                <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-lg group-hover:shadow-orange-500/20 transition-all duration-300 group-hover:-translate-y-1">
                                    {book.cover ? (
                                        <Image src={book.cover} alt={book.title} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-600">Kapak Yok</div>
                                    )}
                                </div>
                                <h4 className="font-bold text-white text-lg line-clamp-1 group-hover:text-orange-400 transition-colors">{book.title}</h4>
                                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                                    <span>{book.author}</span>
                                    <span className="flex items-center gap-1"><FaBookOpen /> {book._count?.readingProgress || 0} okur</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* HORIZONTAL COLLECTION SHOWCASE */}
                <section className="mb-20">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-1">Koleksiyon Vitrini</h2>
                            <p className="text-gray-500">Ruh haline göre seçilmiş listeler</p>
                        </div>
                    </div>

                    {/* Horizontal Scroll Container */}
                    <div className="flex gap-4 overflow-x-auto pb-8 -mx-4 px-4 snap-x scrollbar-hide flex-nowrap w-[100vw] md:w-full md:mask-linear-fade">
                        {moods.map(mood => (
                            <Link
                                key={mood.id}
                                href={`/store?mood=${mood.id}`}
                                className={`flex-shrink-0 w-64 snap-center bg-gradient-to-br ${mood.gradient} p-8 rounded-[2rem] relative overflow-hidden group hover:w-72 transition-all duration-300`}
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl group-hover:scale-110 transition-transform">{mood.emoji}</div>
                                <div className="relative z-10 h-full flex flex-col justify-end">
                                    <div className="text-4xl mb-2">{mood.emoji}</div>
                                    <h3 className="font-bold text-xl text-white mb-1">{mood.label}</h3>
                                    <p className="text-white/60 text-sm">Özel seçki</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* POPULAR CATEGORIES - NEW SECTION */}
                <section className="mb-20">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-blue-500/20 p-3 rounded-xl border border-blue-500/30">
                            <FaTheaterMasks className="text-blue-500 text-xl" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold">Popüler Kategoriler</h2>
                            <p className="text-gray-500">En çok okunan türler</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {popularCategories.map(cat => (
                            <Link
                                key={cat.id}
                                href={`/store?category=${encodeURIComponent(cat.name)}`}
                                className="group relative h-32 rounded-2xl overflow-hidden border border-white/5 hover:border-blue-500/50 transition-all"
                            >
                                {cat.image ? (
                                    <Image src={cat.image} alt={cat.name} fill className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient || 'from-gray-800 to-gray-900'} opacity-80`} />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4">
                                    <h3 className="font-bold text-lg text-white mb-1 group-hover:text-blue-400 transition-colors">{cat.name}</h3>
                                    <p className="text-xs text-gray-400">{cat._count?.books || 0} Kitap</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* KÖR RANDEVU - Now with Randomization */}
                <section className="mb-20">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-pink-500/20 p-3 rounded-xl border border-pink-500/30 backdrop-blur-md">
                            <FaQuestionCircle className="text-pink-500 text-xl" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Kör Randevu</h2>
                            <p className="text-gray-400">Her yenilemede sürpriz kitaplar</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {blindDateBooks.map((book, idx) => {
                            // Generate stable random gradients based on ID
                            const gradients = [
                                'from-pink-500/20 via-purple-500/20 to-indigo-500/20',
                                'from-blue-500/20 via-teal-500/20 to-emerald-500/20',
                                'from-orange-500/20 via-red-500/20 to-pink-500/20',
                                'from-violet-500/20 via-fuchsia-500/20 to-rose-500/20'
                            ];
                            const bgGradient = gradients[idx % gradients.length];

                            return (
                                <Link
                                    key={book.id}
                                    href={`/books/${book.id}`}
                                    className="group relative h-[400px] perspective-1000"
                                >
                                    <div className={`relative w-full h-full rounded-[2rem] overflow-hidden transition-all duration-500 bg-gradient-to-br ${bgGradient} border border-white/10 group-hover:border-white/30 shadow-2xl group-hover:shadow-pink-500/20 group-hover:-translate-y-2`}>

                                        {/* Dynamic Noise Texture & Glass Effect */}
                                        <div className="absolute inset-0 opacity-20 bg-[url('/patterns/noise.png')] mix-blend-overlay" />
                                        <div className="absolute inset-0 backdrop-blur-3xl" />

                                        {/* Animated Background Blobs */}
                                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-black/40 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

                                        {/* Main Content */}
                                        <div className="relative z-10 h-full p-8 flex flex-col items-center justify-between text-center">

                                            <div className="mt-8 relative">
                                                <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_50px_rgba(255,255,255,0.2)] transition-all duration-500 group-hover:scale-110">
                                                    <span className="group-hover:animate-pulse">?</span>
                                                </div>
                                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase text-white/70 border border-white/10">
                                                    GİZEMLİ
                                                </div>
                                            </div>

                                            <div className="space-y-4 w-full">
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-pink-300">
                                                        {book.category?.name || 'Roman'}
                                                    </span>
                                                    <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-blue-300">
                                                        {(book.pages || 324)} sf
                                                    </span>
                                                </div>

                                                <div className="text-white/60 text-sm italic font-serif px-2">
                                                    "{book.description ? book.description.substring(0, 60) : 'Duygusal derinliği olan, sizi başka diyarlara götürecek...'}..."
                                                </div>
                                            </div>

                                            <div className="w-full">
                                                <div className="w-full py-4 rounded-xl bg-white/10 border border-white/10 font-bold tracking-widest hover:bg-white hover:text-black transition-all duration-300 group-hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                                                    <FaTheaterMasks className="text-lg" />
                                                    KEŞFET
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
}
