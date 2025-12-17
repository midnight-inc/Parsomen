import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar, FaFire, FaEye, FaTheaterMasks, FaHeart, FaBookOpen, FaQuestionCircle, FaClock, FaFilm, FaTrophy, FaCalendar, FaScroll, FaGuitar, FaCloudRain, FaSmile, FaGhost, FaBrain, FaRocket, FaLandmark, FaMapMarkedAlt } from 'react-icons/fa';


// Mood options
const moods = [
    { id: 'sad', label: 'Hüzünlü', icon: <FaCloudRain />, gradient: 'from-blue-900 to-gray-900' },
    { id: 'happy', label: 'Neşeli', icon: <FaSmile />, gradient: 'from-yellow-600 to-orange-600' },
    { id: 'adventure', label: 'Maceracı', icon: <FaMapMarkedAlt />, gradient: 'from-green-700 to-teal-600' },
    { id: 'romantic', label: 'Romantik', icon: <FaHeart />, gradient: 'from-pink-600 to-rose-500' },
    { id: 'thriller', label: 'Gerilim', icon: <FaGhost />, gradient: 'from-red-900 to-black' },
    { id: 'philosophical', label: 'Düşündürücü', icon: <FaBrain />, gradient: 'from-purple-900 to-indigo-800' },
];

export default async function EditorChoicePage() {
    // Fetch featured book for Spotlight
    const spotlightBook = await prisma.book.findFirst({
        where: { rating: { gte: 4.5 } },
        include: { category: true },
        orderBy: { id: 'desc' }
    });

    // Fetch "Rising Stars" - Remove strict rating floor to ensure items show up
    const risingStars = await prisma.book.findMany({
        orderBy: [
            { rating: 'desc' }, // Highest rated first
            { id: 'desc' }      // Then newest
        ],
        take: 6
    });

    // Fetch books for "Blind Date"
    const blindDateBooks = await prisma.book.findMany({
        include: { category: true },
        // Randomize
        take: 4,
        orderBy: { id: 'asc' }, // Temporary stable sort found
        skip: Math.floor(Math.random() * 10)
    });

    // Fetch books with known film adaptations
    // Since we don't have a 'hasFilm' flag, we search for likely candidates by title keywords
    // Keywords: Harry Potter, Lord of the Rings, Dune, Hunger Games, Game of Thrones, Godfather, It, Misery, Marslı, 1984
    const filmKeywords = ['Harry', 'Potter', 'Dune', 'Yüzüklerin', 'Rings', 'Hobbit', 'Açlık', 'Hunger', 'Thrones', 'Baba', 'Godfather', 'It', 'Misery', 'Yeşil', 'Green', 'Dövüş', 'Fight', 'Marslı', 'Martian', '1984'];

    const filmBooks = await prisma.book.findMany({
        where: {
            OR: filmKeywords.map(k => ({ title: { contains: k } }))
        },
        include: { category: true },
        take: 4
    });

    // Fallback if not enough known films found
    if (filmBooks.length < 4) {
        const extraBooks = await prisma.book.findMany({
            where: {
                id: { notIn: filmBooks.map(b => b.id) }
            },
            take: 4 - filmBooks.length,
            orderBy: { rating: 'desc' }
        });
        filmBooks.push(...extraBooks);
    }

    return (
        <>
            <div className="min-h-screen pt-24 px-4 sm:px-8 max-w-[1600px] mx-auto text-white pb-20">
                {/* Page Header */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                        Editörün Seçimi
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl">
                        El yapımı küratörlük listeleri, gizli cevherler ve size özel öneriler.
                    </p>
                </div>

                {/* SPOTLIGHT - Hero Section */}
                {spotlightBook && (
                    <section className="mb-16">
                        <div className="flex items-center gap-3 mb-6">
                            <FaFire className="text-orange-500" />
                            <h2 className="text-2xl font-bold">Haftanın Yıldızı</h2>
                        </div>
                        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 p-1">
                            <div className="relative bg-gray-950 rounded-[22px] overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent z-10" />
                                {spotlightBook.cover && (
                                    <Image
                                        src={spotlightBook.cover}
                                        alt={spotlightBook.title}
                                        fill
                                        className="object-cover opacity-40"
                                    />
                                )}
                                <div className="relative z-20 p-8 md:p-12 flex flex-col md:flex-row gap-8">
                                    <div className="w-48 md:w-64 flex-shrink-0">
                                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
                                            {spotlightBook.cover ? (
                                                <Image src={spotlightBook.cover} alt={spotlightBook.title} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-800 flex items-center justify-center">Kapak Yok</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <span className="text-orange-500 font-bold text-sm uppercase tracking-wider mb-2">
                                            🏆 Editörün Seçimi
                                        </span>
                                        <h3 className="text-3xl md:text-4xl font-black mb-2">{spotlightBook.title}</h3>
                                        <p className="text-xl text-gray-400 mb-4">{spotlightBook.author}</p>
                                        <p className="text-gray-300 leading-relaxed mb-6 line-clamp-3">
                                            {spotlightBook.description || 'Bu kitap editörümüzün özel seçkisi.'}
                                        </p>
                                        <div className="flex items-center gap-2 mb-6">
                                            <FaStar className="text-yellow-500" />
                                            <span className="font-bold">{spotlightBook.rating}</span>
                                            <span className="text-gray-500">•</span>
                                            <span className="text-gray-400">{spotlightBook.category?.name}</span>
                                        </div>
                                        <Link
                                            href={`/books/${spotlightBook.id}`}
                                            className="inline-flex items-center gap-2 bg-white text-black font-bold px-8 py-3 rounded-xl hover:bg-gray-200 transition-colors w-fit"
                                        >
                                            <FaBookOpen /> Keşfet
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* MOOD SELECTOR */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <FaTheaterMasks className="text-purple-500" />
                        <h2 className="text-2xl font-bold">Nasıl Hissediyorsun?</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {moods.map(mood => (
                            <Link
                                key={mood.id}
                                href={`/store?mood=${mood.id}`}
                                className={`bg-gradient-to-br ${mood.gradient} p-6 rounded-2xl text-center hover:scale-105 transition-transform cursor-pointer group`}
                            >
                                <div className="text-4xl mb-2">{mood.emoji}</div>
                                <div className="font-bold text-white group-hover:underline">{mood.label}</div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* YÜKSELEN YILDIZLAR (Rising Stars) */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <FaStar className="text-yellow-500" />
                        <h2 className="text-2xl font-bold">Yükselen Yıldızlar</h2>
                        <span className="text-gray-500 text-sm">En yüksek puanlılar</span>
                    </div>
                    {risingStars.length > 0 ? (
                        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-6">
                            {risingStars.map(book => (
                                <Link key={book.id} href={`/books/${book.id}`} className="group">
                                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-lg group-hover:shadow-xl transition-shadow">
                                        {book.cover ? (
                                            <Image src={book.cover} alt={book.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-600">Kapak Yok</div>
                                        )}
                                        <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                            <FaStar className="text-[10px]" /> {book.rating || '?'}
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-yellow-500 transition-colors">{book.title}</h4>
                                    <p className="text-gray-500 text-xs">{book.author}</p>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-500 italic">Henüz yeterli veri yok.</div>
                    )}
                </section>

                {/* KİTAP VS FİLM */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <FaFilm className="text-red-500" />
                        <h2 className="text-2xl font-bold">Kitap vs Film</h2>
                        <span className="text-gray-500 text-sm">Ünlü Uyarlamalar</span>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-4">
                        {filmBooks.map(book => {
                            // Check for hardcoded film title or fallback
                            const knownAdaptations = {
                                'Harry Potter': 'Harry Potter ve Felsefe Taşı',
                                'Dune': 'Dune: Çöl Gezegeni',
                                'Yüzüklerin Efendisi': 'Yüzüklerin Efendisi: Yüzük Kardeşliği',
                                'The Lord of the Rings': 'The Lord of the Rings',
                                'Hobbit': 'Hobbit: Beklenmedik Yolculuk',
                                'Hunger Games': 'Açlık Oyunları',
                                'Açlık Oyunları': 'Açlık Oyunları',
                                'Game of Thrones': 'Game of Thrones (Dizi)',
                                'Taht Oyunları': 'Game of Thrones (Dizi)',
                                'The Godfather': 'The Godfather',
                                'Baba': 'The Godfather',
                                'It': 'O (It)',
                                'O': 'O (It)',
                                'Misery': 'Misery',
                                'Green Mile': 'Yeşil Yol',
                                'Yeşil Yol': 'Yeşil Yol',
                                'Fight Club': 'Dövüş Kulübü',
                                'Dövüş Kulübü': 'Dövüş Kulübü',
                                'Martian': 'Marslı',
                                'Marslı': 'Marslı',
                                '1984': '1984',
                            };

                            // Simple substring match for Mapping
                            const filmTitle = Object.keys(knownAdaptations).find(key => book.title.includes(key))
                                ? knownAdaptations[Object.keys(knownAdaptations).find(key => book.title.includes(key))]
                                : `Film Uyarlaması: ${book.title}`;

                            return (
                                <Link key={book.id} href={`/books/${book.id}`} className="group relative">
                                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-lg group-hover:scale-[1.02] transition-transform duration-300">
                                        {book.cover ? (
                                            <Image src={book.cover} alt={book.title} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-600">Kapak Yok</div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                                        {/* Film Strip Effect */}
                                        <div className="absolute top-0 inset-x-0 h-4 bg-black/50 flex gap-1 justify-center p-0.5">
                                            {[...Array(6)].map((_, i) => <div key={i} className="h-full w-3 bg-white/20 rounded-sm"></div>)}
                                        </div>
                                        <div className="absolute bottom-0 inset-x-0 h-4 bg-black/50 flex gap-1 justify-center p-0.5">
                                            {[...Array(6)].map((_, i) => <div key={i} className="h-full w-3 bg-white/20 rounded-sm"></div>)}
                                        </div>

                                        <div className="absolute bottom-6 left-3 right-3">
                                            <div className="text-red-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                                <FaFilm /> FİLM:
                                            </div>
                                            <div className="text-white text-sm font-bold leading-tight drop-shadow-md">
                                                {filmTitle}
                                            </div>
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-white text-sm line-clamp-1 px-1">{book.title}</h4>
                                    <p className="text-gray-500 text-xs px-1">{book.author}</p>
                                </Link>
                            )
                        })}
                    </div>
                </section>

                {/* ZAMAN KAPSÜLÜ */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <FaClock className="text-amber-500" />
                        <h2 className="text-2xl font-bold">Zaman Kapsülü</h2>
                        <span className="text-gray-500 text-sm">Nostaljik Okumalar</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-amber-900/50 to-orange-900/50 rounded-2xl p-6 border border-amber-800/50">
                            <div className="text-3xl mb-2"><FaScroll className="inline" /></div>
                            <h3 className="font-bold text-xl mb-2">Klasikler</h3>
                            <p className="text-gray-400 text-sm">Zaman geçtikçe değeri artan eserler</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-2xl p-6 border border-purple-800/50">
                            <div className="text-3xl mb-2"><FaGuitar className="inline" /></div>
                            <h3 className="font-bold text-xl mb-2">80'ler & 90'lar</h3>
                            <p className="text-gray-400 text-sm">Retro dönemin unutulmaz eserleri</p>
                        </div>
                        <div className="bg-gradient-to-br from-teal-900/50 to-cyan-900/50 rounded-2xl p-6 border border-teal-800/50">
                            <div className="text-3xl mb-2"><FaCalendar className="inline" /></div>
                            <h3 className="font-bold text-xl mb-2">Tarihte Bugün</h3>
                            <p className="text-gray-400 text-sm">Bu tarihte yayınlanan eserler</p>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
