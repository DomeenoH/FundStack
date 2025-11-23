import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // Ensure ID is numeric
        if (!/^\d+$/.test(id)) {
            return NextResponse.json(
                { success: false, error: 'Invalid ID' },
                { status: 400 }
            );
        }

        const sql = neon(process.env.DATABASE_URL!);
        const data = await sql`
            SELECT * FROM donations WHERE id = ${id}
        `;

        if (!data.length) {
            return NextResponse.json(
                { success: false, error: 'Donation not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            donation: {
                ...data[0],
                amount: Number(data[0].amount)
            }
        });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}
