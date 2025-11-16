import { NextResponse } from 'next/server';
import { getDonations, getStats } from '@/lib/db';

export async function GET() {
  try {
    const donations = await getDonations();
    const stats = await getStats();

    const confirmedDonations = donations.filter(d => d.status === 'confirmed');
    const pendingDonations = donations.filter(d => d.status === 'pending');

    // Payment method breakdown
    const paymentMethodStats = donations.reduce((acc, d) => {
      if (!acc[d.payment_method]) {
        acc[d.payment_method] = { count: 0, amount: 0 };
      }
      acc[d.payment_method].count++;
      if (d.status === 'confirmed') {
        acc[d.payment_method].amount += d.amount;
      }
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentDonations = confirmedDonations.filter(
      d => new Date(d.created_at) > sevenDaysAgo
    );

    const topDonors = confirmedDonations
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      analytics: {
        summary: {
          total_donors: stats.total_count,
          confirmed_donors: stats.confirmed_count,
          pending_donations: pendingDonations.length,
          total_amount: parseFloat(stats.total_amount || '0'),
          confirmed_amount: parseFloat(stats.confirmed_total || '0'),
          pending_amount: (parseFloat(stats.total_amount || '0') - parseFloat(stats.confirmed_total || '0')),
          average_donation: parseFloat(stats.avg_amount || '0')
        },
        payment_methods: paymentMethodStats,
        recent_trends: {
          last_7_days: {
            count: recentDonations.length,
            total: recentDonations.reduce((sum, d) => sum + d.amount, 0)
          }
        },
        top_donors: topDonors.map(d => ({
          name: d.user_name,
          amount: d.amount,
          date: d.created_at
        }))
      }
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
