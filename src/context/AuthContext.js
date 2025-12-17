"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    async function loadUser() {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (err) {
            console.error("Failed to load user", err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadUser();
    }, []);

    const reloadUser = async () => {
        await loadUser();
    };

    // Gamification: Track level changes
    const [previousLevel, setPreviousLevel] = useState(null);

    useEffect(() => {
        if (user && user.level) {
            // Initial load
            if (previousLevel === null) {
                setPreviousLevel(user.level);
            } else if (user.level > previousLevel) {
                // LEVEL UP!
                import('@/components/ui/Confetti').then(({ triggerSchoolPride }) => {
                    triggerSchoolPride();
                    // Play sound if possible (or just rely on visual)
                    // const audio = new Audio('/sounds/levelup.mp3');
                    // audio.play().catch(e => console.log('Audio play failed', e));
                });

                import('react-hot-toast').then(({ toast }) => {
                    toast.success(`Tebrikler! Seviye ${user.level} oldun! 🎉`, {
                        duration: 5000,
                        icon: '🆙',
                        style: {
                            borderRadius: '10px',
                            background: '#333',
                            color: '#fff',
                        },
                    });
                });

                setPreviousLevel(user.level);
            }
        }
    }, [user, previousLevel]);

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setUser(null);
        setPreviousLevel(null); // Reset level tracking
        router.push('/login');
        router.refresh();
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, reloadUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
