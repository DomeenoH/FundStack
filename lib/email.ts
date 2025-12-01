import nodemailer from 'nodemailer';
import { DEFAULT_CONFIG, SiteConfig } from './config';
import { fetchJson } from './api';

// Helper to get config (server-side only)
async function getConfig(): Promise<SiteConfig> {
  // In a real app, you might fetch this from a database or cache
  // For now, we'll try to fetch from the API if possible, or use defaults
  try {
    const res = await fetch('http://localhost:3000/api/config', { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      return data.config;
    }
  } catch (e) {
    console.warn('Failed to fetch config for email, using defaults');
  }
  return DEFAULT_CONFIG;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  config?: SiteConfig
): Promise<boolean> {
  try {
    const siteConfig = config || await getConfig();
    const emailConfig = siteConfig.email_config;

    async function createTransporter(config: SiteConfig) {
      const emailConfig = config.email_config;
      // If enabled is explicitly false, return null. If undefined, check env vars.
      if (emailConfig?.enabled === false) return null;

      // Determine provider: config > env > default(smtp)
      const provider = emailConfig?.provider || process.env.EMAIL_PROVIDER || 'smtp';

      let transportConfig: any = {};

      if (provider === 'resend') {
        transportConfig = {
          host: 'smtp.resend.com',
          port: 465,
          secure: true,
          auth: {
            user: 'resend',
            pass: emailConfig?.apiKey || process.env.EMAIL_API_KEY || emailConfig?.auth_pass,
          },
        };
      } else if (provider === 'sendgrid') {
        transportConfig = {
          host: 'smtp.sendgrid.net',
          port: 587,
          secure: false,
          auth: {
            user: 'apikey',
            pass: emailConfig?.apiKey || process.env.EMAIL_API_KEY || emailConfig?.auth_pass,
          },
        };
      } else {
        // Default SMTP
        transportConfig = {
          host: emailConfig?.host || process.env.SMTP_HOST,
          port: Number(emailConfig?.port || process.env.SMTP_PORT || 465),
          secure: emailConfig?.secure ?? (process.env.SMTP_SECURE === 'true'),
          auth: {
            user: emailConfig?.auth_user || process.env.SMTP_USER,
            pass: emailConfig?.auth_pass || process.env.SMTP_PASSWORD,
          },
        };
      }

      // If missing critical config, return null
      if (!transportConfig.host || !transportConfig.auth?.pass) {
        console.warn('Email transporter config missing host or password');
        return null;
      }

      return nodemailer.createTransport(transportConfig);
    }
    const transporter = await createTransporter(siteConfig);

    if (!transporter) {
      console.log('Email disabled in config or transporter could not be created.');
      return false;
    }

    await transporter.sendMail({
      from: `"${emailConfig?.from_name}" <${emailConfig?.from_email}>`,
      to,
      subject,
      html,
    });

    return true;
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
    // We use the absolute URL for server-side fetch
    let baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    if (!baseUrl.startsWith('http')) {
      baseUrl = `https://${baseUrl}`;
    }
    const response = await fetch(`${baseUrl}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: adminEmail,
        template: 'donation_notification',
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
    let baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    if (!baseUrl.startsWith('http')) {
      baseUrl = `https://${baseUrl}`;
    }
    const response = await fetch(`${baseUrl}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: userEmail,
        template: 'donation_confirmation',
        data: donationData
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export async function sendDonationReply(
  userEmail: string,
  replyData: any
): Promise<boolean> {
  try {
    let baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    if (!baseUrl.startsWith('http')) {
      baseUrl = `https://${baseUrl}`;
    }
    const response = await fetch(`${baseUrl}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: userEmail,
        template: 'donation_reply',
        data: replyData
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}
