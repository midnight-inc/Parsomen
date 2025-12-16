import Skeleton from '../ui/Skeleton';

export default function BookCardSkeleton() {
    return (
        <div className="glass-panel overflow-hidden hover:scale-105 transition-all duration-300 group">
            {/* Cover Image Skeleton */}
            <Skeleton className="w-full h-64" variant="rectangular" animation="wave" />

            <div className="p-4 space-y-3">
                {/* Title */}
                <Skeleton className="w-3/4 h-6" variant="text" />

                {/* Author */}
                <Skeleton className="w-1/2 h-4" variant="text" />

                {/* Category Badge */}
                <Skeleton className="w-20 h-6 rounded-full" />

                {/* Rating and Pages */}
                <div className="flex items-center justify-between pt-2">
                    <Skeleton className="w-16 h-4" variant="text" />
                    <Skeleton className="w-12 h-4" variant="text" />
                </div>
            </div>
        </div>
    );
}
