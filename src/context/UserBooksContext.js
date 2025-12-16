"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const UserBooksContext = createContext();

export function UserBooksProvider({ children }) {
    const [data, setData] = useState({
        progresses: {},
        library: [],
        collections: {},
        favorites: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/user/books-data', { cache: 'no-store' });
            if (res.ok) {
                const result = await res.json();
                setData(result);
            }
        } catch (error) {
            console.error('Failed to fetch user books data');
        } finally {
            setLoading(false);
        }
    };

    const getProgress = (bookId) => data.progresses[bookId] || null;
    const isInLibrary = (bookId) => data.library.includes(bookId);
    const getCollections = (bookId) => data.collections[bookId] || [];
    const isInFavorites = (bookId) => data.favorites?.some(id => id == bookId);

    return (
        <UserBooksContext.Provider value={{
            ...data,
            loading,
            getProgress,
            isInLibrary,
            getCollections,
            isInFavorites,
            refetch: fetchData
        }}>
            {children}
        </UserBooksContext.Provider>
    );
}

export function useUserBooks() {
    const context = useContext(UserBooksContext);
    if (!context) {
        return {
            progresses: {},
            library: [],
            collections: {},
            favorites: [],
            loading: false,
            getProgress: () => null,
            isInLibrary: () => false,
            getCollections: () => [],
            isInFavorites: () => false,
            refetch: () => { }
        };
    }
    return context;
}
