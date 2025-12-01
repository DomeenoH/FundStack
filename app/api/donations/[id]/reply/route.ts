import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const [username, password] = decoded.split(':');

        if (username !== 'admin' || password !== (process.env.ADMIN_PASSWORD || 'admin123')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content } = await request.json();
        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const sql = neon(process.env.DATABASE_URL!);

        // Update donation with reply
        const data = await sql`
      UPDATE donations 
      SET reply_content = ${content}, reply_at = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `;

        if (!data.length) {
            return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
        }

        return NextResponse.json({
            donation: {
                ...data[0],
                amount: Number(data[0].amount)
            }
        });
    } catch (error) {
        console.error('Reply error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
