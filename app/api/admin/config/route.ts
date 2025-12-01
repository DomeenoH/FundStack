/**
 * Admin API endpoint for configuration management
 * GET /api/admin/config - Get all configuration (requires auth)
 * PUT /api/admin/config - Update configuration (requires auth)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getSiteConfig, batchUpdateConfig } from '@/lib/db';
import { clearConfigCache, DEFAULT_CONFIG, SiteConfig } from '@/lib/config';

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

        const rawConfig = await getSiteConfig();

        // Merge with defaults to ensure all fields exist
        const config: SiteConfig = {
            ...DEFAULT_CONFIG,
            ...rawConfig,
        };

        // Get masked environment variables
        const envConfig = {
            EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || 'Not Set',
            SMTP_HOST: process.env.SMTP_HOST || 'Not Set',
            SMTP_PORT: process.env.SMTP_PORT || 'Not Set',
            SMTP_USER: process.env.SMTP_USER || 'Not Set',
            EMAIL_FROM: process.env.EMAIL_FROM || 'Not Set',
            // Mask sensitive values
            SMTP_PASSWORD: process.env.SMTP_PASSWORD ? '******' : 'Not Set',
            EMAIL_API_KEY: process.env.EMAIL_API_KEY ? '******' : 'Not Set',
            ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'Not Set',
        };

        return NextResponse.json({
            success: true,
            data: config,
            env_config: envConfig,
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
