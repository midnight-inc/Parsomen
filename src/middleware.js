import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request) {
    const { pathname } = request.nextUrl;
    const currentUser = request.cookies.get('session')?.value;

    // Decrypt to verify validity
    const session = currentUser ? await decrypt(currentUser) : null;

    // Public routes that don't require authentication
    const publicPaths = ['/login', '/register', '/maintenance'];
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

    // Static files and API routes are already excluded by matcher

    // 1. If user is NOT authenticated and trying to access protected route
    if (!session && !isPublicPath) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. App User Redirection (Skip Landing Page)
    const userAgent = request.headers.get('user-agent') || '';
    if (userAgent.includes('ParsomenDesktop') && pathname === '/') {
        return NextResponse.redirect(new URL('/store', request.url));
    }

    // 3. If user IS authenticated and trying to access login/register
    if (session && isPublicPath && pathname !== '/maintenance') {
        return NextResponse.redirect(new URL('/store', request.url));
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-pathname', pathname);
    requestHeaders.set('x-query', request.nextUrl.searchParams.toString());

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api routes
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico
         * - public files (images, etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.gif$).*)',
    ],
};
