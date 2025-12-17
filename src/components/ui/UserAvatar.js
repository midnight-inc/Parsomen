import Image from 'next/image';

export default function UserAvatar({ user, src, alt, size = 40, className = "" }) {
    // Determine image source
    const imageSrc = src || user?.avatar || "/default-avatar.png";

    // Find equipped frame
    let frameGradient = "";
    if (user?.inventory && Array.isArray(user.inventory)) {
        const equippedFrame = user.inventory.find(inv => inv.equipped === true && (inv.item?.type === 'FRAME' || inv.item?.type === 'frame'));
        if (equippedFrame) {
            frameGradient = equippedFrame.item.image; // e.g. "from-cyan-400 to-blue-500" or "bg-gradient-to-r ..."
        }
    }

    // Normalized dimensions
    const dimension = typeof size === 'number' ? size : 40;

    // If we have a frame
    if (frameGradient) {
        // Case 1: Image URL (Absolute or Relative)
        if (frameGradient.startsWith('/') || frameGradient.startsWith('http')) {
            return (
                <div
                    className={`relative flex items-center justify-center ${className}`}
                    style={{ width: dimension, height: dimension }}
                >
                    {/* The Frame Overlay - Scaled up and pointer-events-none */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] z-20 pointer-events-none">
                        <Image
                            src={frameGradient}
                            alt="Frame"
                            fill
                            className="object-contain"
                        />
                    </div>

                    {/* The Avatar */}
                    <div className="relative w-full h-full rounded-full overflow-hidden bg-black z-10">
                        <Image
                            src={imageSrc}
                            alt={alt || user?.username || "User"}
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>
            );
        }

        // Case 2: CSS Gradient (Steam-like Animated Borders)
        const gradientClass = (frameGradient.includes('gradient') || frameGradient.includes('from-'))
            ? (frameGradient.includes('gradient') ? frameGradient : `bg-gradient-to-br ${frameGradient}`)
            : '';

        if (gradientClass) {
            return (
                <div
                    className={`relative flex items-center justify-center ${className}`}
                    style={{ width: dimension + 8, height: dimension + 8 }}
                >
                    {/* Animated Outer Glow/Border */}
                    <div className={`absolute inset-0 rounded-full ${gradientClass} blur-sm opacity-50 animate-pulse`}></div>
                    <div className={`absolute inset-0 rounded-full ${gradientClass} animate-spin-slow`}></div>

                    {/* Inner Content */}
                    <div className="relative w-full h-full rounded-full bg-black p-[3px] z-10">
                        <div className="w-full h-full rounded-full overflow-hidden relative">
                            <Image
                                src={imageSrc}
                                alt={alt || user?.username || "User"}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            );
        }
    }

    return (
        <div
            className={`relative rounded-full overflow-hidden bg-gray-800 ${className}`}
            style={{ width: dimension, height: dimension }}
        >
            <Image
                src={imageSrc}
                alt={alt || user?.username || "User"}
                width={dimension}
                height={dimension}
                className="object-cover w-full h-full"
            />
        </div>
    );
}
