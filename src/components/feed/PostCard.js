"use client";
import Image from 'next/image';
import Link from 'next/link';
import { FaHeart, FaComment, FaShare, FaBookOpen } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function PostCard({ post }) {
    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mb-4 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <Link href={`/profile/${post.user.username}`} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden relative border border-transparent group-hover:border-purple-500 transition-colors">
                        <Image src={post.user.avatar || '/default-avatar.png'} alt={post.user.username} fill className="object-cover" />
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm group-hover:text-purple-400 transition-colors">{post.user.username}</p>
                        <p className="text-gray-500 text-xs" suppressHydrationWarning>
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: tr })}
                        </p>
                    </div>
                </Link>
            </div>

            {/* Content */}
            <div className="space-y-3 mb-4">
                {post.content && (
                    <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                )}

                {post.image && (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-800">
                        <Image src={post.image} alt="Post content" fill className="object-cover" />
                    </div>
                )}

                {/* Citation Card */}
                {post.book && (
                    <Link href={`/books/${post.book.id}`} className="block bg-gray-800/50 rounded-lg p-3 border border-gray-700 hover:border-purple-500/50 hover:bg-gray-800 transition-all group/book">
                        <div className="flex gap-3">
                            <div className="w-12 h-18 bg-gray-700 rounded overflow-hidden relative shrink-0">
                                {post.book.cover && <Image src={post.book.cover} alt="" fill className="object-cover" />}
                            </div>
                            <div>
                                <p className="text-xs text-purple-400 mb-1 flex items-center gap-1">
                                    <FaBookOpen size={10} /> Bir kitap alıntıladı
                                </p>
                                <p className="text-white font-bold text-sm group-hover/book:text-purple-300 transition-colors">{post.book.title}</p>
                                <p className="text-gray-500 text-xs">{post.book.author}</p>
                            </div>
                        </div>
                    </Link>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-800/50 text-gray-400">
                <button className={`flex items-center gap-2 text-sm hover:text-pink-500 transition-colors ${post.isLiked ? 'text-pink-500' : ''}`}>
                    <FaHeart /> <span>{post.likeCount}</span>
                </button>
                <button className="flex items-center gap-2 text-sm hover:text-blue-400 transition-colors">
                    <FaComment /> <span>{post.commentCount}</span>
                </button>
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`);
                        toast.success('Link kopyalandı!');
                    }}
                    className="flex items-center gap-2 text-sm hover:text-green-400 transition-colors"
                >
                    <FaShare />
                </button>
            </div>
        </div>
    );
}
