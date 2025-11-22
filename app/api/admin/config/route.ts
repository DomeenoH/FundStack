/**
 * Admin API endpoint for configuration management
 * GET /api/admin/config - Get all configuration (requires auth)
 * PUT /api/admin/config - Update configuration (requires auth)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getSiteConfig, batchUpdateConfig } from '@/lib/db';
import { clearConfigCache } from '@/lib/config';

export const dynamic = 'force-dynamic';

// GET - Fetch all configuration
export async function GET(request: NextRequest) {
    try {
        // Verify admin authentication
        const authResult = await verifyAuth(request);
        if (!authResult.isValid) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const config = await getSiteConfig();

        return NextResponse.json({
            success: true,
            data: config,
        });
    } catch (error) {
        console.error('[v0] Error fetching admin config:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch configuration',
            },
            { status: 500 }
        );
    }
}

// PUT - Update configuration
export async function PUT(request: NextRequest) {
    try {
        // Verify admin authentication
        const authResult = await verifyAuth(request);
        if (!authResult.isValid) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { updates } = body;

        if (!updates || typeof updates !== 'object') {
            return NextResponse.json(
                { success: false, error: 'Invalid request body' },
                { status: 400 }
            );
        }

        // Update configuration
        await batchUpdateConfig(updates);

        // Clear cache to ensure fresh data
        clearConfigCache();

        return NextResponse.json({
            success: true,
            message: 'Configuration updated successfully',
        });
    } catch (error) {
        console.error('[v0] Error updating config:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update configuration',
            },
            { status: 500 }
        );
    }
}
