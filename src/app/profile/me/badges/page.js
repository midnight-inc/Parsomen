"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function MyBadgesRedirect() {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (user) {
                router.replace(`/profile/${user.username}/badges`);
            } else {
                router.replace('/login');
            }
        }
    }, [user, loading, router]);

    return (
        <div className="min-h-screen pt-24 flex items-center justify-center">
            <div className="text-center">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Yönlendiriliyor...</p>
            </div>
        </div>
    );
}
