import { NextRequest, NextResponse } from 'next/server';
import { createDonation, checkRateLimit, getStats, getConfirmedDonations } from '@/lib/db';
import { validateDonation } from '@/lib/validation';
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

    const validation = validateDonation(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

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
      ...body,
      user_ip: clientIp,
      user_agent: userAgent
    });

    if (process.env.ADMIN_EMAIL && body.user_email) {
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
    const confirmedDonations = await getConfirmedDonations();
    
    const totalAmount = confirmedDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const averageDonation = confirmedDonations.length > 0 ? totalAmount / confirmedDonations.length : 0;

    return NextResponse.json({
      success: true,
      stats: {
        total_donors: confirmedDonations.length,
        total_amount: totalAmount,
        confirmed_amount: totalAmount,
        confirmed_count: confirmedDonations.length,
        average_donation: averageDonation
      }
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
