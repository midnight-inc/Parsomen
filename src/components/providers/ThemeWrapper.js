"use client";
import { useEffect, useState } from 'react';
import FallingHearts from '../effects/FallingHearts';

export default function ThemeWrapper({ initialMode = 'AUTO', initialTheme = 'default' }) {
    const [snow, setSnow] = useState(false);
    const [hearts, setHearts] = useState(false);

    useEffect(() => {
        const applyTheme = () => {
            const body = document.body;
            // Clear existing themes
            body.classList.remove('theme-christmas', 'theme-halloween', 'theme-cyberpunk', 'theme-coffee', 'theme-valentine');
            setSnow(false);
            setHearts(false);

            let activeTheme = 'default';

            if (initialMode === 'MANUAL') {
                activeTheme = initialTheme;
            } else {
                // AUTO MODE logic
                const today = new Date();
                const month = today.getMonth(); // 0-11
                const day = today.getDate();

                // Valentine: Feb 14
                if (month === 1 && day === 14) {
                    activeTheme = 'valentine';
                }
                // Christmas: Dec 1 - Jan 7
                else if (month === 11 || (month === 0 && day <= 7)) {
                    activeTheme = 'christmas';
                }
                // Halloween: Oct 20 - Nov 3
                else if ((month === 9 && day >= 20) || (month === 10 && day <= 3)) {
                    activeTheme = 'halloween';
                }
            }

            // Apply
            if (activeTheme !== 'default') {
                body.classList.add(`theme-${activeTheme}`);
            }

            // Effect triggers
            if (activeTheme === 'christmas') setSnow(true);
            if (activeTheme === 'valentine') setHearts(true);
        };

        applyTheme();
    }, [initialMode, initialTheme]);

    return (
        <>
            {snow && <SnowEffect />}
            {hearts && <FallingHearts />}
        </>
    );
}

// Simple CSS Snow Effect Component
function SnowEffect() {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            {[...Array(50)].map((_, i) => (
                <div
                    key={i}
                    className="absolute bg-white rounded-full opacity-80 animate-snow"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `-${Math.random() * 20}px`,
                        width: `${Math.random() * 4 + 2}px`,
                        height: `${Math.random() * 4 + 2}px`,
                        opacity: Math.random() * 0.5 + 0.3,
                        animationDuration: `${Math.random() * 5 + 5}s`,
                        animationDelay: `${Math.random() * 5}s`
                    }}
                />
            ))}
            <style jsx global>{`
                @keyframes snow {
                    0% { transform: translateY(-10px) translateX(0); }
                    100% { transform: translateY(110vh) translateX(20px); }
                }
                .animate-snow {
                    animation-name: snow;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                }
            `}</style>
        </div>
    );
}
