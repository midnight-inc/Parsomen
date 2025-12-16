"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FaSpinner } from 'react-icons/fa';

export default function MyActivityRedirect() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (user) {
                router.replace(`/profile/${user.username}/activity`);
            } else {
                router.replace('/login');
            }
        }
    }, [user, loading, router]);

    return (
        <div className="min-h-screen pt-24 flex items-center justify-center text-white">
            <div className="text-center">
                <FaSpinner className="animate-spin text-4xl mx-auto mb-4 text-purple-500" />
                <p className="text-gray-400">Yönlendiriliyor...</p>
            </div>
        </div>
    );
}
