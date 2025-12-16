import BookGridSkeleton from '@/components/books/BookGridSkeleton';
import Skeleton from '@/components/ui/Skeleton';

export default function LibraryLoading() {
    return (
        <div className="min-h-screen pt-24 px-4 sm:px-8 pb-20 max-w-7xl mx-auto">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-1.5 h-8 rounded-full" />
                    <Skeleton className="w-48 h-8" variant="text" />
                </div>
            </div>

            {/* Filter Tabs Skeleton */}
            <div className="flex gap-4 mb-8 border-b border-gray-800">
                {Array.from({ length: 4 }).map((_, idx) => (
                    <Skeleton key={idx} className="w-24 h-10" variant="text" />
                ))}
            </div>

            {/* Books Grid Skeleton */}
            <BookGridSkeleton count={8} />
        </div>
    );
}
