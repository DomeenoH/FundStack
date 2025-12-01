import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getDonations } from '@/lib/db';
import { mergeDonors, Donation } from '@/lib/donor-utils';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Case 1: Numeric ID - fetch single donation
        if (/^\d+$/.test(id)) {
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

            // Check for admin authentication
            const authHeader = request.headers.get('authorization');
            let isAdmin = false;

            if (authHeader) {
                try {
                    const token = authHeader.split(' ')[1];
                    if (token) {
                        const decoded = Buffer.from(token, 'base64').toString('utf-8');
                        const [username, password] = decoded.split(':');
                        if (username === 'admin' && password === (process.env.ADMIN_PASSWORD || 'admin123')) {
                            isAdmin = true;
                        }
                    }
                } catch (e) {
                    // Ignore invalid token
                }
            }

            return NextResponse.json({
                success: true,
                donation: {
                    ...data[0],
                    amount: Number(data[0].amount)
                },
                is_admin: isAdmin
            });
        }

        // Case 2: String ID - fetch donor profile
        const rawDonations = await getDonations();
        const donations: Donation[] = rawDonations.map(d => ({
            id: d.id,
            user_name: d.user_name,
            user_email: d.user_email,
            user_url: d.user_url,
            user_message: d.user_message,
            amount: Number(d.amount || 0),
            payment_method: d.payment_method,
            status: d.status || 'pending',
            created_at: d.created_at
        }));

        const validDonations = donations.filter(d => d.status !== 'rejected');
        const mergedDonors = mergeDonors(validDonations);

        // Decode the ID for comparison
        const decodedId = decodeURIComponent(id);

        // Find donor by ID (merged-xxx) or by user_name
        const donor = mergedDonors.find(d =>
            d.id === decodedId ||
            d.user_name === decodedId ||
            d.user_name.toLowerCase() === decodedId.toLowerCase()
        );

        if (!donor) {
            console.error('[API] Donor not found. Searched for:', decodedId);
            console.error('[API] Available donors:', mergedDonors.map(d => d.id));
            return NextResponse.json(
                { success: false, error: 'Donor not found' },
                { status: 404 }
            );
        }

        const history = donor.donations.map(d => ({
            id: d.id,
            user_name: d.user_name,
            user_url: d.user_url,
            amount: d.amount,
            payment_method: d.payment_method,
            user_message: d.user_message,
            created_at:
                d.created_at instanceof Date
                    ? d.created_at.toISOString()
                    : d.created_at?.toString() || '',
            status: d.status,
            reply_content: d.reply_content,
            reply_at: d.reply_at
        }));

        return NextResponse.json({
            success: true,
            donor: {
                id: donor.id,
                user_name: donor.user_name,
                user_email: donor.user_email,
                user_url: donor.user_url,
                total_amount: donor.total_amount,
                donation_count: donor.donation_count,
                last_donation_at: donor.last_donation_at
            },
            history: history
        });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}
