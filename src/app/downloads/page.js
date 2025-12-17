import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';
import { FaDownload, FaFilePdf } from 'react-icons/fa';

export default async function DownloadsPage() {
    const session = await getSession();

    if (!session) return <div className="p-20 text-center text-white">Giriş yapmalısınız.</div>;

    const downloads = await prisma.userDownload.findMany({
        where: { userId: session.user.id },
        include: {
            book: true
        },
        orderBy: { downloadedAt: 'desc' }
    });

    return (
        <div className="min-h-screen pt-24 px-4 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8 border-l-4 border-blue-500 pl-4">İndirilenler</h1>

            {downloads.length === 0 ? (
                <div className="text-center py-20 bg-gray-900/50 rounded-xl border border-gray-800 text-gray-400">
                    <p className="text-xl mb-4">Henüz bir kitap indirmedin.</p>
                    <Link href="/store" className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors">
                        Mağazaya Git
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {downloads.map((item) => (
                        <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 bg-gray-900 border border-gray-800 p-4 rounded-xl hover:bg-gray-800 transition-colors group">
                            <div className="w-16 h-24 relative flex-shrink-0 overflow-hidden rounded bg-gray-800">
                                {item.book.cover && (
                                    <Image
                                        src={item.book.cover}
                                        alt={item.book.title}
                                        fill
                                        sizes="64px"
                                        className="object-cover"
                                    />
                                )}
                            </div>

                            <div className="flex-1 text-center sm:text-left">
                                <h3 className="text-white font-bold text-lg">{item.book.title}</h3>
                                <p className="text-gray-400 text-sm">{item.book.author}</p>
                                <p className="text-xs text-gray-600 mt-1">İndirilme: {new Date(item.downloadedAt).toLocaleDateString('tr-TR')}</p>
                            </div>

                            {item.book.pdfUrl ? (
                                <a
                                    href={item.book.pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-blue-600/20 text-blue-400 px-4 py-2 rounded-lg font-bold hover:bg-blue-600/40 transition-colors flex items-center gap-2"
                                >
                                    <FaDownload /> Tekrar İndir
                                </a>
                            ) : (
                                <button disabled className="bg-gray-800 text-gray-600 px-4 py-2 rounded-lg font-bold cursor-not-allowed flex items-center gap-2">
                                    <FaDownload /> PDF Yok
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
