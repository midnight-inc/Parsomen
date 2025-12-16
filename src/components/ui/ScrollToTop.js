"use client";
import { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";

export default function ScrollToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Since main layout has overflow-y-auto on "main" tag, we listen to that instead of window
        const mainContent = document.querySelector('main');

        const toggleVisible = () => {
            if (!mainContent) return;
            const scrolled = mainContent.scrollTop;
            if (scrolled > 300) {
                setVisible(true);
            } else if (scrolled <= 300) {
                setVisible(false);
            }
        };

        if (mainContent) {
            mainContent.addEventListener("scroll", toggleVisible);
        }

        return () => {
            if (mainContent) {
                mainContent.removeEventListener("scroll", toggleVisible);
            }
        };
    }, []);

    const scrollToTop = () => {
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-8 right-8 z-50 p-4 rounded-full bg-gray-800 text-white border border-gray-600 shadow-[0_0_20px_rgba(0,0,0,0.8)] hover:bg-white hover:text-black hover:scale-110 transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
                }`}
        >
            <FaArrowUp />
        </button>
    );
}
