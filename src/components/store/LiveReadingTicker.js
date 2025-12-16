"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaUserCircle, FaBookOpen } from 'react-icons/fa';
import { useState, useEffect } from 'react';

const MOCK_ACTIVITIES = []; // Removed mock data

export default function LiveReadingTicker() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const res = await fetch('/api/activity/feed', { cache: 'no-store' });
                const data = await res.json();
                if (data.success && data.feed.length > 0) {
                    setActivities(data.feed);
                }
            } catch (error) {
                console.error("Failed to fetch activity feed", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeed();
        // Refresh feed every 30 seconds
        const interval = setInterval(fetchFeed, 30000);
        return () => clearInterval(interval);
    }, []);



    // ... inside the component function ...

    // Handling display logic
    const hasMultiple = activities.length > 1;

    // If only 1 user, show static. If multiple, show marquee.
    // For marquee, we duplicate to ensure smooth loop if count is low but > 1
    const loopActivities = hasMultiple
        ? (activities.length < 5 ? [...activities, ...activities, ...activities, ...activities] : [...activities, ...activities])
        : activities;

    return (
        <div className="w-full bg-black/40 border-y border-white/5 backdrop-blur-md overflow-hidden py-3 mb-8 h-[50px] flex items-center">
            <div className="flex items-center gap-4 w-full">
                <div className="px-4 text-xs font-bold text-green-500 uppercase tracking-widest flex items-center gap-2 whitespace-nowrap flex-shrink-0 z-10 bg-black/5 md:bg-transparent pl-8 sm:pl-4">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Canlı Akış
                </div>

                <div className="flex overflow-hidden mask-linear-fade w-full relative">
                    {hasMultiple ? (
                        <motion.div
                            className="flex gap-12 whitespace-nowrap pl-4"
                            animate={{ x: [0, -1000] }}
                            transition={{
                                repeat: Infinity,
                                duration: Math.max(30, activities.length * 5), // Adjust speed based on content
                                ease: "linear"
                            }}
                        >
                            {loopActivities.map((activity, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                                    <FaUserCircle className="text-gray-600" />
                                    <Link href={`/profile/${activity.user}`} className="font-medium text-gray-300 hover:text-white hover:underline transition-colors">
                                        {activity.user}
                                    </Link>
                                    <span>{activity.action}</span>
                                    {activity.book && (
                                        <Link href={`/books/search?q=${activity.book}`} className="font-bold text-indigo-400 flex items-center gap-1 hover:text-indigo-300 transition-colors">
                                            <FaBookOpen className="text-xs" /> {activity.book}
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        /* Static display for single item */
                        <div className="flex items-center gap-2 text-sm text-gray-400 animate-in fade-in duration-500">
                            {activities.length > 0 ? (
                                <>
                                    <FaUserCircle className="text-gray-600" />
                                    <Link href={`/profile/${activities[0].user}`} className="font-medium text-gray-300 hover:text-white hover:underline transition-colors">
                                        {activities[0].user}
                                    </Link>
                                    <span>{activities[0].action}</span>
                                    {activities[0].book && (
                                        <Link href={`/books/search?q=${activities[0].book}`} className="font-bold text-indigo-400 flex items-center gap-1 hover:text-indigo-300 transition-colors">
                                            <FaBookOpen className="text-xs" /> {activities[0].book}
                                        </Link>
                                    )}
                                </>
                            ) : (
                                <div className="text-gray-500 text-xs italic">Şu an aktif okuyucu yok... Sessiz bir an.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
