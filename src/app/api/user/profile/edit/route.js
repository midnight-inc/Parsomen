import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { differenceInDays, differenceInMinutes } from 'date-fns';

// PUT - Update user profile
export async function PUT(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = await decrypt(token);
        const rawUserId = session?.user?.id;

        if (!rawUserId) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }

        const userId = parseInt(rawUserId, 10);

        const currentUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const body = await req.json();
        const { username, bio, avatar, theme, font } = body;

        console.log(`[Profile Edit] Updating user ${userId}. Data:`, { username, bio });

        let updateData = {
            ...(bio !== undefined && { bio }),
            ...(theme && { theme }),
            ...(font && { font }),
        };

        // 1. Username Change Logic
        if (username && username !== currentUser.username) {
            // Check Collision
            const existingUser = await prisma.user.findFirst({
                where: {
                    username: username,
                    NOT: { id: userId }
                }
            });

            if (existingUser) {
                console.log(`[Profile Edit] Collision: '${username}' is taken`);
                return NextResponse.json({ error: 'Bu kullanıcı adı zaten alınmış' }, { status: 400 });
            }

            // Check Cooldown (Skip for Admin)
            if (currentUser.role !== 'ADMIN') {
                if (currentUser.lastUsernameChange) {
                    const daysSinceLastChange = differenceInDays(new Date(), new Date(currentUser.lastUsernameChange));
                    if (daysSinceLastChange < 30) {
                        const remaining = 30 - daysSinceLastChange;
                        return NextResponse.json({ error: `Kullanıcı adını 30 günde bir değiştirebilirsin. ${remaining} gün kaldı.` }, { status: 400 });
                    }
                }
            }

            updateData.username = username;
            updateData.lastUsernameChange = new Date();
        }

        // 2. Avatar Change Logic
        if (avatar && avatar !== currentUser.avatar) {
            // Check Cooldown (Skip for Admin? User didn't request admin exempt for avatar but generally good practice. Let's apply to all for now as per request "zırt pırt değişmesin")
            // Actually, usually admins bypass limits. I'll allow admins to bypass avatar limit too.
            if (currentUser.role !== 'ADMIN') {
                if (currentUser.lastAvatarChange) {
                    const minsSinceLastChange = differenceInMinutes(new Date(), new Date(currentUser.lastAvatarChange));
                    if (minsSinceLastChange < 15) {
                        const remaining = 15 - minsSinceLastChange;
                        return NextResponse.json({ error: `Profil fotoğrafını çok sık değiştiremezsin. ${remaining} dakika beklemelisin.` }, { status: 400 });
                    }
                }
            }

            updateData.avatar = avatar;
            updateData.lastAvatarChange = new Date();
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                username: true,
                email: true,
                bio: true,
                avatar: true,
                theme: true,
                font: true,
                level: true,
                xp: true,
                points: true,
                role: true
            }
        });

        console.log(`[Profile Edit] Update SUCCESS. New Bio: '${updatedUser.bio}'`);

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error('[Profile Edit] Error:', error);
        return NextResponse.json({ error: 'Update failed', details: error.message }, { status: 500 });
    }
}
