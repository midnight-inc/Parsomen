"use client";
import Image from 'next/image';
import { FaPlus } from 'react-icons/fa';
import { useState } from 'react';

export default function StoryRail({ stories = [], onAddStory }) {
    const [selectedStory, setSelectedStory] = useState(null);

    return (
        <div className="flex gap-4 overflow-x-auto pb-2 mb-4 scrollbar-hide py-2">
            {/* Add Story Button */}
            <button
                onClick={onAddStory}
                className="flex-shrink-0 flex flex-col items-center gap-1 group"
            >
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center hover:border-pink-500 transition-colors bg-gray-800">
                    <FaPlus className="text-gray-400 group-hover:text-pink-500 transition-colors" />
                </div>
                <span className="text-xs text-gray-400 group-hover:text-white">Hikaye Ekle</span>
            </button>

            {/* Stories */}
            {stories.map((group, idx) => (
                <button
                    key={idx}
                    onClick={() => setSelectedStory(group)}
                    className="flex-shrink-0 flex flex-col items-center gap-1 group"
                >
                    <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-fuchsia-600 group-hover:scale-105 transition-transform">
                        <div className="w-full h-full rounded-full border-2 border-black overflow-hidden relative">
                            <Image
                                src={group.user.avatar || '/default-avatar.png'}
                                alt={group.user.username}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                    <span className="text-xs text-gray-300 w-16 truncate text-center">{group.user.username}</span>
                </button>
            ))}

            {/* Modal for viewing (Simple Placeholder for now) */}
            {selectedStory && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setSelectedStory(null)}>
                    <div className="relative w-full max-w-sm aspect-[9/16] bg-gray-900 rounded-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                        <Image src={selectedStory.items[0].image} alt="Story" fill className="object-contain" />
                        <div className="absolute top-4 left-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden relative border border-white">
                                <Image src={selectedStory.user.avatar || '/default-avatar.png'} alt="" fill />
                            </div>
                            <span className="font-bold text-white drop-shadow-md">{selectedStory.user.username}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
