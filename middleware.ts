import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from './lib/jwt';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect /admin routes and /api/admin routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
        // Exclude login page
        if (pathname === '/admin/login') {
            return NextResponse.next();
        }

        const session = request.cookies.get('session')?.value;

        const unauthorizedResponse = () => {
            if (pathname.startsWith('/api/') || pathname.includes('/api/admin')) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/admin/login', request.url));
        };

        if (!session) {
            return unauthorizedResponse();
        }

        try {
            await decrypt(session);
            return NextResponse.next();
        } catch (error) {
            // Invalid session
            return unauthorizedResponse();
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
