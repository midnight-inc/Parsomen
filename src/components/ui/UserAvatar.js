import Image from 'next/image';

export default function UserAvatar({ user, src, alt, size = 40, className = "" }) {
    // Determine image source
    const imageSrc = src || user?.avatar || "/default-avatar.png";

    // Find equipped frame if user object is provided with inventory
    let frameClass = "";
    if (user?.inventory && Array.isArray(user.inventory)) {
        const equippedFrame = user.inventory.find(inv => inv.equipped === true && inv.item?.type === 'FRAME');
        if (equippedFrame) {
            frameClass = equippedFrame.item.image; // e.g. "border-yellow-500 shadow-xl"
        }
    }

    // Map size to dimensions
    const dimension = typeof size === 'number' ? size : 40;

    return (
        <div
            className={`relative rounded-full flex items-center justify-center bg-black ${className} ${frameClass ? `border-4 ${frameClass}` : ''}`}
            style={{ width: dimension + (frameClass ? 8 : 0), height: dimension + (frameClass ? 8 : 0) }} // Adjust size for border
        >
            <div className="relative rounded-full overflow-hidden" style={{ width: dimension, height: dimension }}>
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
