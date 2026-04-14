import { NextResponse } from 'next/server';
import { getDonations } from '@/lib/db';
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  differenceInCalendarYears,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns';
import { mergeDonors, Donation } from '@/lib/donor-utils';

export type AnalyticsRange = '7d' | '30d' | '90d' | '1y' | 'all';

const RANGE_LABELS: Record<AnalyticsRange, string> = {
  '7d': '近7天',
  '30d': '近30天',
  '90d': '近90天',
  '1y': '近1年',
  all: '全部时间',
};

const WEEK_OPTIONS = { weekStartsOn: 1 as const };

const isAnalyticsRange = (value: string | null | undefined): value is AnalyticsRange =>
  value === '7d' ||
  value === '30d' ||
  value === '90d' ||
  value === '1y' ||
  value === 'all';

export function normalizeAnalyticsRange(value: string | null | undefined): AnalyticsRange {
  return isAnalyticsRange(value) ? value : 'all';
}

function getRangeStart(range: AnalyticsRange, now: Date): Date | null {
  switch (range) {
    case '7d':
      return startOfDay(subDays(now, 6));
    case '30d':
      return startOfDay(subDays(now, 29));
    case '90d':
      return startOfDay(subDays(now, 89));
    case '1y':
      return startOfDay(subYears(now, 1));
    case 'all':
    default:
      return null;
  }
}

function normalizeDonations(donations: Donation[]): Donation[] {
  return donations.map((donation) => ({
    ...donation,
    amount: Number(donation.amount || 0),
  }));
}

function filterDonationsByRange(donations: Donation[], rangeStart: Date | null): Donation[] {
  if (!rangeStart) {
    return donations;
  }

  return donations.filter((donation) => new Date(donation.created_at) >= rangeStart);
}

function buildPaymentMethodStats(donations: Donation[]) {
  return donations.reduce((acc, donation) => {
    if (!acc[donation.payment_method]) {
      acc[donation.payment_method] = { count: 0, amount: 0 };
    }

    acc[donation.payment_method].count += 1;
    acc[donation.payment_method].amount += Number(donation.amount || 0);
    return acc;
  }, {} as Record<string, { count: number; amount: number }>);
}

function buildDailyTrends(donations: Donation[], now: Date, rangeStart: Date | null) {
  const naturalStart = startOfDay(subDays(now, 29));
  const seriesStart =
    rangeStart && rangeStart > naturalStart ? startOfDay(rangeStart) : naturalStart;
  const currentDay = startOfDay(now);
  const totalPoints = Math.max(1, differenceInCalendarDays(currentDay, seriesStart) + 1);

  return Array.from({ length: totalPoints }).map((_, index) => {
    const dayStart = addDays(seriesStart, index);
    const nextDayStart = addDays(dayStart, 1);
    const periodDonations = donations.filter((donation) => {
      const donationDate = new Date(donation.created_at);
      return donationDate >= dayStart && donationDate < nextDayStart;
    });

    return {
      date: format(dayStart, 'MM-dd'),
      amount: periodDonations.reduce((sum, donation) => sum + Number(donation.amount || 0), 0),
      count: periodDonations.length,
    };
  });
}

function buildWeeklyTrends(donations: Donation[], now: Date, rangeStart: Date | null) {
  const naturalStart = startOfWeek(subWeeks(now, 11), WEEK_OPTIONS);
  const rangeAlignedStart = rangeStart ? startOfWeek(rangeStart, WEEK_OPTIONS) : naturalStart;
  const seriesStart = rangeAlignedStart > naturalStart ? rangeAlignedStart : naturalStart;
  const currentWeek = startOfWeek(now, WEEK_OPTIONS);
  const totalPoints = Math.max(
    1,
    differenceInCalendarWeeks(currentWeek, seriesStart, WEEK_OPTIONS) + 1,
  );

  return Array.from({ length: totalPoints }).map((_, index) => {
    const weekStart = addWeeks(seriesStart, index);
    const nextWeekStart = addWeeks(weekStart, 1);
    const periodDonations = donations.filter((donation) => {
      const donationDate = new Date(donation.created_at);
      return donationDate >= weekStart && donationDate < nextWeekStart;
    });

    return {
      date: format(weekStart, 'MM-dd'),
      amount: periodDonations.reduce((sum, donation) => sum + Number(donation.amount || 0), 0),
      count: periodDonations.length,
    };
  });
}

function buildMonthlyTrends(donations: Donation[], now: Date, rangeStart: Date | null) {
  const naturalStart = startOfMonth(subMonths(now, 11));
  const rangeAlignedStart = rangeStart ? startOfMonth(rangeStart) : naturalStart;
  const seriesStart = rangeAlignedStart > naturalStart ? rangeAlignedStart : naturalStart;
  const currentMonth = startOfMonth(now);
  const totalPoints = Math.max(1, differenceInCalendarMonths(currentMonth, seriesStart) + 1);

  return Array.from({ length: totalPoints }).map((_, index) => {
    const monthStart = addMonths(seriesStart, index);
    const nextMonthStart = addMonths(monthStart, 1);
    const periodDonations = donations.filter((donation) => {
      const donationDate = new Date(donation.created_at);
      return donationDate >= monthStart && donationDate < nextMonthStart;
    });

    return {
      date: format(monthStart, 'yyyy-MM'),
      amount: periodDonations.reduce((sum, donation) => sum + Number(donation.amount || 0), 0),
      count: periodDonations.length,
    };
  });
}

function buildYearlyTrends(donations: Donation[], now: Date, rangeStart: Date | null) {
  const naturalStart = startOfYear(subYears(now, 4));
  const rangeAlignedStart = rangeStart ? startOfYear(rangeStart) : naturalStart;
  const seriesStart = rangeAlignedStart > naturalStart ? rangeAlignedStart : naturalStart;
  const currentYear = startOfYear(now);
  const totalPoints = Math.max(1, differenceInCalendarYears(currentYear, seriesStart) + 1);

  return Array.from({ length: totalPoints }).map((_, index) => {
    const yearStart = addYears(seriesStart, index);
    const nextYearStart = addYears(yearStart, 1);
    const periodDonations = donations.filter((donation) => {
      const donationDate = new Date(donation.created_at);
      return donationDate >= yearStart && donationDate < nextYearStart;
    });

    return {
      date: format(yearStart, 'yyyy'),
      amount: periodDonations.reduce((sum, donation) => sum + Number(donation.amount || 0), 0),
      count: periodDonations.length,
    };
  });
}

export function buildAnalyticsFromDonations(
  donations: Donation[],
  options: { range?: AnalyticsRange; now?: Date } = {},
) {
  const now = options.now ? new Date(options.now) : new Date();
  const range = normalizeAnalyticsRange(options.range);
  const rangeStart = getRangeStart(range, now);
  const normalizedDonations = normalizeDonations(donations);
  const rangeDonations = filterDonationsByRange(normalizedDonations, rangeStart);

  const confirmedDonations = rangeDonations.filter((donation) => donation.status === 'confirmed');
  const pendingDonations = rangeDonations.filter((donation) => donation.status === 'pending');
  const nonRejectedDonations = rangeDonations.filter((donation) => donation.status !== 'rejected');

  const mergedConfirmedDonors = mergeDonors(confirmedDonations);
  const mergedAllDonors = mergeDonors(nonRejectedDonations);
  const paymentMethodStats = buildPaymentMethodStats(confirmedDonations);

  const confirmedAmount = confirmedDonations.reduce(
    (sum, donation) => sum + Number(donation.amount || 0),
    0,
  );
  const totalAmount = nonRejectedDonations.reduce(
    (sum, donation) => sum + Number(donation.amount || 0),
    0,
  );

  const topDonors = mergedConfirmedDonors
    .sort((a, b) => b.total_amount - a.total_amount)
    .slice(0, 10)
    .map((donor) => ({
      name: donor.user_name,
      amount: donor.total_amount,
      date: donor.last_donation_at,
    }));

  return {
    range: {
      key: range,
      label: RANGE_LABELS[range],
    },
    summary: {
      total_donors: mergedAllDonors.length,
      confirmed_donors: mergedConfirmedDonors.length,
      pending_donations: pendingDonations.length,
      total_amount: totalAmount,
      confirmed_amount: confirmedAmount,
      pending_amount: totalAmount - confirmedAmount,
      average_donation: confirmedDonations.length > 0 ? confirmedAmount / confirmedDonations.length : 0,
    },
    payment_methods: paymentMethodStats,
    recent_trends: {
      selected_range: {
        label: RANGE_LABELS[range],
        count: confirmedDonations.length,
        total: confirmedAmount,
      },
    },
    trends: {
      daily: buildDailyTrends(confirmedDonations, now, rangeStart),
      weekly: buildWeeklyTrends(confirmedDonations, now, rangeStart),
      monthly: buildMonthlyTrends(confirmedDonations, now, rangeStart),
      yearly: buildYearlyTrends(confirmedDonations, now, rangeStart),
    },
    top_donors: topDonors,
  };
}

export async function GET(request: Request) {
  try {
    const rawDonations = await getDonations();
    const searchParams = new URL(request.url).searchParams;
    const range = normalizeAnalyticsRange(searchParams.get('range'));

    const normalizedDonations: Donation[] = rawDonations.map((donation) => ({
      id: donation.id,
      user_name: donation.user_name,
      user_email: donation.user_email,
      user_url: donation.user_url,
      user_message: donation.user_message,
      payment_method: donation.payment_method,
      status: donation.status,
      created_at: donation.created_at,
      amount: Number(donation.amount || 0),
    }));

    return NextResponse.json({
      success: true,
      analytics: buildAnalyticsFromDonations(normalizedDonations, { range }),
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 },
    );
  }
}
