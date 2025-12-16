import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';
import { FaBookOpen, FaCalendar, FaStar } from 'react-icons/fa';

export default async function LibraryPage() {
    const session = await getSession();

    // Redirect if not logged in (middleware handles strict routes but good to have safeguard)
    if (!session) {
        return <div className="p-20 text-center text-white">Lütfen önce giriş yapın.</div>;
    }

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
                <div className="text-center py-20 bg-gray-900/50 rounded-xl border border-gray-800 text-gray-400">
                    <p className="text-xl mb-4">Henüz kütüphanene kitap eklemedin.</p>
                    <Link href="/store" className="text-pink-500 hover:text-white underline">Kitapları Keşfet</Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {libraryItems.map((item) => (
                        <Link href={`/books/${item.book.id}`} key={item.id} className="group">
                            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-pink-500/50 transition-all shadow-lg h-full flex flex-col">
                                <div className="relative aspect-[2/3] overflow-hidden">
                                    {item.book.cover ? (
                                        <Image
                                            src={item.book.cover}
                                            alt={item.book.title}
                                            fill
                                            sizes="(max-width: 768px) 50vw, 20vw"
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">Kapak Yok</div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                        <span className="text-pink-400 font-bold text-sm bg-black/50 w-fit px-2 py-1 rounded backdrop-blur">
                                            {item.status === 'WANT_TO_READ' ? 'Okunacak' : 'Okunuyor'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="text-white font-bold line-clamp-1 group-hover:text-pink-500 transition-colors">{item.book.title}</h3>
                                    <p className="text-gray-400 text-xs mb-3">{item.book.author}</p>

                                    <div className="mt-auto flex justify-between items-center text-xs text-gray-500 border-t border-gray-800 pt-3">
                                        <span className="flex items-center gap-1"><FaStar className="text-yellow-500" /> {item.book.rating}</span>
                                        <span>{new Date(item.addedAt).toLocaleDateString('tr-TR')}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
