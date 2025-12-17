import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import CreatePost from '@/components/feed/CreatePost';
import StoryRail from '@/components/feed/StoryRail';
import PostCard from '@/components/feed/PostCard';
import RecentMessages from '@/components/feed/RecentMessages';
import SuggestedUsers from '@/components/feed/SuggestedUsers';
import SuggestedBooks from '@/components/feed/SuggestedBooks';
import Link from 'next/link';
import DailyTrivia from '@/components/gamification/DailyTrivia';
import QuestBoard from '@/components/gamification/QuestBoard';

export const dynamic = 'force-dynamic';

async function getFeedData(userId) {
    try {
        // Get friends IDs
        const friendships = await prisma.friendship.findMany({
            where: {
                OR: [
                    { userId: userId, status: 'ACCEPTED' },
                    { friendId: userId, status: 'ACCEPTED' }
                ]
            }
        });

        const friendIds = friendships.map(f => f.userId === userId ? f.friendId : f.userId);
        const targetIds = [userId, ...friendIds];

        const posts = await prisma.post.findMany({
            where: {
                userId: { in: targetIds }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                        inventory: {
                            where: { equipped: true, item: { type: 'FRAME' } },
                            include: { item: { select: { image: true } } }
                        }
                    }
                },
                book: {
                    select: {
                        id: true,
                        title: true,
                        author: true,
                        cover: true
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                },
                likes: {
                    where: { userId: userId },
                    select: { userId: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        // Format posts
        const formattedPosts = posts.map(post => ({
            ...post,
            isLiked: post.likes.length > 0,
            likes: undefined, // internal use only
            likeCount: post._count.likes,
            commentCount: post._count.comments
        }));

        return { success: true, posts: formattedPosts };
    } catch (e) {
        console.error("Feed fetch error:", e);
        return { success: false, posts: [] };
    }
}

async function getStoriesData(userId) {
    try {
        // Get friends IDs
        const friendships = await prisma.friendship.findMany({
            where: {
                OR: [
                    { userId: userId, status: 'ACCEPTED' },
                    { friendId: userId, status: 'ACCEPTED' }
                ]
            }
        });

        const friendIds = friendships.map(f => f.userId === userId ? f.friendId : f.userId);
        const targetIds = [userId, ...friendIds];

        const stories = await prisma.story.findMany({
            where: {
                userId: { in: targetIds },
                expiresAt: { gt: new Date() }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, stories };
    } catch (e) {
        console.error("Story fetch error:", e);
        return { success: false, stories: [] };
    }
}

export default async function FeedPage() {
    const session = await getSession();

    // Fallback for unauthenticated users (though middleware should handle this)
    if (!session?.user?.id) {
        return (
            <div className="min-h-screen pt-24 text-center text-white">
                <h1 className="text-2xl font-bold">Lütfen giriş yapın</h1>
            </div>
        );
    }

    const feedData = await getFeedData(session.user.id);
    const storyData = await getStoriesData(session.user.id);

    return (
        <div className="min-h-screen pt-20 px-4 pb-12">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[280px_1fr_280px] gap-8">

                {/* LEFT COLUMN: Navigation & Messages */}
                <div className="hidden md:block space-y-6 sticky top-24 h-fit">
                    <RecentMessages />
                </div>

                {/* MIDDLE COLUMN: Feed */}
                <div className="min-w-0">
                    <StoryRail stories={storyData.stories || []} />

                    <CreatePost user={session.user} />

                    <div className="space-y-4">
                        {feedData.posts?.length > 0 ? (
                            feedData.posts.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))
                        ) : (
                            <div className="text-center py-20 bg-gray-900/20 rounded-xl border border-gray-800 border-dashed">
                                <p className="text-gray-400 mb-2">Henüz hiç gönderi yok.</p>
                                <p className="text-gray-600 text-sm mb-4">Arkadaşlarını ekle veya ilk gönderini paylaş!</p>
                                <Link href="/friends" className="inline-block px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-colors">
                                    Arkadaş Bul
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Suggestions */}
                <div className="hidden md:block space-y-6 sticky top-24 h-fit">
                    <QuestBoard />
                    <DailyTrivia />
                    <SuggestedUsers />
                    <SuggestedBooks />
                </div>

            </div>
        </div>
    );
}
