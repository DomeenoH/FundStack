import { NextRequest, NextResponse } from 'next/server';
import { getDonations } from '@/lib/db';
import { mergeDonors, Donation } from '@/lib/donor-utils';
import { neon } from '@neondatabase/serverless';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // Check if id is numeric -> Single Donation Detail
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

        // Otherwise -> Donor Profile (Existing Logic)
        const rawDonations = await getDonations();

        // Convert DB result to Donation interface
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

        // Find donor by name (id)
        // Note: mergeDonors uses user_name as ID if not provided, but here 'id' param is the user_name
        const donor = mergedDonors.find(d => d.user_name === decodeURIComponent(id) || d.id === id);

        if (!donor) {
            return NextResponse.json(
                { success: false, error: 'Donor not found' },
                { status: 404 }
            );
        }

        // Return the original donations for this donor
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
            reply_content: (d as any).reply_content, // Include reply info if available in source
            reply_at: (d as any).reply_at
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
