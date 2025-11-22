import { NextRequest, NextResponse } from 'next/server';
import { getDonations } from '@/lib/db';
import { mergeDonors, Donation } from '@/lib/donor-utils';

export async function GET(request: NextRequest) {
  try {
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

    // Filter confirmed/pending for public list (usually we show all non-rejected)
    const validDonations = donations.filter(d => d.status !== 'rejected');

    // Merge donors
    const mergedDonors = mergeDonors(validDonations);

    const publicDonations = mergedDonors.map(d => ({
      id: d.id, // This is now a string like "merged-123"
      user_name: d.user_name,
      user_url: d.user_url,
      amount: d.total_amount,
      payment_method: d.donations[0].payment_method, // Use latest payment method
      user_message: d.donations[0].user_message, // Use latest message
      created_at: d.last_donation_at,
      status: d.donations[0].status, // Use latest status
      donation_count: d.donation_count
    }));

    return NextResponse.json({
      success: true,
      donations: publicDonations
    });
  } catch (error) {
    console.error('List fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
