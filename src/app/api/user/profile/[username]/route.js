import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req, { params }) {
    const { username } = await params;

    const session = await getSession();
    const viewerId = session?.user?.id;

    try {
        const decodedUsername = decodeURIComponent(username);
        console.log(`Profile API Request: username='${username}', decoded='${decodedUsername}'`);

        // 1. Try Exact Match
        let user = await prisma.user.findFirst({
            where: { username: decodedUsername },
            select: {
                id: true,
                username: true,
                bio: true,
                avatar: true,
                level: true,
                xp: true,
                createdAt: true,
                // readingProgress removed, use library
                library: {
                    where: { status: { in: ['READ', 'READING'] } },
                    include: {
                        book: {
                            select: {
                                id: true,
                                title: true,
                                cover: true,
                                pages: true,
                                category: true
                            }
                        }
                    },
                    orderBy: { addedAt: 'desc' },
                    take: 10
                },
                favorites: true,
                collections: {
                    where: { isPublic: true }
                },
                badges: { include: { badge: true } },
                reviews: {
                    include: { book: true },
                    orderBy: { createdAt: 'desc' },
                    take: 5
                },
                _count: {
                    select: {
                        reviews: true,
                        library: true,
                        collections: true,
                        favorites: true
                    }
                }
            }
        });

        // 2. Fallback: Case-insensitive search
        if (!user) {
            console.log("Exact match failed, trying case-insensitive...");

            const potentialUsers = await prisma.user.findMany({
                where: {
                    username: {
                        contains: decodedUsername // Remove mode: insensitive if not supported or use raw query
                    }
                },
                select: { id: true, username: true }
            });

            // Manual filter for case-insensitive exact match
            const match = potentialUsers.find(u => u.username.toLowerCase() === decodedUsername.toLowerCase());

            if (match) {
                console.log(`Found case-insensitive match: ${match.username}`);
                user = await prisma.user.findFirst({
                    where: { id: match.id },
                    select: {
                        id: true,
                        username: true,
                        bio: true,
                        avatar: true,
                        role: true,
                        level: true,
                        xp: true,
                        points: true,
                        createdAt: true,
                        library: {
                            where: { status: { in: ['READ', 'READING'] } },
                            include: {
                                book: {
                                    select: {
                                        id: true,
                                        title: true,
                                        cover: true,
                                        category: true
                                    }
                                }
                            },
                            orderBy: { addedAt: 'desc' },
                            take: 10
                        },
                        favorites: true,
                        collections: {
                            where: { isPublic: true }
                        },
                        badges: { include: { badge: true } },
                        reviews: {
                            include: { book: true },
                            orderBy: { createdAt: 'desc' },
                            take: 5
                        },
                        posts: {
                            orderBy: { createdAt: 'desc' },
                            take: 5,
                            include: {
                                _count: { select: { likes: true, comments: true } }
                            }
                        },
                        _count: {
                            select: {
                                reviews: true,
                                library: true,
                                collections: true,
                                favorites: true,
                                posts: true
                            }
                        }
                    }
                });
            }
        }

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Calculate Stats
        // ReadingProgress didn't track seconds reliably, LibraryEntry doesn't track seconds either yet.
        // We will default totalReadTime to 0 or estimate based on pages read * standard speed if needed.
        // For now 0.
        const totalReadTime = 0;
        const booksCompleted = user.library.filter(e => e.status === 'READ').length;
        const booksInProgress = user.library.filter(e => e.status === 'READING').length;

        // Get friend count
        const friendCount = await prisma.friendship.count({
            where: {
                OR: [
                    { userId: user.id, status: 'ACCEPTED' },
                    { friendId: user.id, status: 'ACCEPTED' }
                ]
            }
        });

        // Check friendship status with viewer (if not own profile)
        let friendshipStatus = null;
        if (viewerId && viewerId !== user.id) {
            const friendship = await prisma.friendship.findFirst({
                where: {
                    OR: [
                        { userId: viewerId, friendId: user.id },
                        { userId: user.id, friendId: viewerId }
                    ]
                }
            });
            if (friendship) {
                friendshipStatus = friendship.status;
            }
        }
        // Recent Activity (Last 3 read books)
        // Recent Activity (Last 3 read books from library)
        const recentActivity = user.library
            .slice(0, 3)
            .map(p => ({
                id: p.book.id,
                title: p.book.title,
                cover: p.book.cover,
                percentage: p.status === 'READ' ? 100 : (p.book.pages && p.progress ? Math.min(100, Math.round((p.progress / p.book.pages) * 100)) : 0),
                lastRead: p.addedAt
            }));

        const isOwnProfile = viewerId && String(viewerId) === String(user.id);

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                bio: user.bio || '',
                avatar: user.avatar || '',
                role: user.role,
                level: user.level,
                xp: user.xp,
                points: user.points || 0,
                joinedAt: user.createdAt,
                stats: {
                    totalReadTime,
                    booksCompleted,
                    booksInProgress
                },
                badges: user.badges || [],
                posts: user.posts || [],
                reviews: user.reviews || [],
                _count: user._count,
                friendCount,
                friendshipStatus,
                recentActivity,
                isOwnProfile
            }
        });

    } catch (error) {
        console.error('Public profile fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}
