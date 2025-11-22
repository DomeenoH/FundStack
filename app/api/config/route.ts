/**
 * Public API endpoint for site configuration
 * GET /api/config - Returns all public site configuration
 */

import { NextResponse } from 'next/server';
import { getConfig } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const config = await getConfig();

        return NextResponse.json({
            success: true,
            data: config,
        });
    } catch (error) {
        console.error('[投喂小站] Error fetching site config:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch configuration',
            },
            { status: 500 }
        );
    }
}
