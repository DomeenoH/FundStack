import { login } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        await login(formData);
        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof Error && error.message === '密码错误') {
            return NextResponse.json({ error: '密码错误' }, { status: 401 });
        }
        return NextResponse.json({ error: '登录失败' }, { status: 500 });
    }
}
