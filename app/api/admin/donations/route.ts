import { NextRequest, NextResponse } from 'next/server';
import { getDonations, confirmDonation, rejectDonation } from '@/lib/db';
import { verifyAdminAuth } from '../auth';

export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const donations = await getDonations();
    const normalized = donations.map(donation => ({
      ...donation,
      amount: Number(donation.amount || 0),
    }));

    return NextResponse.json({ success: true, donations: normalized });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    const donation = await confirmDonation(id);
    return NextResponse.json({ success: true, donation });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    const data = await rejectDonation(id);
    return NextResponse.json({ success: true, donation: data });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
