import { prisma } from '@/lib/prisma';
import StoreClient from '@/components/store/StoreClient';
import StoreNavigation from '@/components/store/StoreNavigation';
import StoreHero from '@/components/store/StoreHero';
import DiscoveryQueue from '@/components/store/DiscoveryQueue';
import CuratorLists from '@/components/store/CuratorLists';
import SeasonalEvents from '@/components/store/SeasonalEvents';


export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function StorePage(props) {
    try {
        let searchParams = {};
        try {
            searchParams = await props.searchParams;
        } catch (e) {
            console.error("Params Error", e);
        }
        searchParams = searchParams || {};
        const category = searchParams.category;
        const search = searchParams.search || '';

        // Build query
        const where = {};
        if (category && category !== 'All') {
            where.category = { name: category };
        }
        if (search) {
            where.OR = [
                { title: { contains: search } },
                { author: { contains: search } }
            ];
        }

        // Fetch Books with category relation
        const books = await prisma.book.findMany({
            where,
            include: { category: true },
            orderBy: { id: 'desc' }
        });

        // Fetch Categories (Direct DB call instead of internal fetch)
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' }
        });

        return (
            <>
                <div className="pt-24 px-4 sm:px-8 max-w-[1600px] mx-auto pb-20">
                    {/* Top Navigation Cards */}
                    <StoreNavigation />

                    {/* Hero Section (Deal of the Day) */}
                    <StoreHero />

                    {/* Discovery Queue */}
                    <div className="mb-12">
                        <DiscoveryQueue />
                    </div>

                    {/* Seasonal Events */}
                    <SeasonalEvents />

                    {/* Curator Lists */}
                    <CuratorLists />

                    {/* Main Store Catalog (Search & Filters) */}
                    <div id="catalog" className="scroll-mt-24">
                        <div className="flex items-center gap-4 mb-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <span className="w-1 h-8 bg-pink-500 rounded-full"></span>
                                Tüm Kitaplar
                            </h2>
                            <div className="h-px bg-white/10 flex-1"></div>
                        </div>

                        <StoreClient
                            books={books}
                            categories={categories}
                            category={category}
                            search={search}
                        />
                    </div>
                </div>
            </>
        );
    } catch (error) {
        console.error('Store Page Error:', error);
        return (
            <div className="pt-32 px-8 text-center text-white">
                <h1 className="text-2xl font-bold text-red-500 mb-4">Bir Hata Oluştu</h1>
                <p className="text-gray-300 mb-4">Mağaza verileri yüklenirken bir sorun yaşandı.</p>
                <div className="bg-gray-900 p-4 rounded text-left overflow-auto max-w-2xl mx-auto text-xs font-mono text-red-300 border border-red-900">
                    {error.message}
                    <br />
                    {error.stack}
                </div>
            </div>
        );
    }
}
