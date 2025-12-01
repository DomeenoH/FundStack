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

    if (!emailConfig?.enabled) {
      console.log('Email disabled in config');
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure, // true for 465, false for other ports
      auth: {
        user: emailConfig.auth_user,
        pass: emailConfig.auth_pass,
      },
    });

    await transporter.sendMail({
      from: `"${emailConfig.from_name}" <${emailConfig.from_email}>`,
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
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
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
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
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
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
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
