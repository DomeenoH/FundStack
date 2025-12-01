import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { getConfig } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, template, data } = body;

    const config = await getConfig();
    const emailConfig = config.email_config;

    if (!emailConfig?.enabled) {
      return NextResponse.json({ success: false, error: 'Email disabled' });
    }

    // @ts-ignore
    const templateConfig = emailConfig.templates?.[template];

    if (!templateConfig || !templateConfig.enabled) {
      return NextResponse.json({ success: false, error: 'Template disabled or not found' });
    }

    // Variable substitution
    let subject = templateConfig.subject;
    let html = templateConfig.body;

    // Merge config variables
    const substitutionData = {
      ...data,
      creator_name: config.creator_name
    };

    Object.keys(substitutionData).forEach(key => {
      const value = substitutionData[key];
      const regex = new RegExp(`{${key}}`, 'g');
      subject = subject.replace(regex, String(value));
      html = html.replace(regex, String(value));
    });

    const emailSent = await sendEmail(to, subject, html, config);

    return NextResponse.json({
      success: true,
      email_sent: emailSent
    });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
