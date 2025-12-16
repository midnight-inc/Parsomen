import { NextResponse } from 'next/server';
import { encrypt, getCookieOptions } from '@/lib/auth';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request) {
    // Rate limiting for auth - 5 attempts per minute
    const rateLimitError = await checkRateLimit(request, 'auth');
    if (rateLimitError) return rateLimitError;

    try {
        const body = await request.json();
        const { identifier, password } = body;

        if (!identifier || !password) {
            return NextResponse.json({
                success: false,
                message: 'Lütfen tüm alanları doldurun.'
            }, { status: 400 });
        }

        // 1. Find User (by Email OR Username)
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier.toLowerCase().trim() },
                    { username: identifier.trim() }
                ]
            }
        });

        // SECURITY: Use generic message to prevent user enumeration
        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'Kullanıcı adı veya şifre hatalı.'
            }, { status: 401 });
        }

        // 2. Verify Password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            console.log(`[Login] Failed attempt for user: ${identifier}`);
            return NextResponse.json({
                success: false,
                message: 'Kullanıcı adı veya şifre hatalı.'
            }, { status: 401 });
        }

        // 3. Create Session
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        // SECURITY: Don't include password in session
        const sessionUser = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        const session = await encrypt({ user: sessionUser, userId: user.id, expires });

        // SECURITY: Use secure cookie options
        (await cookies()).set('session', session, getCookieOptions(expires));

        console.log(`[Login] Successful login for user: ${user.id}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Login] Error:', error);
        // SECURITY: Don't expose internal error messages
        return NextResponse.json({
            success: false,
            message: 'Giriş yapılırken bir hata oluştu.'
        }, { status: 500 });
    }
}

