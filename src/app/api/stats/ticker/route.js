import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// Force dynamic to prevent caching of outdated data
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Fetch only REAL recent activities from database
        const recentActivities = await prisma.userActivity.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { username: true }
                }
            }
        });

        let messages = [];

        if (recentActivities.length > 0) {
            // Helper to get book title safely
            const getBookTitle = async (id) => {
                if (!id) return "bir kitap";
                try {
                    const book = await prisma.book.findUnique({ where: { id: parseInt(id) }, select: { title: true } });
                    return book ? book.title : "bir kitap";
                } catch { return "bir kitap"; }
            };

            // Process activities sequentially to fetch book titles
            for (const act of recentActivities) {
                let bookName = "bir kitap";
                if (act.targetId) {
                    bookName = await getBookTitle(act.targetId);
                }

                let text = "";
                switch (act.type) {
                    case 'STARTED_READING':
                        text = `📖 ${act.user.username}, ${bookName} okumaya başladı.`;
                        break;
                    case 'FINISHED_READING':
                        text = `✅ ${act.user.username}, ${bookName} bitirdi!`;
                        break;
                    case 'WANT_TO_READ':
                        text = `🕒 ${act.user.username}, ${bookName} listesine ekledi.`;
                        break;
                    case 'DROPPED':
                        text = `❌ ${act.user.username}, ${bookName} yarım bıraktı.`;
                        break;
                    case 'LIBRARY_UPDATE':
                        text = `📚 ${act.user.username} kütüphanesini güncelledi.`;
                        break;
                    default:
                        // Skip unknown types to ensure cleanliness
                        continue;
                }
                messages.push(text);
            }
        }

        // Fallback ONLY if absolutely no data exists in DB
        if (messages.length === 0) {
            messages.push("Parşomen'e Hoş Geldiniz! 📚", "İyi okumalar dileriz.");
        }

        return NextResponse.json({
            success: true,
            messages: messages,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("Ticker Error:", error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
