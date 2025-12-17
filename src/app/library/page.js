import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import { FaBookOpen, FaStar } from 'react-icons/fa';
import LibraryBookCard from '@/components/library/LibraryBookCard';

export default async function LibraryPage() {
    const session = await getSession();

    // Redirect if not logged in (middleware handles strict routes but good to have safeguard)
    if (!session) {
        return <div className="p-20 text-center text-white">Lütfen önce giriş yapın.</div>;
    }

    try {
        const libraryItems = await prisma.libraryEntry.findMany({
            where: { userId: session.user.id },
            include: {
                book: true
            },
            orderBy: { addedAt: 'desc' }
        });

        return (
            <div className="min-h-screen pt-24 px-4 max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8 border-l-4 border-pink-500 pl-4">Kütüphanem</h1>

                {libraryItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-gray-900/30 rounded-3xl border border-gray-800 text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-32 h-32 bg-gray-800/50 rounded-full flex items-center justify-center mb-6 relative">
                            <FaBookOpen className="text-6xl text-gray-700" />
                            <div className="absolute top-0 right-0 p-2 bg-pink-500 rounded-full animate-bounce">
                                <FaStar className="text-white text-xs" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Kütüphanen Henüz Boş</h2>
                        <p className="text-gray-400 mb-8 max-w-sm">
                            Henüz hiç kitap eklememişsin. Maceraya başlamak için mağazayı ziyaret et!
                        </p>
                        <Link href="/store">
                            <button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-pink-500/20 transition-all hover:scale-105">
                                📚 Kitapları Keşfet
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {libraryItems.map((item) => (
                            <LibraryBookCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        );
    } catch (error) {
        console.error("Library Page Error:", error);
        return (
            <div className="min-h-screen pt-24 px-4 text-center text-white">
                <h1 className="text-2xl font-bold text-red-500 mb-4">Bir Hata Oluştu</h1>
                <p className="text-gray-300">Kütüphane verileri yüklenirken bir sorun yaşandı.</p>
            </div>
        );
    }
}

