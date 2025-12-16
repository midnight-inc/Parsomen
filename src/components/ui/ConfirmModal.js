"use client";
import { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

// Global state for confirm modal
let confirmResolver = null;
let setConfirmState = null;

export function useConfirmModal() {
    const [state, setState] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Onayla',
        cancelText: 'İptal',
        variant: 'danger' // 'danger' | 'warning' | 'info'
    });

    useEffect(() => {
        setConfirmState = setState;
        return () => {
            setConfirmState = null;
        };
    }, []);

    return state;
}

/**
 * Show a confirmation modal and return a promise
 * @param {Object} options - Modal options
 * @param {string} options.title - Modal title
 * @param {string} options.message - Modal message
 * @param {string} options.confirmText - Confirm button text (default: "Onayla")
 * @param {string} options.cancelText - Cancel button text (default: "İptal")
 * @param {string} options.variant - Modal variant: 'danger' | 'warning' | 'info' (default: "danger")
 * @returns {Promise<boolean>} - True if confirmed, false if cancelled
 */
export function confirm({
    title = 'Emin misiniz?',
    message = 'Bu işlem geri alınamaz.',
    confirmText = 'Onayla',
    cancelText = 'İptal',
    variant = 'danger'
}) {
    return new Promise((resolve) => {
        confirmResolver = resolve;
        if (setConfirmState) {
            setConfirmState({
                isOpen: true,
                title,
                message,
                confirmText,
                cancelText,
                variant
            });
        } else {
            // Fallback to native confirm if modal not mounted
            resolve(window.confirm(message));
        }
    });
}

function handleConfirm() {
    if (confirmResolver) {
        confirmResolver(true);
        confirmResolver = null;
    }
    if (setConfirmState) {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
    }
}

function handleCancel() {
    if (confirmResolver) {
        confirmResolver(false);
        confirmResolver = null;
    }
    if (setConfirmState) {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
    }
}

export default function ConfirmModal() {
    const state = useConfirmModal();

    if (!state.isOpen) return null;

    const variantStyles = {
        danger: {
            icon: 'text-red-500',
            button: 'bg-red-600 hover:bg-red-700',
            border: 'border-red-500/20'
        },
        warning: {
            icon: 'text-yellow-500',
            button: 'bg-yellow-600 hover:bg-yellow-700',
            border: 'border-yellow-500/20'
        },
        info: {
            icon: 'text-blue-500',
            button: 'bg-blue-600 hover:bg-blue-700',
            border: 'border-blue-500/20'
        }
    };

    const styles = variantStyles[state.variant] || variantStyles.danger;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className={`bg-gray-900 border ${styles.border} rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200`}>
                {/* Header */}
                <div className="flex items-center gap-4 p-6 border-b border-gray-800">
                    <div className={`w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center ${styles.icon}`}>
                        <FaExclamationTriangle className="text-xl" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">{state.title}</h3>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-white transition-colors p-2"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-300">{state.message}</p>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 pt-0">
                    <button
                        onClick={handleCancel}
                        className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
                    >
                        {state.cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`flex-1 px-4 py-3 ${styles.button} text-white rounded-xl font-semibold transition-colors`}
                    >
                        {state.confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
