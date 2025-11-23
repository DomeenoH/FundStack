import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getDonations } from '@/lib/db';
import { mergeDonors, Donation } from '@/lib/donor-utils';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

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

            return NextResponse.json({
                success: true,
                donation: {
                    ...data[0],
                    amount: Number(data[0].amount)
                }
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
            status: d.status
        }));

        return NextResponse.json({
            success: true,
            donor: {
                id: donor.id,
                user_name: donor.user_name,
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
