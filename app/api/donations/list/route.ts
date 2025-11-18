import { NextRequest, NextResponse } from 'next/server';
import { getDonations } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const donations = await getDonations();

    const publicDonations = donations
      .filter(d => d.status !== 'rejected')
      .map(d => ({
        id: d.id,
        user_name: d.user_name,
        user_url: d.user_url,
        amount: Number(d.amount || 0),
        payment_method: d.payment_method,
        user_message: d.user_message,
        created_at:
          d.created_at instanceof Date
            ? d.created_at.toISOString()
            : d.created_at?.toString() || '',
        status: d.status || 'pending'
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
