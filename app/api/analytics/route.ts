import { NextResponse } from 'next/server';
import { getDonations, getStats } from '@/lib/db';
import { subDays, subWeeks, subMonths, startOfDay, startOfWeek, startOfMonth, format } from 'date-fns';

export async function GET() {
  try {
    const donations = await getDonations();
    const stats = await getStats();

    const normalizedDonations = donations.map(donation => ({
      ...donation,
      amount: Number(donation.amount || 0),
    })) as Array<{
      id: number;
      user_name: string;
      user_url?: string;
      user_email?: string;
      payment_method: string;
      status: string;
      created_at: string;
      amount: number;
    }>;

    const confirmedDonations = normalizedDonations.filter(d => d.status === 'confirmed');
    const pendingDonations = normalizedDonations.filter(d => d.status === 'pending');

    // Payment method breakdown - FIX: Only count confirmed
    const paymentMethodStats = confirmedDonations.reduce((acc, d) => {
      if (!acc[d.payment_method]) {
        acc[d.payment_method] = { count: 0, amount: 0 };
      }
      acc[d.payment_method].count++;
      acc[d.payment_method].amount += d.amount;
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

    // Trends Calculation
    const now = new Date();

    // Daily Trends (Last 30 days)
    const dailyTrends = Array.from({ length: 30 }).map((_, i) => {
      const date = subDays(now, 29 - i);
      const dayStart = startOfDay(date);
      const nextDayStart = startOfDay(subDays(date, -1));
      const label = format(date, 'MM-dd');

      const periodDonations = confirmedDonations.filter(d => {
        const dDate = new Date(d.created_at);
        return dDate >= dayStart && dDate < nextDayStart;
      });

      return {
        date: label,
        amount: periodDonations.reduce((sum, d) => sum + d.amount, 0),
        count: periodDonations.length
      };
    });

    // Weekly Trends (Last 12 weeks)
    const weeklyTrends = Array.from({ length: 12 }).map((_, i) => {
      const date = subWeeks(now, 11 - i);
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const nextWeekStart = startOfWeek(subWeeks(date, -1), { weekStartsOn: 1 });
      const label = format(weekStart, 'MM-dd');

      const periodDonations = confirmedDonations.filter(d => {
        const dDate = new Date(d.created_at);
        return dDate >= weekStart && dDate < nextWeekStart;
      });

      return {
        date: label,
        amount: periodDonations.reduce((sum, d) => sum + d.amount, 0),
        count: periodDonations.length
      };
    });

    // Monthly Trends (Last 12 months)
    const monthlyTrends = Array.from({ length: 12 }).map((_, i) => {
      const date = subMonths(now, 11 - i);
      const monthStart = startOfMonth(date);
      const nextMonthStart = startOfMonth(subMonths(date, -1));
      const label = format(date, 'yyyy-MM');

      const periodDonations = confirmedDonations.filter(d => {
        const dDate = new Date(d.created_at);
        return dDate >= monthStart && dDate < nextMonthStart;
      });

      return {
        date: label,
        amount: periodDonations.reduce((sum, d) => sum + d.amount, 0),
        count: periodDonations.length
      };
    });

    return NextResponse.json({
      success: true,
      analytics: {
        summary: {
          total_donors: Number(stats.total_count || 0),
          confirmed_donors: Number(stats.confirmed_count || 0),
          pending_donations: pendingDonations.length,
          total_amount: Number(stats.total_amount || 0),
          confirmed_amount: Number(stats.confirmed_total || 0),
          pending_amount: Number(stats.total_amount || 0) - Number(stats.confirmed_total || 0),
          average_donation: Number(stats.avg_amount || 0)
        },
        payment_methods: paymentMethodStats,
        recent_trends: {
          last_7_days: {
            count: recentDonations.length,
            total: recentDonations.reduce((sum, d) => sum + d.amount, 0)
          }
        },
        trends: {
          daily: dailyTrends,
          weekly: weeklyTrends,
          monthly: monthlyTrends
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
