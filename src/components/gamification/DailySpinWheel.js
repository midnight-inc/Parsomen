"use client";
import { useState, useEffect } from 'react';
import { FaGift, FaCoins, FaStar, FaGem } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

// Wheel segments with prizes
const wheelSegments = [
    { prize: 10, label: '10 Puan', color: '#6366f1', probability: 0.30 },
    { prize: 25, label: '25 Puan', color: '#8b5cf6', probability: 0.25 },
    { prize: 50, label: '50 Puan', color: '#ec4899', probability: 0.20 },
    { prize: 100, label: '100 Puan', color: '#f59e0b', probability: 0.15 },
    { prize: 5, label: '5 Puan', color: '#10b981', probability: 0.05 },
    { prize: 200, label: '200 Puan!', color: '#ef4444', probability: 0.04 },
    { prize: 0, label: 'Tekrar Dene', color: '#475569', probability: 0.01 },
    { prize: 500, label: '🎉 JACKPOT!', color: '#fbbf24', probability: 0.00 },
];

export default function DailySpinWheel({ onWin }) {
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [hasSpunToday, setHasSpunToday] = useState(false);
    const [wonPrize, setWonPrize] = useState(null);
    const [showResult, setShowResult] = useState(false);

    // Check if user has spun today
    useEffect(() => {
        const lastSpin = localStorage.getItem('lastDailySpin');
        if (lastSpin) {
            const lastSpinDate = new Date(lastSpin).toDateString();
            const today = new Date().toDateString();
            if (lastSpinDate === today) {
                setHasSpunToday(true);
            }
        }
    }, []);

    const spinWheel = () => {
        if (isSpinning || hasSpunToday) return;

        setIsSpinning(true);
        setShowResult(false);

        // Weighted random selection
        const random = Math.random();
        let cumulativeProbability = 0;
        let selectedIndex = 0;

        for (let i = 0; i < wheelSegments.length; i++) {
            cumulativeProbability += wheelSegments[i].probability;
            if (random <= cumulativeProbability) {
                selectedIndex = i;
                break;
            }
        }

        const selectedPrize = wheelSegments[selectedIndex];
        const segmentAngle = 360 / wheelSegments.length;
        const targetAngle = 360 - (selectedIndex * segmentAngle + segmentAngle / 2);
        const spins = 5; // Number of full rotations
        const finalRotation = rotation + (360 * spins) + targetAngle;

        setRotation(finalRotation);

        // After animation completes
        setTimeout(() => {
            setIsSpinning(false);
            setWonPrize(selectedPrize);
            setShowResult(true);
            setHasSpunToday(true);
            localStorage.setItem('lastDailySpin', new Date().toISOString());

            if (selectedPrize.prize > 0) {
                toast.success(`🎉 ${selectedPrize.prize} Puan kazandın!`);
                if (onWin) onWin(selectedPrize.prize);
            } else {
                toast('Bugün şansın yaver gitmedi, yarın tekrar dene!', { icon: '😅' });
            }
        }, 5000);
    };

    return (
        <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-3xl p-8 border border-purple-500/30">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-white mb-2 flex items-center justify-center gap-2">
                    <FaGift className="text-pink-500" /> Günlük Şans Çarkı
                </h2>
                <p className="text-gray-400 text-sm">Her gün bir kez çevir, şansını dene!</p>
            </div>

            {/* Wheel Container */}
            <div className="relative w-64 h-64 mx-auto mb-8">
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
                    <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-yellow-500 drop-shadow-lg" />
                </div>

                {/* Wheel */}
                <div
                    className={`w-full h-full rounded-full relative overflow-hidden shadow-2xl transition-transform ${isSpinning ? 'duration-[5000ms]' : 'duration-0'}`}
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        transitionTimingFunction: 'cubic-bezier(0.17, 0.67, 0.12, 0.99)'
                    }}
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        {wheelSegments.map((segment, idx) => {
                            const angle = 360 / wheelSegments.length;
                            const startAngle = idx * angle;
                            const endAngle = (idx + 1) * angle;

                            const startRad = (startAngle - 90) * Math.PI / 180;
                            const endRad = (endAngle - 90) * Math.PI / 180;

                            const x1 = 50 + 50 * Math.cos(startRad);
                            const y1 = 50 + 50 * Math.sin(startRad);
                            const x2 = 50 + 50 * Math.cos(endRad);
                            const y2 = 50 + 50 * Math.sin(endRad);

                            const largeArc = angle > 180 ? 1 : 0;

                            return (
                                <path
                                    key={idx}
                                    d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                    fill={segment.color}
                                    stroke="#1f2937"
                                    strokeWidth="0.5"
                                />
                            );
                        })}
                    </svg>

                    {/* Labels */}
                    {wheelSegments.map((segment, idx) => {
                        const angle = 360 / wheelSegments.length;
                        const midAngle = idx * angle + angle / 2 - 90;
                        const rad = midAngle * Math.PI / 180;
                        const x = 50 + 30 * Math.cos(rad);
                        const y = 50 + 30 * Math.sin(rad);

                        return (
                            <div
                                key={idx}
                                className="absolute text-white text-[8px] font-bold text-center pointer-events-none"
                                style={{
                                    left: `${x}%`,
                                    top: `${y}%`,
                                    transform: `translate(-50%, -50%) rotate(${midAngle + 90}deg)`,
                                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                                }}
                            >
                                {segment.label}
                            </div>
                        );
                    })}
                </div>

                {/* Center Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border-4 border-yellow-300 shadow-lg flex items-center justify-center">
                        <FaStar className="text-2xl text-yellow-900" />
                    </div>
                </div>
            </div>

            {/* Spin Button */}
            <div className="text-center">
                {hasSpunToday && !isSpinning ? (
                    <div className="space-y-2">
                        {showResult && wonPrize && (
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
                                <div className="text-4xl mb-2">{wonPrize.prize > 0 ? '🎉' : '😅'}</div>
                                <div className="text-xl font-bold text-white">{wonPrize.label}</div>
                            </div>
                        )}
                        <p className="text-gray-400">Bugünlük hakkını kullandın</p>
                        <p className="text-sm text-gray-500">Yarın tekrar gel!</p>
                    </div>
                ) : (
                    <button
                        onClick={spinWheel}
                        disabled={isSpinning}
                        className={`px-8 py-4 rounded-2xl font-black text-lg transition-all ${isSpinning
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-lg hover:shadow-xl hover:scale-105'
                            }`}
                    >
                        {isSpinning ? 'Döndürülüyor...' : '🎰 Çarkı Çevir!'}
                    </button>
                )}
            </div>
        </div>
    );
}
