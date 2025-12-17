export default function Skeleton({ className = "" }) {
    return (
        <div
            className={`bg-gray-800/50 rounded-lg animate-pulse ${className}`}
            style={{
                backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0, rgba(255,255,255,0.05) 20%, rgba(255,255,255,0.1) 60%, rgba(255,255,255,0))',
                backgroundSize: '200% 100%',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite, shimmer 2s infinite'
            }}
        />
    );
}
