# FundStack - Complete Setup Guide

## Prerequisites

- Node.js 18+ 
- PostgreSQL database (or Neon)
- pnpm package manager

## Step-by-Step Installation

### 1. Environment Variables Setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure the following variables:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/database

# Admin Settings
ADMIN_PASSWORD=choose_a_strong_password_here
ADMIN_EMAIL=your-email@example.com

# Email Configuration (optional)
EMAIL_PROVIDER=resend
EMAIL_API_KEY=your_email_api_key
EMAIL_FROM=noreply@yourdomain.com

# Site URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3000/admin

# Rate Limiting
RATE_LIMIT_ENABLED=true
```

### 2. Database Setup

Execute the SQL migration script to create tables:

**Option A: Using Neon Dashboard**
1. Go to Neon console
2. Open SQL Editor
3. Copy and paste content from `scripts/init-database.sql`
4. Execute the script

**Option B: Using Command Line**
1. Install PostgreSQL client or use your database provider's CLI
2. Execute: `psql $DATABASE_URL -f scripts/init-database.sql`

### 3. Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit `http://localhost:3000` in your browser.

## First Time Setup

1. **Access the donation form** at `http://localhost:3000`
2. **Admin panel** at `http://localhost:3000/admin`
   - Username: `admin`
   - Password: Use the ADMIN_PASSWORD from .env.local
3. **View donations list** at `http://localhost:3000/list`
4. **Analytics** at `http://localhost:3000/analytics`

## Configuration

### Payment Methods

Supported payment methods in the form:
- WeChat Pay
- Alipay
- QQ Pay
- Other

### Email Notifications

To enable automatic emails:

1. **Resend (Recommended)**
   - Sign up at https://resend.com
   - Get API key
   - Set `EMAIL_PROVIDER=resend` and `EMAIL_API_KEY=your_key`

2. **SendGrid**
   - Sign up at https://sendgrid.com
   - Get API key
   - Set `EMAIL_PROVIDER=sendgrid` and `EMAIL_API_KEY=your_key`

3. **Development Mode**
   - Leave `EMAIL_API_KEY` empty
   - Emails will be logged to console

### Rate Limiting

- Adjust `RATE_LIMIT_PER_24H` to control max donations per IP per day
- Set `RATE_LIMIT_ENABLED=false` to disable

## Advanced Configuration

### CAPTCHA Verification

To prevent spam, you can enable CAPTCHA verification in the admin panel.
1. Visit `http://localhost:3000/admin/config`
2. Find "Donation Form Configuration"
3. Enable "Enable CAPTCHA"

### Email Template Preview

You can preview email templates in real-time in the admin panel:
1. Visit `http://localhost:3000/admin/config`
2. In the "Email Configuration" section, click the "Preview Template" button

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

```bash
pnpm build
pnpm start
```

## Troubleshooting

### Database Connection Error
- Verify DATABASE_URL is correct
- Check database credentials
- Ensure your IP is whitelisted (for Neon)

### Admin Login Failed
- Verify ADMIN_PASSWORD matches
- Check for typos or special characters
- Try resetting in .env.local

### Emails Not Sending
- Check EMAIL_API_KEY is valid
- Verify EMAIL_FROM is correct format
- Check spam/junk folder
- View console logs for error messages

### Port Already in Use
```bash
# Use different port
pnpm dev -- -p 3001
```

## API Documentation

### Submit Donation

\`\`\`
POST /api/donations
Content-Type: application/json

{
  "user_name": "John Doe",
  "user_email": "john@example.com",
  "user_url": "https://example.com",
  "user_message": "Keep up the good work!",
  "amount": 50.00,
  "payment_method": "alipay"
}
\`\`\`

### Get Donation Stats

\`\`\`
GET /api/donations

Response:
{
  "success": true,
  "stats": {
    "total_donors": 10,
    "total_amount": 500.00,
    "confirmed_amount": 450.00,
    "confirmed_count": 9,
    "average_donation": 50.00
  }
}
\`\`\`

### Get Public Donation List

\`\`\`
GET /api/donations/list

Response:
{
  "success": true,
  "donations": [
    {
      "id": 1,
      "user_name": "John Doe",
      "amount": 50.00,
      "payment_method": "alipay",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
\`\`\`

## Security Best Practices

1. Never commit `.env.local` to version control
2. Use strong ADMIN_PASSWORD (20+ characters)
3. Enable HTTPS in production
4. Regularly update dependencies: `pnpm audit`
5. Review rate limit settings
6. Backup database regularly
7. Use environment-specific credentials

## Performance Tips

- Enable database query indexes (done by default)
- Use rate limiting to prevent abuse
- Cache donation list responses
- Optimize images in email templates
- Monitor database connections

## Getting Help

- Check the README_EN.md for feature overview
- Review error messages in browser console
- Check server logs for API errors
- Open issue on GitHub repository

## Next Steps

1. Customize email templates in `app/api/email/send/route.ts`
2. Modify donation form styling in `components/donation-form.tsx`
3. Add more payment methods in `lib/validation.ts`
4. Implement webhook integration for automatic payment confirmation
5. Add two-factor authentication for admin panel
