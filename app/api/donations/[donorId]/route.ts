import { NextRequest, NextResponse } from 'next/server';
import { getDonations } from '@/lib/db';
import { mergeDonors, Donation } from '@/lib/donor-utils';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ donorId: string }> }
) {
    try {
        const { donorId } = await params;
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

        const donor = mergedDonors.find(d => d.id === donorId);

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
        console.error('Donor details fetch error:', error);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}
