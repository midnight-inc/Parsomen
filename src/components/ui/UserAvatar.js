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

    // If we have a frame, we use a wrapper div with the gradient background (simulating border)
    if (frameGradient) {
        // Ensure the string has 'bg-gradient-to-br' or similar if missing, or user provides full class
        // Assuming database stores "from-cyan-400 to-blue-500"
        const gradientClass = frameGradient.includes('gradient') ? frameGradient : `bg-gradient-to-br ${frameGradient}`;

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
