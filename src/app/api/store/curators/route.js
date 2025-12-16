import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        // Fetch public collections to serve as "Curator Lists"
        const collections = await prisma.collection.findMany({
            where: {
                isPublic: true,
                books: {
                    some: {} // Only show collections that have at least one book
                }
            },
            take: 8, // Limit to 8 lists
            include: {
                user: {
                    select: {
                        username: true,
                        role: true,
                        // profileImage: true // If added later
                    }
                },
                _count: {
                    select: { books: true }
                }
            },
            orderBy: {
                createdAt: 'desc' // Newest first, or we could add a 'likes' field later
            }
        });

        // Transform data to match component expectation
        const curators = collections.map(col => {
            // Generate a color based on ID to keep it consistent but varied
            const colors = ["bg-red-500", "bg-blue-500", "bg-purple-500", "bg-yellow-500", "bg-green-500", "bg-pink-500", "bg-indigo-500", "bg-orange-500"];
            const color = colors[col.id % colors.length];

            return {
                id: col.id,
                title: col.name,
                name: col.user.username,
                avatar: col.user.username.charAt(0).toUpperCase(),
                color: color,
                role: col.user.role,
                books: col._count.books,
                followers: 0 // We don't have a follower system for collections yet, mock 0 or random for now if needed, but 0 is honest
            };
        });

        return NextResponse.json({ success: true, curators });
    } catch (error) {
        console.error('Curator Lists error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
