import { NextRequest, NextResponse } from 'next/server';
import { createDonation, checkRateLimit, getStats, getConfirmedDonations } from '@/lib/db';
import { donationSchema } from '@/lib/validation';
import { sendDonationNotification } from '@/lib/email';

const RATE_LIMIT_PER_24H = 15;
const RATE_LIMIT_ENABLED = process.env.RATE_LIMIT_ENABLED !== 'false';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const clientIp = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    const validation = donationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.errors.map(e => e.message) },
        { status: 400 }
      );
    }

    const data = validation.data;

    if (RATE_LIMIT_ENABLED) {
      const count = await checkRateLimit(clientIp);
      if (count >= RATE_LIMIT_PER_24H) {
        return NextResponse.json(
          { success: false, error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }

    const donation = await createDonation({
      ...data,
      user_ip: clientIp,
      user_agent: userAgent
    });

    if (process.env.ADMIN_EMAIL && data.user_email) {
      sendDonationNotification(process.env.ADMIN_EMAIL, donation).catch((error) => {
        console.warn('Email notification failed (non-blocking):', error);
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for your donation! The admin will confirm it soon.',
      donation: {
        id: donation.id,
        amount: donation.amount,
        created_at: donation.created_at
      }
    });
  } catch (error) {
    console.error('Donation creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const [confirmedDonations, rawStats] = await Promise.all([
      getConfirmedDonations(),
      getStats(),
    ]);

    const totalAmount = confirmedDonations.reduce(
      (sum, d) => sum + Number(d.amount || 0),
      0
    );
    const averageDonation = confirmedDonations.length > 0 ? totalAmount / confirmedDonations.length : 0;
    const stats = {
      total_donors: Number(rawStats.total_count || 0),
      confirmed_count: Number(rawStats.confirmed_count || 0),
      total_amount: Number(rawStats.total_amount || 0),
      confirmed_amount: Number(rawStats.confirmed_total || 0),
      average_donation: Number(rawStats.avg_amount || 0),
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
