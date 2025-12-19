import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from './lib/jwt';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect /admin routes
    if (pathname.startsWith('/admin')) {
        // Exclude login page and api routes (api routes handle their own auth or are public)
        // Actually API routes needing auth should be checked. But let's focus on pages first.
        // The requirement says: "intercept /admin routes".
        // We should NOT block /admin/login
        if (pathname === '/admin/login') {
            return NextResponse.next();
        }

        const session = request.cookies.get('session')?.value;

        if (!session) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        try {
            await decrypt(session);
            return NextResponse.next();
        } catch (error) {
            // Invalid session
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
