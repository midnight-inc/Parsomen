"use client";
import { useState, useEffect } from 'react';
import { FaCalendarCheck, FaGift, FaFire } from 'react-icons/fa';
import Button from '../ui/Button';
import confetti from 'canvas-confetti';

export default function DailyBonusModal() {
    const [show, setShow] = useState(false);
    const [reward, setReward] = useState(null);

    useEffect(() => {
        checkDailyBonus();
    }, []);

    const checkDailyBonus = async () => {
        try {
            const res = await fetch('/api/gamification/daily-login', { method: 'POST' });
            const data = await res.json();

            if (data.success && data.claimed === false) { // New claim
                setReward(data);
                setShow(true);
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        } catch (error) {
            console.error('Failed to check bonus');
        }
    };

    if (!show || !reward) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#1a1a2e] border border-yellow-500/50 rounded-3xl p-8 max-w-sm w-full text-center relative shadow-[0_0_50px_rgba(234,179,8,0.3)] transform scale-100 animate-in zoom-in-0 duration-500">
                {/* Glow behind */}
                <div className="absolute inset-0 bg-yellow-500/10 rounded-3xl blur-xl -z-10" />

                <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-yellow-500/50">
                    <FaGift className="text-5xl text-yellow-400 animate-bounce" />
                </div>

                <h2 className="text-3xl font-black text-white mb-2 uppercase italic tracking-wider">
                    Günlük Bonus!
                </h2>
                <p className="text-yellow-100/70 mb-6">Her gün gel, seriyi bozma, ödülleri kap!</p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <div className="text-xs text-white/50 mb-1">Kazanılan XP</div>
                        <div className="text-xl font-bold text-purple-400">+{reward.xpEarned} XP</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <div className="text-xs text-white/50 mb-1">Kazanılan Puan</div>
                        <div className="text-xl font-bold text-yellow-400">+{reward.pointsEarned} P</div>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-orange-500 font-bold text-lg mb-8 bg-orange-500/10 py-2 rounded-lg">
                    <FaFire /> {reward.streak} Günlük Seri
                </div>

                <Button
                    onClick={() => setShow(false)}
                    variant="primary"
                    fullWidth
                    className="bg-yellow-500 hover:bg-yellow-400 text-black border-none"
                >
                    Harika!
                </Button>
            </div>
        </div>
    );
}
