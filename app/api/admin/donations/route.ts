import { NextRequest, NextResponse } from 'next/server';
import { getDonations, confirmDonation, rejectDonation, updateDonationStatus, updateDonation } from '@/lib/db';
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

export async function PATCH(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, action } = body;

    // 更新状态
    if (action === 'update_status' || !action) {
      const { status } = body;
      if (!['pending', 'confirmed', 'rejected'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      const donation = await updateDonationStatus(id, status);
      return NextResponse.json({ success: true, donation });
    }

    // 更新投喂者信息
    if (action === 'update_info') {
      const { user_name, user_email, user_url } = body;
      const donation = await updateDonation(id, {
        user_name,
        user_email,
        user_url
      });
      return NextResponse.json({ success: true, donation });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[投喂小站] PATCH error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
