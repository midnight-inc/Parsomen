"use client";
import Image from 'next/image';
import Link from 'next/link';
import { FaUserPlus } from 'react-icons/fa';
import { useEffect, useState } from 'react';

export default function SuggestedUsers() {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const res = await fetch('/api/users/suggestions');
                const data = await res.json();
                if (data.success) {
                    setSuggestions(data.users);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchSuggestions();
    }, []);

    const handleAddFriend = async (targetId) => {
        try {
            const res = await fetch('/api/users/add-friend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUserId: targetId })
            });

            if (res.ok) {
                // Remove from list
                // We assume native confirm/toast or just update UI
                setSuggestions(prev => prev.filter(u => u.id !== targetId));
                // Optional: Show toast if library available, but to be simple I just update UI
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (loading && suggestions.length === 0) return (
        <div className="bg-gray-900/30 rounded-xl border border-gray-800 p-4 backdrop-blur-sm animate-pulse">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Önerilen Kullanıcılar</h3>
            <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="flex gap-3"><div className="w-8 h-8 bg-gray-800 rounded-full" /> <div className="h-4 w-20 bg-gray-800 rounded" /></div>)}
            </div>
        </div>
    );

    return (
        <div className="bg-gray-900/30 rounded-xl border border-gray-800 p-4 backdrop-blur-sm">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Önerilen Kullanıcılar</h3>

            {suggestions.length === 0 ? (
                <p className="text-gray-500 text-xs italic py-2">Şu an önerilen kullanıcı yok.</p>
            ) : (
                <div className="space-y-4">
                    {suggestions.map(u => (
                        <div key={u.id} className="flex items-center justify-between">
                            <Link href={`/profile/${u.username}`} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden relative">
                                    <Image src={u.avatar || '/default-avatar.png'} alt="" fill className="object-cover" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-white font-bold text-sm truncate">{u.username}</p>
                                </div>
                            </Link>
                            <button
                                onClick={() => handleAddFriend(u.id)}
                                className="text-purple-400 hover:text-white bg-purple-500/10 hover:bg-purple-500 rounded-full p-2 transition-colors"
                                title="Arkadaş Ekle"
                            >
                                <FaUserPlus size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
