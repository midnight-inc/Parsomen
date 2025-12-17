"use client";
import { useState, useEffect } from 'react';
import { FaScroll, FaCheckCircle, FaGift, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

export default function QuestBoard() {
    const { user, reloadUser } = useAuth();
    const [quests, setQuests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchQuests();
    }, [user]);

    const fetchQuests = async () => {
        try {
            const res = await fetch('/api/gamification/quests');
            const data = await res.json();
            if (data.success) {
                setQuests(data.quests);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async (questId, xp) => {
        try {
            const res = await fetch('/api/gamification/quests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questId })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`+${xp} XP Kazandın!`, { icon: '🎁' });
                // Update local state
                setQuests(prev => prev.map(q =>
                    q.id === questId ? { ...q, claimed: true } : q
                ));
                reloadUser();
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            toast.error('Hata oluştu');
        }
    };

    if (loading) return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6 flex justify-center">
            <FaSpinner className="animate-spin text-purple-500" />
        </div>
    );

    if (quests.length === 0) return null;

    return (
        <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/20 rounded-xl p-5 mb-6 relative overflow-hidden">
            {/* Decor */}
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <FaScroll className="text-8xl text-indigo-400" />
            </div>

            <h3 className="text-white font-bold flex items-center gap-2 mb-4">
                <FaScroll className="text-indigo-400" /> Haftalık Görevler
            </h3>

            <div className="space-y-4 relative z-10">
                {quests.map(quest => {
                    const progressPercent = Math.min(100, (quest.progress / quest.target) * 100);
                    const isDone = quest.progress >= quest.target; // In real logic, 'completed' flag from DB is safer

                    return (
                        <div key={quest.id} className="bg-black/40 rounded-lg p-3 border border-white/5">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-200">{quest.title}</h4>
                                    <p className="text-xs text-gray-400">{quest.description}</p>
                                </div>
                                <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
                                    {quest.xpReward} XP
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${isDone ? 'bg-green-500' : 'bg-indigo-500'}`}
                                        style={{ width: `${progressPercent}%` }}
                                    ></div>
                                </div>
                                <div className="text-xs text-gray-400 w-12 text-right">
                                    {quest.progress} / {quest.target}
                                </div>
                            </div>

                            {/* Claim Button */}
                            {quest.completed && !quest.claimed && (
                                <button
                                    onClick={() => handleClaim(quest.id, quest.xpReward)}
                                    className="w-full mt-3 bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-2 animate-pulse"
                                >
                                    <FaGift /> Ödülü Al
                                </button>
                            )}
                            {quest.claimed && (
                                <div className="w-full mt-3 bg-gray-800 text-gray-500 text-xs font-bold py-2 rounded flex items-center justify-center gap-2">
                                    <FaCheckCircle /> Tamamlandı
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
