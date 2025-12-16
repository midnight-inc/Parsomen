"use client";
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';

export default function BackButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className="fixed bottom-24 right-8 z-50 p-4 rounded-full bg-white/10 text-white border border-white/10 backdrop-blur-md shadow-lg hover:bg-white hover:text-black hover:scale-110 transition-all duration-300 group"
            title="Geri Dön"
        >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        </button>
    );
}
