"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function RecentMessages() {
    const [contacts, setContacts] = useState([]);

    useEffect(() => {
        fetch('/api/messages/recent')
            .then(res => res.json())
            .then(data => {
                if (data.success) setContacts(data.contacts);
            });
    }, []);

    if (contacts.length === 0) {
        return (
            <div className="bg-gray-900/30 rounded-xl border border-gray-800 p-4 backdrop-blur-sm">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Mesajlar</h3>
                <p className="text-gray-500 text-xs italic">Şu an mesajlaştığın kimse yok.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-900/30 rounded-xl border border-gray-800 p-4 backdrop-blur-sm">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Mesajlar</h3>
            <div className="space-y-3">
                {contacts.map(c => (
                    <Link href={`/messages/${c.id}`} key={c.id} className="flex items-center gap-3 group hover:bg-gray-800/50 p-2 rounded-lg transition-colors">
                        <div className="relative w-10 h-10 rounded-full bg-gray-700 overflow-hidden shrink-0 border border-transparent group-hover:border-purple-500 transition-colors">
                            <Image src={c.avatar || '/default-avatar.png'} alt={c.username} fill className="object-cover" />
                            {c.unread && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{c.username}</p>
                            <p className={`text-xs truncate ${c.unread ? 'text-white font-semibold' : 'text-gray-500'}`}>
                                {c.lastMessage}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
            <Link href="/messages" className="block text-center text-xs text-purple-400 hover:text-purple-300 mt-3 pt-2 border-t border-gray-800">
                Tüm Mesajları Gör
            </Link>
        </div>
    );
}
