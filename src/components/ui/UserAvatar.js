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
                    style={{ width: dimension + 8, height: dimension + 8 }}
                >
                    {/* The Frame Overlay */}
                    <div className="absolute inset-0 z-20 pointer-events-none">
                        <Image
                            src={frameGradient}
                            alt="Frame"
                            fill
                            className="object-contain scale-125" // Scale up slightly to sit outside avatar
                        />
                    </div>

                    {/* The Avatar */}
                    <div className="relative rounded-full overflow-hidden bg-black border-2 border-black z-10" style={{ width: dimension, height: dimension }}>
                        <Image
                            src={imageSrc}
                            alt={alt || user?.username || "User"}
                            width={dimension}
                            height={dimension}
                            className="object-cover w-full h-full"
                        />
                    </div>
                </div>
            );
        }

        // Case 2: CSS Gradient (Legacy/Simple frames)
        // Ensure the string has 'bg-gradient-to-br' or similar if missing and looks like a tailwind color
        const gradientClass = (frameGradient.includes('gradient') || frameGradient.includes('from-'))
            ? (frameGradient.includes('gradient') ? frameGradient : `bg-gradient-to-br ${frameGradient}`)
            : '';

        if (gradientClass) {
            return (
                <div
                    className={`relative rounded-full flex items-center justify-center ${gradientClass} ${className} shadow-lg`}
                    style={{ width: dimension + 8, height: dimension + 8 }} // 4px border all around
                >
                    <div className="rounded-full bg-black p-[2px] overflow-hidden" style={{ width: dimension, height: dimension }}>
                        <Image
                            src={imageSrc}
                            alt={alt || user?.username || "User"}
                            width={dimension}
                            height={dimension}
                            className="object-cover w-full h-full rounded-full"
                        />
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
