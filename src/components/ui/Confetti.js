"use client";
import confetti from 'canvas-confetti';

/**
 * Trigger various confetti effects
 */
export const triggerConfetti = () => {
    // defaults
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const particleCount = 50;

    // Fireworks effect
    confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    }));
    confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    }));
};

export const triggerSchoolPride = () => {
    const end = Date.now() + (3 * 1000); // 3 seconds

    // go Buckeyes!
    const colors = ['#6366f1', '#ec4899'];

    (function frame() {
        confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors
        });
        confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
};
