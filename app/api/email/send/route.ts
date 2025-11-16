import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email'; // Assuming a function to send emails is defined in a separate file

// Email templates
const templates: Record<string, (data: any) => { subject: string; html: string }> = {
  'donation-notification': (data: any) => {
    // Ensure amount conversion to number
    const amount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;
    return {
      subject: `New Donation Received: ${data.user_name} - ¥${amount.toFixed(2)}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
              .field { margin: 15px 0; }
              .label { font-weight: bold; color: #667eea; }
              .value { margin-top: 5px; padding: 10px; background: white; border-left: 3px solid #667eea; }
              .action-btn { display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>New Donation Received!</h2>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">Donor Name:</div>
                  <div class="value">${data.user_name}</div>
                </div>
                <div class="field">
                  <div class="label">Amount:</div>
                  <div class="value" style="font-size: 24px; color: #667eea;">¥${amount.toFixed(2)}</div>
                </div>
                <div class="field">
                  <div class="label">Payment Method:</div>
                  <div class="value">${data.payment_method}</div>
                </div>
                <div class="field">
                  <div class="label">Email:</div>
                  <div class="value">${data.user_email || 'Not provided'}</div>
                </div>
                <div class="field">
                  <div class="label">Website:</div>
                  <div class="value">${data.user_url || 'Not provided'}</div>
                </div>
                <div class="field">
                  <div class="label">Message:</div>
                  <div class="value">${data.user_message || 'No message provided'}</div>
                </div>
                <div class="field">
                  <div class="label">IP Address:</div>
                  <div class="value">${data.user_ip}</div>
                </div>
                <a href="${process.env.NEXT_PUBLIC_ADMIN_URL || 'https://example.com/admin'}" class="action-btn">Review in Admin Panel</a>
                <div class="footer">
                  <p>This is an automated notification. Please do not reply to this email.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `
    };
  },
  'donation-confirmation': (data: any) => {
    // Ensure amount conversion to number
    const amount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;
    return {
      subject: 'Thank You for Your Donation!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
              .highlight { background: #e8f4f8; border-left: 3px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 5px; }
              .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>Thank You for Your Support!</h2>
              </div>
              <div class="content">
                <p>Dear ${data.user_name},</p>
                <p>We are grateful for your generous donation of <strong>¥${amount.toFixed(2)}</strong>!</p>
                <div class="highlight">
                  <p>Your donation is currently under review and will be confirmed shortly. You'll receive another email once it's confirmed, and your name will appear on our donors list.</p>
                </div>
                <p>Your support helps us:</p>
                <ul>
                  <li>Continue creating quality content</li>
                  <li>Maintain and improve our services</li>
                  <li>Support our community</li>
                  <li>Develop new features and improvements</li>
                </ul>
                <p>Thank you for believing in us!</p>
                <p>Best regards,<br/>Our Team</p>
                <div class="footer">
                  <p>This is an automated email. Please do not reply to this message.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `
    };
  },
  'donation-confirmed': (data: any) => {
    // Ensure amount conversion to number
    const amount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;
    return {
      subject: 'Your Donation Has Been Confirmed!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
              .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
              .success-badge { display: inline-block; background: #38ef7d; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
              .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>Donation Confirmed!</h2>
                <div class="success-badge">✓ Your donation has been verified</div>
              </div>
              <div class="content">
                <p>Dear ${data.user_name},</p>
                <p>Great news! Your donation of <strong>¥${amount.toFixed(2)}</strong> has been confirmed and verified.</p>
                <p>Your name and donation information are now displayed on our donors list. Thank you for your generous support!</p>
                <p>Check out the donors list: <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'}/list">View all donors</a></p>
                <div class="footer">
                  <p>This is an automated email. Please do not reply to this message.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `
    };
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, template, data } = body;

    if (!templates[template as keyof typeof templates]) {
      return NextResponse.json(
        { error: 'Invalid template' },
        { status: 400 }
      );
    }

    const emailContent = templates[template as keyof typeof templates](data);

    const emailSent = await sendEmail(to, emailContent.subject, emailContent.html);
    
    if (!emailSent) {
      console.warn(`Email failed to ${to} but operation continues`);
    }

    return NextResponse.json({ 
      success: true,
      email_sent: emailSent,
      ...(process.env.EMAIL_PROVIDER === 'resend' && !emailSent
        ? { warning: 'Verify your Resend domain at https://resend.com/domains to enable email notifications' }
        : {}
      )
    });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { 
        success: true, 
        email_sent: false, 
        warning: 'Email delivery failed but donation was processed successfully'
      },
      { status: 200 }
    );
  }
}
