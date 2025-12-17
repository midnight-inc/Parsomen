"use client";
import { useEffect, useState } from 'react';
import { FaHeart } from 'react-icons/fa';

export default function FallingHearts() {
    const [hearts, setHearts] = useState([]);

    useEffect(() => {
        // Create initial hearts
        const initialHearts = Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100, // Random horizontal position %
            animationDuration: 10 + Math.random() * 20, // 10-30s float duration
            delay: Math.random() * 20, // Random delay
            size: 10 + Math.random() * 20, // Random size 10-30px
            opacity: 0.1 + Math.random() * 0.3, // Subtle opacity
            color: Math.random() > 0.5 ? '#ec4899' : '#e11d48' // Pink or Rose
        }));
        setHearts(initialHearts);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {hearts.map((heart) => (
                <div
                    key={heart.id}
                    className="absolute bottom-[-50px] animate-float-up"
                    style={{
                        left: `${heart.left}%`,
                        fontSize: `${heart.size}px`,
                        color: heart.color,
                        opacity: heart.opacity,
                        animationDuration: `${heart.animationDuration}s`,
                        animationDelay: `-${heart.delay}s`,
                        // textShadow: '0 0 10px rgba(236, 72, 153, 0.5)'
                    }}
                >
                    <FaHeart />
                </div>
            ))}
            <style jsx>{`
                @keyframes float-up {
                    0% {
                        transform: translateY(110vh) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: var(--opacity);
                    }
                    90% {
                        opacity: var(--opacity);
                    }
                    100% {
                        transform: translateY(-20vh) rotate(360deg);
                        opacity: 0;
                    }
                }
                .animate-float-up {
                    animation-name: float-up;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                    --opacity: 0.3; /* Default fallback */
                }
            `}</style>
        </div>
    );
}
