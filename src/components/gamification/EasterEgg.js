"use client";
import { useState } from 'react';
import { FaGem, FaGhost, FaDragon } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { triggerConfetti } from '@/components/ui/Confetti';

export default function EasterEgg({ id, icon = "gem", className = "" }) {
    const { reloadUser, user } = useAuth();
    const [found, setFound] = useState(false);
    const [loading, setLoading] = useState(false);

    // If user already found this (check local storage for optimistic UI)
    // const hasFound = typeof window !== 'undefined' && localStorage.getItem(`egg_${id}_${user?.id}`);

    const handleDiscovery = async (e) => {
        e.stopPropagation();
        if (!user) {
            toast.error("Hazineyi almak için giriş yapmalısın!");
            return;
        }
        if (found || loading) return;

        setLoading(true);
        triggerConfetti(); // Visual confirmation immediately

        try {
            const res = await fetch('/api/gamification/egg', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eggId: id })
            });
            const data = await res.json();

            if (data.success) {
                toast.success(
                    <div className="text-center">
                        <div className="text-lg font-bold text-yellow-400">GİZLİ HAZİNE!</div>
                        <div>+500 XP ve +50 Puan Kazandın!</div>
                    </div>,
                    { icon: '💎', duration: 4000 }
                );
                setFound(true);
                // localStorage.setItem(`egg_${id}_${user.id}`, 'true');
                reloadUser();
            } else {
                toast(data.message || 'Bunu zaten almışsın.', { icon: '🕵️' });
                setFound(true); // Don't let them click again this session
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (found) return null; // Disappear after finding

    const getIcon = () => {
        switch (icon) {
            case 'ghost': return <FaGhost />;
            case 'dragon': return <FaDragon />;
            default: return <FaGem />;
        }
    };

    return (
        <div
            onClick={handleDiscovery}
            className={`cursor-pointer transition-all duration-300 hover:scale-125 animate-pulse text-yellow-500/20 hover:text-yellow-400 z-50 ${className}`}
            title="Burada bir gariplik var..."
        >
            {getIcon()}
        </div>
    );
}
