"use client";
import { FaQuoteLeft } from 'react-icons/fa';

export default function QuoteOfTheDay() {
    return (
        <section className="mb-16 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity blur-xl"></div>
            <div className="relative bg-gray-900/80 backdrop-blur-xl border border-white/10 p-12 rounded-3xl text-center overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                <FaQuoteLeft className="text-4xl text-gray-700 mx-auto mb-6" />

                <blockquote className="text-2xl md:text-3xl font-serif italic text-gray-200 mb-6 leading-relaxed">
                    "Bütün muhteşem hikayeler iki şekilde başlar: Ya bir insan bir yolculuğa çıkar, ya da şehre bir yabancı gelir."
                </blockquote>

                <div className="text-sm font-bold text-indigo-400 uppercase tracking-widest">
                    — Leo Tolstoy
                </div>
                <div className="text-xs text-gray-600 mt-1">Anna Karenina</div>
            </div>
        </section>
    );
}
