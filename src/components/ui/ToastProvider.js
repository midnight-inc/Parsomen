"use client";
import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
                // Default options
                duration: 3000,
                style: {
                    background: 'rgba(25, 25, 35, 0.95)',
                    color: '#fff',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                    fontSize: '14px',
                    fontWeight: '500',
                },
                // Success style
                success: {
                    duration: 3000,
                    iconTheme: {
                        primary: '#10b981',
                        secondary: '#fff',
                    },
                    style: {
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                    },
                },
                // Error style
                error: {
                    duration: 4000,
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                    },
                    style: {
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                    },
                },
                // Loading style
                loading: {
                    iconTheme: {
                        primary: '#6366f1',
                        secondary: '#fff',
                    },
                    style: {
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                    },
                },
            }}
        />
    );
}
