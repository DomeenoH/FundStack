import { NextRequest, NextResponse } from 'next/server';
import { deleteDonation, batchDeleteDonations } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { ids } = await request.json();

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'Invalid request: ids array required' }, { status: 400 });
        }

        // 批量删除
        const deleted = await batchDeleteDonations(ids);

        return NextResponse.json({
            success: true,
            deleted: deleted.length,
            ids: deleted.map(d => d.id)
        });
    } catch (error) {
        console.error('[投喂小站] Delete error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
