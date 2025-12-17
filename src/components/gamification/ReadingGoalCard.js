"use client";
import { useState, useEffect } from 'react';
import { FaBookReader, FaTrophy, FaEdit, FaCheck } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function ReadingGoalCard() {
    const [goal, setGoal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [newTarget, setNewTarget] = useState(0);

    useEffect(() => {
        fetchGoal();
    }, []);

    const fetchGoal = async () => {
        try {
            const res = await fetch('/api/gamification/goals');
            const data = await res.json();
            if (data.success) {
                setGoal(data.goal); // might be null if not set
                if (data.goal) setNewTarget(data.goal.target);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const saveGoal = async () => {
        try {
            const res = await fetch('/api/gamification/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target: newTarget })
            });
            const data = await res.json();
            if (data.success) {
                setGoal(data.goal);
                setEditing(false);
                toast.success('Hedef güncellendi!');
            }
        } catch (error) {
            toast.error('Hata oluştu');
        }
    };

    if (loading) return null;

    if (!goal && !editing) {
        return (
            <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-2xl p-6 border border-white/10 text-center">
                <FaTrophy className="text-4xl text-yellow-500 mx-auto mb-3" />
                <h3 className="font-bold text-white mb-2">2025 Okuma Hedefi</h3>
                <p className="text-sm text-gray-400 mb-4">Kendine bir hedef belirle ve okuma alışkanlığını takip et!</p>
                <button
                    onClick={() => { setEditing(true); setNewTarget(20); }}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                    Hedef Belirle
                </button>
            </div>
        );
    }

    if (editing) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative">
                <h3 className="font-bold text-white mb-4">Kaç kitap okuyacaksın?</h3>
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={() => setNewTarget(Math.max(1, newTarget - 1))} className="w-8 h-8 rounded bg-gray-800 text-white">-</button>
                    <span className="text-2xl font-bold text-white">{newTarget}</span>
                    <button onClick={() => setNewTarget(newTarget + 1)} className="w-8 h-8 rounded bg-gray-800 text-white">+</button>
                </div>
                <div className="flex gap-2">
                    <button onClick={saveGoal} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-bold text-sm">Kaydet</button>
                    <button onClick={() => setEditing(false)} className="px-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm">İptal</button>
                </div>
            </div>
        );
    }

    const percentage = Math.min(100, Math.round((goal.current / goal.target) * 100));

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditing(true)} className="text-gray-500 hover:text-white"><FaEdit /></button>
            </div>

            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <FaBookReader className="text-white text-xl" />
                </div>
                <div>
                    <h3 className="font-bold text-white">Yıllık Hedefin</h3>
                    <p className="text-sm text-gray-400">{goal.current} / {goal.target} Kitap</p>
                </div>
            </div>

            <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <p className="text-right text-xs text-purple-400 font-bold">%{percentage} Tamamlandı</p>
        </div>
    );
}
