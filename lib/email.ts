export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    const emailProvider = process.env.EMAIL_PROVIDER || 'resend';
    const apiKey = process.env.EMAIL_API_KEY;
    let from = process.env.EMAIL_FROM || 'noreply@example.com';

    console.log('[Hexo-Donate] Attempting email with provider:', emailProvider, 'from:', from);

    if (emailProvider === 'resend' && apiKey) {
      const domain = from.split('@')[1];
      console.log('[Hexo-Donate] Resend domain check - domain:', domain, 'from:', from);

      // Resend integration
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from,
          to,
          subject,
          html
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.warn('[Hexo-Donate] Resend API failed:', error.message);
        console.warn('[Hexo-Donate] Please verify your email domain at https://resend.com/domains');
        return false;
      }
      return true;
    } else if (emailProvider === 'sendgrid' && apiKey) {
      // SendGrid integration
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: from },
          subject,
          content: [{ type: 'text/html', value: html }]
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('SendGrid API error:', error);
        return false;
      }
      return true;
    } else {
      console.log(`[Email Fallback] To: ${to}, Subject: ${subject}`);
      return true;
    }
  } catch (error) {
    console.error('Email send failed:', error);
    return false;
  }
}

export async function sendDonationNotification(
  adminEmail: string,
  donationData: any
): Promise<boolean> {
  try {
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: adminEmail,
        subject: `New Donation: ${donationData.user_name} - ¥${donationData.amount}`,
        template: 'donation-notification',
        data: donationData
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export async function sendDonationConfirmation(
  userEmail: string,
  donationData: any
): Promise<boolean> {
  try {
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: userEmail,
        subject: 'Donation Received - Thank You!',
        template: 'donation-confirmation',
        data: donationData
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}
