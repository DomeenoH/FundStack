import { logout } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    await logout();
    return NextResponse.json({ success: true });
}
