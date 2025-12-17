"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaBookOpen, FaCheckCircle, FaClock, FaEllipsisV, FaStar, FaTimesCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function LibraryBookCard({ item }) {
    const router = useRouter();
    const [status, setStatus] = useState(item.status);
    const [showMenu, setShowMenu] = useState(false);
    const [loading, setLoading] = useState(false);

    const statusOptions = [
        { key: 'WANT_TO_READ', label: 'Okunacak', icon: <FaClock className="text-blue-400" />, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
        { key: 'READING', label: 'Okuyor', icon: <FaBookOpen className="text-yellow-400" />, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
        { key: 'READ', label: 'Bitirdi', icon: <FaCheckCircle className="text-green-400" />, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
        { key: 'DROPPED', label: 'Yarım Bıraktı', icon: <FaTimesCircle className="text-red-400" />, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    ];

    const currentStatus = statusOptions.find(o => o.key === status) || statusOptions[0];

    const handleStatusChange = async (newStatus) => {
        if (newStatus === status) return;
        setLoading(true);
        setShowMenu(false);

        // Optimistic update
        const oldStatus = status;
        setStatus(newStatus);

        try {
            const res = await fetch('/api/library/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookId: item.book.id,
                    status: newStatus
                })
            });

            const data = await res.json();
            if (data.success) {
                toast.success('Durum güncellendi');
                router.refresh(); // Refresh page data to reflect changes elsewhere if needed
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error(error);
            toast.error('Güncelleme başarısız');
            setStatus(oldStatus); // Revert on error
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="group relative bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-pink-500/50 transition-all shadow-lg h-full flex flex-col">
            {/* Cover Image Link */}
            <Link href={`/books/${item.book.id}`} className="relative aspect-[2/3] overflow-hidden block">
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

                {/* Status Badge (Top Right) */}
                <div className="absolute top-2 right-2 z-10">
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold border backdrop-blur-md shadow-lg ${currentStatus.color}`}>
                        {currentStatus.icon}
                        <span>{currentStatus.label}</span>
                    </div>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
            </Link>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col relative">

                {/* Book Info */}
                <Link href={`/books/${item.book.id}`} className="block mb-2">
                    <h3 className="text-white font-bold line-clamp-1 group-hover:text-pink-500 transition-colors" title={item.book.title}>
                        {item.book.title}
                    </h3>
                    <p className="text-gray-400 text-xs">{item.book.author}</p>
                </Link>

                {/* Rating & Date */}
                <div className="mt-auto flex justify-between items-center text-xs text-gray-500 border-t border-gray-800 pt-3 pb-8">
                    <span className="flex items-center gap-1"><FaStar className="text-yellow-500" /> {item.book.rating}</span>
                    <span>{new Date(item.addedAt).toLocaleDateString('tr-TR')}</span>
                </div>

                {/* Status Change Button (Full Width Bottom) */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gray-900 border-t border-gray-800">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        disabled={loading}
                        className="w-full py-1.5 px-3 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? '...' : 'Durumu Değiştir'}
                        <FaEllipsisV className="text-[10px]" />
                    </button>
                </div>

                {/* Dropdown Menu */}
                {showMenu && (
                    <div className="absolute bottom-10 left-2 right-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
                        <div className="p-1 flex flex-col gap-0.5">
                            {statusOptions.map((opt) => (
                                <button
                                    key={opt.key}
                                    onClick={() => handleStatusChange(opt.key)}
                                    className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 text-xs font-medium transition-colors ${status === opt.key
                                            ? 'bg-pink-600 text-white'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        }`}
                                >
                                    {opt.icon}
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {/* Backdrop to close */}
                        <div
                            className="fixed inset-0 z-[-1]"
                            onClick={() => setShowMenu(false)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
