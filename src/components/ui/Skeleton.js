export default function Skeleton({ className = "", variant = "rectangular", animation = "pulse" }) {
    const baseClasses = "bg-gradient-to-r from-gray-800/50 via-gray-700/50 to-gray-800/50 bg-[length:200%_100%]";

    const animationClasses = {
        pulse: "animate-pulse",
        wave: "animate-[wave_1.5s_ease-in-out_infinite]",
        none: ""
    };

    const variantClasses = {
        text: "h-4 rounded",
        rectangular: "rounded-lg",
        circular: "rounded-full",
        card: "rounded-xl"
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant] || variantClasses.rectangular} ${animationClasses[animation]} ${className}`}
            aria-label="Loading..."
        />
    );
}
