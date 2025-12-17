"use client";
import React, { useRef, useState } from "react";

/**
 * 3D Tilt Effect Wrapper
 * Wraps any content to give it a 3D perspective based on mouse movement.
 */
export default function TiltCard({ children, className = "", maxRotate = 15, scale = 1.05 }) {
    const ref = useRef(null);
    const [style, setStyle] = useState({});

    const handleMouseMove = (e) => {
        if (!ref.current) return;

        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const mouseX = e.clientX - left;
        const mouseY = e.clientY - top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        const rotateX = yPct * -maxRotate;
        const rotateY = xPct * maxRotate;

        setStyle({
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`,
            transition: 'all 0.1s ease',
            zIndex: 10
        });
    };

    const handleMouseLeave = () => {
        setStyle({
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
            transition: 'all 0.5s ease',
            zIndex: 1
        });
    };

    return (
        <div
            ref={ref}
            className={`transition-all duration-200 preserve-3d ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={style}
        >
            {children}
        </div>
    );
}
