"use client";
import { FaSyncAlt } from 'react-icons/fa';

export default function RefreshButton() {

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <button
            onClick={handleRefresh}
            className="fixed bottom-40 right-8 z-50 p-4 rounded-full bg-white/10 text-white border border-white/10 backdrop-blur-md shadow-lg hover:bg-green-500 hover:text-white hover:scale-110 transition-all duration-300 group"
            title="Sayfayı Yenile"
        >
            <FaSyncAlt className="group-hover:rotate-180 transition-transform duration-500" />
        </button>
    );
}
