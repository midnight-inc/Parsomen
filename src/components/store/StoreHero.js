"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';

export default function StoreHero() {
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({
        hours: 23,
        minutes: 59,
        seconds: 59
    });

    useEffect(() => {
        fetchDailyBook();
    }, []);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const diff = tomorrow - now;

            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            return { hours, minutes, seconds };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const fetchDailyBook = async () => {
        try {
            // Use date-based seed for consistent daily book
            const today = new Date().toISOString().split('T')[0];
            const res = await fetch(`/api/books?limit=1&seed=${today}`);
            const data = await res.json();

            if (data.success && data.books?.length > 0) {
                setBook(data.books[0]);
            } else if (data.length > 0) {
                // Alternative response format
                setBook(data[0]);
            }
        } catch (error) {
            console.error('Failed to fetch daily book:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (val) => val.toString().padStart(2, '0');

    if (loading) {
        return (
            <div className="relative w-full h-[400px] mb-12 rounded-2xl overflow-hidden bg-gray-900 flex items-center justify-center">
                <FaSpinner className="text-4xl text-purple-500 animate-spin" />
            </div>
        );
    }

    if (!book) {
        return null;
    }

    return (
        <div className="relative w-full h-[400px] mb-12 rounded-2xl overflow-hidden group">
            {/* Background Image */}
            <div className="absolute inset-0 bg-gray-900 transition-transform duration-700 group-hover:scale-105">
                {book.cover && (
                    <Image
                        src={book.cover}
                        alt={book.title}
                        fill
                        className="object-cover opacity-40 blur-sm"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10" />
            </div>

            {/* Content */}
            <div className="relative z-20 h-full flex flex-col justify-center px-8 md:px-16 max-w-3xl">
                <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider text-yellow-400 uppercase border border-yellow-400/30 rounded-full bg-yellow-400/10 w-fit animate-pulse">
                    Günün Kitabı
                </span>

                <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight drop-shadow-lg">
                    {book.title}
                </h1>

                <p className="text-lg text-gray-300 mb-2">
                    <span className="text-gray-500">Yazar:</span> {book.author}
                </p>

                {book.description && (
                    <p className="text-base text-gray-400 mb-8 leading-relaxed line-clamp-2">
                        {book.description}
                    </p>
                )}

                <div className="flex flex-wrap gap-4 items-center">
                    <Link
                        href={`/books/${book.id}`}
                        className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors shadow-lg shadow-white/10"
                    >
                        Hemen Oku
                    </Link>
                    <Link
                        href={`/books/${book.id}`}
                        className="px-8 py-3 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm"
                    >
                        Detaylar
                    </Link>
                    <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-lg text-yellow-400 border border-yellow-400/20 ml-auto md:ml-0 backdrop-blur-md">
                        <span className="font-mono font-bold text-xl min-w-[90px] text-center">
                            {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
                        </span>
                        <span className="text-xs text-gray-400 tracking-wider">KALDI</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
