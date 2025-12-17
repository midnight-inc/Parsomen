"use client";
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import UserAvatar from '@/components/ui/UserAvatar';
import { FaHeart, FaComment, FaShare, FaBookOpen, FaTrash, FaEdit, FaCheck, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function PostCard({ post }) {
    const { user } = useAuth();
    const router = useRouter();
    const [liked, setLiked] = useState(post.isLiked);
    const [likeCount, setLikeCount] = useState(post.likeCount);
    const [isDeleting, setIsDeleting] = useState(false);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content || '');
    const [isSaving, setIsSaving] = useState(false);

    // Comments State
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [commentCount, setCommentCount] = useState(post.commentCount);
    const [sendingComment, setSendingComment] = useState(false);

    // Mention Suggestions
    const [suggestions, setSuggestions] = useState([]);
    const fetchSuggestions = async (query) => {
        try {
            const res = await fetch(`/api/users/suggestions?q=${query}`);
            const data = await res.json();
            setSuggestions(data.users || []);
        } catch (e) { }
    };

    const handleMentionClick = (username) => {
        const words = commentText.split(' ');
        words.pop(); // remove incomplete mention
        words.push(`@${username} `);
        setCommentText(words.join(' '));
        setSuggestions([]);
    };

    const isOwner = user?.id === post.user.id;

    const handleLike = async () => {
        if (!user) return toast.error("Beğenmek için giriş yapmalısın");

        // Optimistic update
        const newLiked = !liked;
        setLiked(newLiked);
        setLikeCount(prev => newLiked ? prev + 1 : prev - 1);

        try {
            const res = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' });
            if (!res.ok) throw new Error();
        } catch (e) {
            setLiked(!newLiked);
            setLikeCount(prev => newLiked ? prev - 1 : prev + 1);
            toast.error("İşlem başarısız");
        }
    };

    const handleDelete = () => {
        toast((t) => (
            <div className="flex flex-col gap-3 min-w-[200px]">
                <span className="font-bold text-sm">Bu gönderiyi silmek istediğine emin misin?</span>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            deletePost();
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                        Evet, Sil
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                        Vazgeç
                    </button>
                </div>
            </div>
        ), { duration: 5000, icon: '🗑️', style: { background: '#1f2937', color: '#fff', border: '1px solid #374151' } });
    };

    const deletePost = async () => {
        setIsDeleting(true);
        const loadingToast = toast.loading("Siliniyor...");

        try {
            const res = await fetch(`/api/posts/${post.id}/delete`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Gönderi silindi", { id: loadingToast });
                router.refresh();
            } else {
                throw new Error();
            }
        } catch (e) {
            toast.error("Silinemedi", { id: loadingToast });
            setIsDeleting(false);
        }
    };

    const handleEdit = async () => {
        if (editContent.trim() === post.content) {
            setIsEditing(false);
            return;
        }
        setIsSaving(true);
        try {
            const res = await fetch(`/api/posts/${post.id}/edit`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: editContent })
            });
            if (res.ok) {
                toast.success('Düzenlendi');
                router.refresh();
                setIsEditing(false);
            } else throw new Error();
        } catch (e) {
            toast.error('Düzenlenemedi');
        } finally {
            setIsSaving(false);
        }
    };

    const handleComment = async () => {
        if (!commentText.trim()) return;
        setSendingComment(true);
        try {
            const res = await fetch(`/api/posts/${post.id}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: commentText })
            });
            if (res.ok) {
                toast.success('Yorum yapıldı');
                setCommentText('');
                setCommentCount(prev => prev + 1);
            } else throw new Error();
        } catch (e) {
            toast.error('Yorum yapılamadı');
        } finally {
            setSendingComment(false);
        }
    };

    const renderContentWithMentions = (text) => {
        if (!text) return null;

        // Regex to split by mentions (capture group keeps the delimiter in result)
        // Look for @username where username contains letters/numbers/underscore
        const parts = text.split(/(@[\w_]+)/g);

        return parts.map((part, index) => {
            if (part.startsWith('@') && part.length > 1) {
                const username = part.substring(1);
                return (
                    <Link
                        key={index}
                        href={`/profile/${username}`}
                        className="text-blue-400 font-bold hover:underline hover:text-blue-300 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {part}
                    </Link>
                );
            }
            return part;
        });
    };

    if (isDeleting) return null;

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mb-4 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 group/card">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <Link href={`/profile/${post.user.username}`} className="flex items-center gap-3 group">
                    <UserAvatar
                        user={post.user}
                        src={post.user.avatar}
                        size={40}
                        className=""
                    />
                    <div>
                        <p className="text-white font-bold text-sm group-hover:text-purple-400 transition-colors">{post.user.username}</p>
                        <p className="text-gray-500 text-xs" suppressHydrationWarning>
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: tr })}
                            {post.updatedAt && post.updatedAt !== post.createdAt && ' (Düzenlendi)'}
                        </p>
                    </div>
                </Link>

                {isOwner && (
                    <div className="flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="text-gray-600 hover:text-blue-400 transition-colors p-2"
                            title="Düzenle"
                        >
                            <FaEdit size={14} />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="text-gray-600 hover:text-red-500 transition-colors p-2"
                            title="Sil"
                        >
                            <FaTrash size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="space-y-3 mb-4">
                {isEditing ? (
                    <div className="bg-gray-800 rounded-lg p-2">
                        <textarea
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            className="w-full bg-transparent text-white outline-none resize-none min-h-[80px]"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white p-1"><FaTimes /></button>
                            <button onClick={handleEdit} disabled={isSaving} className="text-green-500 hover:text-green-400 p-1"><FaCheck /></button>
                        </div>
                    </div>
                ) : (
                    post.content && (
                        <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                            {renderContentWithMentions(post.content)}
                        </p>
                    )
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
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 text-sm hover:text-pink-500 transition-colors ${liked ? 'text-pink-500' : ''}`}
                >
                    <FaHeart /> <span>{likeCount}</span>
                </button>
                <button
                    onClick={() => setShowComments(!showComments)}
                    className={`flex items-center gap-2 text-sm hover:text-blue-400 transition-colors ${showComments ? 'text-blue-400' : ''}`}
                >
                    <FaComment /> <span>{commentCount}</span>
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

            {/* Comment Section */}
            <div className="mt-4 pt-4 border-t border-gray-800/50 animate-in fade-in slide-in-from-top-2 relative">
                {/* Mention Suggestions for Comments */}
                {suggestions.length > 0 && (
                    <div className="absolute z-[100] left-0 bottom-full mb-2 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                        {suggestions.map(u => (
                            <button
                                key={u.id}
                                onClick={() => handleMentionClick(u.username)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 transition-colors text-left border-b border-gray-800/50 last:border-0"
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden relative">
                                    <Image src={u.avatar || '/default-avatar.png'} alt={u.username} fill className="object-cover" />
                                </div>
                                <span className="text-white font-bold text-sm">{u.username}</span>
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={commentText}
                        onChange={(e) => {
                            const val = e.target.value;
                            setCommentText(val);
                            const lastWord = val.split(' ').pop();
                            if (lastWord && lastWord.startsWith('@')) {
                                fetchSuggestions(lastWord.substring(1));
                            } else {
                                setSuggestions([]);
                            }
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                        placeholder="Yorum yaz (@kullanıcıadı ile bahset)"
                        className="flex-1 bg-gray-800 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:bg-gray-700"
                    />
                    <button
                        onClick={handleComment}
                        disabled={!commentText.trim() || sendingComment}
                        className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-full disabled:opacity-50"
                    >
                        <FaPaperPlane size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
}
