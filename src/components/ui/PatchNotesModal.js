"use client";
import { useState, useEffect } from 'react';
import { FaTimes, FaRocket } from 'react-icons/fa';

export default function PatchNotesModal({ notes }) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Show only once per session or version (simplified for demo)
        const hasSeen = sessionStorage.getItem('patch_notes_v1');
        if (!hasSeen) {
            setIsOpen(true);
            sessionStorage.setItem('patch_notes_v1', 'true');
        }
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="glass-panel w-full max-w-md p-0 overflow-hidden relative shadow-2xl shadow-indigo-500/20 scale-100 animate-in zoom-in-95 duration-300">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <FaRocket /> YENİ GÜNCELLEME
                    </h2>
                    <p className="text-indigo-100 mt-1 opacity-90">Versiyon {notes.version}</p>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-indigo-400">{notes.title}</h3>
                    <ul className="space-y-3">
                        {notes.changes.map((change, i) => (
                            <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0"></span>
                                {change}
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-full mt-8 glass-button bg-indigo-600/20 hover:bg-indigo-600/40 text-center py-3"
                    >
                        Tamam, Anlaşıldı
                    </button>
                </div>
            </div>
        </div>
    );
}
