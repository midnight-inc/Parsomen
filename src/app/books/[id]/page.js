import Link from 'next/link';
import Image from 'next/image';
import { FaArrowLeft, FaStar } from 'react-icons/fa';
import { prisma } from '@/lib/prisma';
import ReviewSection from '@/components/books/ReviewSection';
import BookActions from '@/components/books/BookActions';
import ViewTracker from '@/components/books/ViewTracker';
import { getSession } from '@/lib/auth';

export default async function BookDetail(props) {
    const params = await props.params;
    console.log('Book Detail Params:', params);
    const id = parseInt(params.id);
    console.log('Parsed ID:', id);

    // Validate ID
    if (isNaN(id)) {
        return <div className="p-20 text-center text-red-500">Geçersiz Kitap ID ({params.id})</div>;
    }

    try {
        const t0 = performance.now();

        // Get session for view tracking
        const session = await getSession();
        let userId = null;
        if (session?.user?.email) {
            const user = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { id: true }
            });
            if (user) userId = user.id;
        }

        const book = await prisma.book.findUnique({
            where: { id },
            include: { category: true }
        });
        const t1 = performance.now();
        console.log(`Database fetch took ${t1 - t0}ms for ID ${id}`);

        if (!book) {
            console.log('Book not found in DB for ID:', id);
            return (
                <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center">
                    <h1 className="text-4xl font-bold text-gray-700">404</h1>
                    <p className="text-xl text-gray-400">Aradığın kitap bulunamadı.</p>
                    <Link href="/" className="text-pink-500 hover:underline">Ana Sayfaya Dön</Link>
                </div>
            );
        }

        return (
            <div className="min-h-screen pb-20 pt-24 px-4 sm:px-8 max-w-7xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group">
                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Geri Dön
                </Link>

                <ViewTracker bookId={book.id} userId={userId} />

                <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] gap-12">
                    {/* Left: Book Cover & Actions */}
                    <div className="space-y-6">
                        <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/20 border border-white/10">
                            {book.cover ? (
                                <Image
                                    src={book.cover}
                                    alt={book.title}
                                    fill
                                    sizes="350px"
                                    priority
                                    unoptimized
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-600">Kapak Yok</div>
                            )}
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                        </div>

                        <BookActions bookId={book.id} userId={userId} />
                    </div>

                    {/* Right: Book Info */}
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-purple-500/20">
                                    {book.category?.name || 'Genel'}
                                </span>
                                {book.isNew && (
                                    <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-green-500/20">
                                        Yeni
                                    </span>
                                )}
                            </div>

                            <h1 className="text-4xl md:text-5xl font-black text-white mb-2 leading-tight">{book.title}</h1>
                            <p className="text-2xl text-gray-400 font-medium">{book.author}</p>
                        </div>

                        <div className="flex gap-8 p-6 bg-gray-900/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm">
                            <div className="text-center">
                                <div className="flex items-center gap-1 text-yellow-500 text-xl font-bold justify-center">
                                    {book.rating} <FaStar />
                                </div>
                                <div className="text-xs text-gray-500 uppercase font-bold mt-1">Puan</div>
                            </div>
                            <div className="w-px bg-gray-800"></div>
                            <div className="text-center">
                                <div className="text-xl font-bold text-white">{book.pages || '-'}</div>
                                <div className="text-xs text-gray-500 uppercase font-bold mt-1">Sayfa</div>
                            </div>
                            <div className="w-px bg-gray-800"></div>
                            <div className="text-center">
                                <div className="text-xl font-bold text-white">{book.year || '-'}</div>
                                <div className="text-xs text-gray-500 uppercase font-bold mt-1">Yıl</div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                                Kitap Hakkında
                            </h3>
                            <p className="text-gray-300 leading-relaxed text-lg">
                                {book.description || "Bu kitap için henüz bir açıklama girilmemiş."}
                            </p>
                        </div>

                        {/* Reviews */}
                        <ReviewSection bookId={book.id} reviews={book.reviews} userRole="USER" />
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error("Book Detail Page Error:", error);
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center">
                <h1 className="text-2xl font-bold text-red-500">Hata</h1>
                <p className="text-gray-400">Kitap detayları yüklenirken bir sorun oluştu.</p>
                <Link href="/" className="text-pink-500 hover:underline">Ana Sayfaya Dön</Link>
            </div>
        );
    }
}
