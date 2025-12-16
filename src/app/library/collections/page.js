import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';
import { FaPlus, FaLayerGroup } from 'react-icons/fa';
import CreateCollectionModal from '@/components/collections/CreateCollectionModal';
import CollectionActions from '@/components/collections/CollectionActions';

export const revalidate = 0;

export default async function CollectionsPage() {

    // Auth check
    const session = await getSession();
    if (!session?.user) return <div className="p-10 text-center text-white">Lütfen giriş yapın.</div>;

    // Get userId from session (verify session structure from lib/auth)
    // Assuming session.user.id exists based on typical implementations, 
    // but api/auth/me used email to find user.
    // Let's check api/auth/me again. It fetches user by email.
    // CollectionsPage needs userId.

    // If getSession returns minimal data, we might need to fetch user by email here too.
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });

    if (!user) return <div className="p-10 text-center text-white">Kullanıcı bulunamadı.</div>;
    const userId = user.id;

    const collections = await prisma.collection.findMany({
        where: { userId: userId },
        include: {
            books: {
                take: 4,
                include: { book: { select: { cover: true } } }
            },
            _count: { select: { books: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="pt-24 px-4 sm:px-8 max-w-7xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-blue-500 rounded-full"></span>
                    Koleksiyonlar
                </h1>
                <Link href="/library" className="text-gray-400 hover:text-white transition-colors">Kütüphaneye Dön</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Create New Card */}
                <CreateCollectionModal />

                {/* Collection Cards */}
                {collections.map(col => (
                    <div key={col.id} className="group relative">
                        <Link href={`/library/collections/${col.id}`}>
                            <div className="aspect-[16/9] bg-gray-900 border border-gray-800 rounded-xl overflow-hidden relative shadow-lg group-hover:shadow-blue-900/20 group-hover:border-gray-700 transition-all">
                                {/* Cover Image - Custom or Collage */}
                                {col.image ? (
                                    <div className="absolute inset-0">
                                        <Image src={col.image} alt={col.name} fill className="object-cover opacity-60 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-500" />
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-60 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-500">
                                        {col.books.length > 0 ? col.books.map((cb, idx) => (
                                            <div key={idx} className="relative w-full h-full">
                                                {cb.book.cover ? (
                                                    <Image src={cb.book.cover} alt="" fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-800"></div>
                                                )}
                                            </div>
                                        )) : (
                                            <>
                                                <div className="bg-gray-800/50"></div>
                                                <div className="bg-gray-800/30"></div>
                                                <div className="bg-gray-800/20"></div>
                                                <div className="bg-gray-800/10"></div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Overlay info */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-4">
                                    <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">{col.name}</h3>
                                    <div className="flex items-center justify-between text-xs text-gray-300">
                                        <span>{col._count.books} Kitap</span>
                                        {col.isPublic && <span className="bg-blue-600 px-2 py-0.5 rounded text-[10px]">HERKESE AÇIK</span>}
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Actions Menu (Top Right) */}
                        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <CollectionActions collection={col} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
