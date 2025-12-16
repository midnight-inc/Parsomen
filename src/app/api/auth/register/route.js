import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { encrypt, getCookieOptions } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';

// Username validation regex - alphanumeric and underscore only
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
    // Rate limiting for auth - 5 attempts per minute
    const rateLimitError = await checkRateLimit(request, 'auth');
    if (rateLimitError) return rateLimitError;

    try {
        const body = await request.json();
        let { username, email, password } = body;

        // 1. Input Sanitization
        username = String(username || '').trim().slice(0, 30);
        email = String(email || '').toLowerCase().trim().slice(0, 100);
        password = String(password || '');

        // 2. Validation
        if (!username || !email || !password) {
            return NextResponse.json({
                success: false,
                message: 'Tüm alanlar zorunludur.'
            }, { status: 400 });
        }

        // Username validation
        if (username.length < 3) {
            return NextResponse.json({
                success: false,
                message: 'Kullanıcı adı en az 3 karakter olmalıdır.'
            }, { status: 400 });
        }

        if (!USERNAME_REGEX.test(username)) {
            return NextResponse.json({
                success: false,
                message: 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir.'
            }, { status: 400 });
        }

        // Email validation
        if (!EMAIL_REGEX.test(email)) {
            return NextResponse.json({
                success: false,
                message: 'Geçerli bir e-posta adresi girin.'
            }, { status: 400 });
        }

        // Password validation
        if (password.length < 6) {
            return NextResponse.json({
                success: false,
                message: 'Şifre en az 6 karakter olmalıdır.'
            }, { status: 400 });
        }

        if (password.length > 100) {
            return NextResponse.json({
                success: false,
                message: 'Şifre çok uzun.'
            }, { status: 400 });
        }

        // 3. Check for existing user
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { username: username }
                ]
            }
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return NextResponse.json({
                    success: false,
                    message: 'Bu e-posta adresi zaten kullanımda.'
                }, { status: 409 });
            }
            return NextResponse.json({
                success: false,
                message: 'Bu kullanıcı adı zaten alınmış.'
            }, { status: 409 });
        }

        // 4. Hash Password with stronger rounds for security
        const hashedPassword = await bcrypt.hash(password, 12);

        // 5. Create User
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role: 'USER',
                level: 1,
                xp: 0,
                points: 100 // Starting points
            }
        });

        console.log(`[Register] New user created: ${newUser.id} - ${newUser.username}`);

        // 6. Auto Login (Create Session)
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
        const sessionUser = {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role
        };

        const session = await encrypt({ user: sessionUser, userId: newUser.id, expires });

        // SECURITY: Use secure cookie options
        (await cookies()).set('session', session, getCookieOptions(expires));

        return NextResponse.json({
            success: true,
            message: 'Kayıt başarılı! Yönlendiriliyorsunuz...'
        });

    } catch (error) {
        console.error('[Register] Error:', error);
        // SECURITY: Don't expose internal error messages
        return NextResponse.json({
            success: false,
            message: 'Kayıt sırasında bir hata oluştu.'
        }, { status: 500 });
    }
}

