import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// JWT Secret - MUST be set in environment variables for production
const secretKey = process.env.JWT_SECRET || "development-only-secret-change-in-production";
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    console.error('CRITICAL SECURITY WARNING: JWT_SECRET environment variable is not set!');
}
const key = new TextEncoder().encode(secretKey);

// Cookie security options
const getCookieOptions = (expires) => ({
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax', // CSRF protection
    path: '/',
});

export async function encrypt(payload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key);
}

export async function decrypt(input) {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (error) {
        console.error('JWT verification failed:', error.message);
        return null;
    }
}

export async function login(formData) {
    // In a real app, verify against DB. For now, valid if email exists or simple check.
    // We will assume validation passed in the API route.
    const user = { email: formData.get('email'), name: 'User' };

    // Create the session
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
    const session = await encrypt({ user, expires });

    // Save the session in a cookie with secure options
    (await cookies()).set('session', session, getCookieOptions(expires));
}

export async function logout() {
    // Destroy the session
    (await cookies()).set('session', '', {
        expires: new Date(0),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });
}

export async function getSession() {
    const session = (await cookies()).get('session')?.value;
    if (!session) return null;
    return await decrypt(session);
}

// Export cookie options for use in other files
export { getCookieOptions };

