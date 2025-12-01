// Enhanced email service with template support
import { sendDonationNotification, sendDonationConfirmation } from './email';

export interface EmailConfig {
  provider: 'resend' | 'sendgrid' | 'smtp';
  apiKey?: string;
  from: string;
}

export class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  async sendDonationAlert(donation: any): Promise<boolean> {
    try {
      if (process.env.ADMIN_EMAIL) {
        await sendDonationNotification(process.env.ADMIN_EMAIL, donation);
      }

      if (donation.user_email) {
        await sendDonationConfirmation(donation.user_email, donation);
      }

      return true;
    } catch (error) {
      console.error('Failed to send donation alerts:', error);
      return false;
    }
  }

  async sendConfirmationNotification(donation: any): Promise<boolean> {
    try {
      if (donation.user_email) {
        let baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        if (!baseUrl.startsWith('http')) {
          baseUrl = `https://${baseUrl}`;
        }
        const response = await fetch(`${baseUrl}/api/email/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: donation.user_email,
            subject: 'Your Donation Has Been Confirmed!',
            template: 'donation-confirmed',
            data: donation
          })
        });
        return response.ok;
      }
      return false;
    } catch (error) {
      console.error('Failed to send confirmation:', error);
      return false;
    }
  }

  async sendBulkNotification(donors: any[], message: string): Promise<boolean> {
    try {
      const promises = donors
        .filter(d => d.user_email)
        .map(d => {
          let baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
          if (!baseUrl.startsWith('http')) {
            baseUrl = `https://${baseUrl}`;
          }
          return fetch(`${baseUrl}/api/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: d.user_email,
              subject: 'Special Message from Our Team',
              template: 'bulk-message',
              data: { donor: d, message }
            })
          });
        });

      const results = await Promise.all(promises);
      return results.every(r => r.ok);
    } catch (error) {
      console.error('Failed to send bulk notification:', error);
      return false;
    }
  }
}

export const emailService = new EmailService({
  provider: (process.env.EMAIL_PROVIDER as any) || 'resend',
  apiKey: process.env.EMAIL_API_KEY,
  from: process.env.EMAIL_FROM || 'noreply@example.com'
});
