import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';
import { FaArrowLeft } from 'react-icons/fa';
import CollectionHeader from '@/components/library/CollectionHeader';

export default async function CollectionDetailPage(props) {
    const params = await props.params;
    const session = await getSession();
    const id = parseInt(params.id);

    if (isNaN(id)) {
        return <div className="p-20 text-center text-white">Geçersiz Koleksiyon ID</div>;
    }

    const collection = await prisma.collection.findUnique({
        where: { id },
        include: {
            books: {
                include: {
                    book: {
                        include: { category: true }
                    }
                }
            },
            user: true
        }
    });

    if (!collection) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center">
                <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                <p className="text-gray-400 mb-8">Koleksiyon bulunamadı.</p>
                <Link href="/library/collections" className="text-pink-500 hover:text-white underline">Koleksiyonlara Dön</Link>
            </div>
        );
    }

    // Access Control: Public or Owner
    const isOwner = session?.user?.id === collection.userId;
    if (!collection.isPublic && !isOwner) {
        return <div className="p-20 text-center text-white">Bu koleksiyon gizli.</div>;
    }

    return (
        <div className="min-h-screen pt-24 px-4 max-w-7xl mx-auto">
            <Link href="/library/collections" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
                <FaArrowLeft /> Tüm Koleksiyonlar
            </Link>

            {/* Dynamic Interactive Header */}
            <CollectionHeader collection={collection} isOwner={isOwner} />

            <h2 className="text-xl font-bold text-white mb-6 pl-2 border-l-4 border-purple-500">Kitaplar</h2>

            {collection.books.length === 0 ? (
                <div className="text-center py-20 bg-gray-900/20 rounded-xl border border-gray-800/50 text-gray-500 border-dashed">
                    Bu koleksiyonda henüz kitap yok.
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {collection.books.map(({ book }) => (
                        <Link href={`/books/${book.id}`} key={book.id} className="group block">
                            <div className="aspect-[2/3] relative rounded-lg overflow-hidden mb-3 border border-gray-800 shadow-lg group-hover:border-purple-500/50 transition-colors">
                                {book.cover ? (
                                    <Image
                                        src={book.cover}
                                        alt={book.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-600">Kapak Yok</div>
                                )}
                            </div>
                            <h3 className="text-white font-medium text-sm truncate group-hover:text-purple-400 transition-colors">{book.title}</h3>
                            <p className="text-gray-500 text-xs truncate">{book.author}</p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

