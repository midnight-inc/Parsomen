import React from 'react';
import { FaSpinner } from 'react-icons/fa';

export default function Button({
    children,
    onClick,
    type = 'button',
    variant = 'primary', // primary, secondary, danger, outline, ghost, success
    size = 'md', // sm, md, lg, xl, icon, icon-lg
    className = '',
    disabled = false,
    loading = false,
    icon = null,
    fullWidth = false,
    title = '',
    ...props
}) {
    const baseStyles = "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg hover:shadow-indigo-500/50",
        secondary: "bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white border border-gray-700",
        danger: "bg-red-600 hover:bg-red-500 text-white shadow-lg hover:shadow-red-500/30",
        outline: "border-2 border-indigo-500 text-indigo-400 hover:bg-indigo-500/10",
        ghost: "text-gray-400 hover:text-white hover:bg-white/5",
        success: "bg-green-600 hover:bg-green-500 text-white shadow-lg hover:shadow-green-500/30",
        active: "bg-red-600 hover:bg-red-500 text-white border-red-500", // Special variant for toggled states like favorites
    };

    const sizes = {
        xs: "px-2 py-1 text-xs",
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
        xl: "px-8 py-4 text-lg",
        icon: "p-2 aspect-square flex items-center justify-center text-xl", // for standard icon buttons
        "icon-lg": "p-3 aspect-square flex items-center justify-center text-2xl",
    };

    const widthClass = fullWidth ? "w-full" : "";

    return (
        <button
            type={type}
            className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${widthClass} ${className}`}
            onClick={onClick}
            disabled={disabled || loading}
            title={title}
            {...props}
        >
            {loading ? (
                <FaSpinner className="animate-spin" />
            ) : (
                <>
                    {icon && <span className={children ? "mr-2" : ""}>{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
}
