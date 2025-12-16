"use client";
import { useEffect } from 'react';

export default function ViewTracker({ bookId, userId }) {
    useEffect(() => {
        if (!bookId || !userId) return;

        // Function to send heartbeat
        const sendHeartbeat = () => {
            fetch('/api/activity/heartbeat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    bookId: bookId,
                    userId: userId
                })
            }).catch(err => console.error('Failed to send heartbeat', err));
        };

        // Send immediately on mount
        sendHeartbeat();

        // Set interval for every 60 seconds
        const intervalId = setInterval(sendHeartbeat, 60000);

        // Cleanup on unmount
        return () => clearInterval(intervalId);

    }, [bookId, userId]);

    return null;
}
