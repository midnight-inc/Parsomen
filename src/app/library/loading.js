
import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
    return (
        <div className="min-h-screen pt-24 px-4 max-w-7xl mx-auto">
            <div className="flex items-center mb-8 gap-4">
                <Skeleton className="w-1 h-8 bg-pink-500" />
                <Skeleton className="w-48 h-8" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden h-full flex flex-col">
                        <Skeleton className="aspect-[2/3] w-full" />
                        <div className="p-4 flex-1 flex flex-col gap-2">
                            <Skeleton className="w-3/4 h-4" />
                            <Skeleton className="w-1/2 h-3" />
                            <div className="mt-auto pt-3 border-t border-gray-800 flex justify-between">
                                <Skeleton className="w-8 h-3" />
                                <Skeleton className="w-16 h-3" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
