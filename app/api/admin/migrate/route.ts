import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const sql = neon(process.env.DATABASE_URL!);

        // Add reply_content column if it doesn't exist
        await sql`
      ALTER TABLE donations 
      ADD COLUMN IF NOT EXISTS reply_content TEXT,
      ADD COLUMN IF NOT EXISTS reply_at TIMESTAMP WITH TIME ZONE;
    `;

        return NextResponse.json({ success: true, message: 'Migration completed successfully' });
    } catch (error) {
        console.error('Migration failed:', error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
