import BookGridSkeleton from '@/components/books/BookGridSkeleton';
import Skeleton from '@/components/ui/Skeleton';

export default function StoreLoading() {
    return (
        <div className="min-h-screen pt-24 px-4 sm:px-8 pb-20 max-w-7xl mx-auto">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-1.5 h-8 rounded-full" />
                    <Skeleton className="w-32 h-8" variant="text" />
                </div>
            </div>

            {/* Categories Skeleton */}
            <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                {Array.from({ length: 6 }).map((_, idx) => (
                    <Skeleton key={idx} className="min-w-[120px] h-10 rounded-full" />
                ))}
            </div>

            {/* Books Grid Skeleton */}
            <BookGridSkeleton count={12} />
        </div>
    );
}
