# Hexo-Donate v2.0 - Modern Donation System

  [English](README.md) | [简体中文](README_CN.md)

A complete rewrite of the Hexo-Donate project with modern web technologies, security best practices, and an enhanced user experience.

## Features

✨ **Core Features**
- Modern, responsive donation form with real-time validation
- Secure data handling with input sanitization
- Support for multiple payment methods (WeChat, Alipay, QQ)
- Real-time donation statistics and analytics
- Automatic email notifications
- Admin dashboard for managing donations
- Rate limiting to prevent abuse

🔒 **Security**
- TypeScript for type safety
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS security
- Rate limiting per IP address
- Secure admin authentication

🎨 **User Experience**
- Modern, clean UI with Tailwind CSS
- Mobile-responsive design
- Real-time form validation
- Error handling and user feedback
- Loading states and transitions
- Accessible design patterns

📊 **Analytics**
- Real-time donation statistics
- Donor count and total amount tracking
- Payment method breakdown
- Average donation calculation
- Admin dashboard with full donation management

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend:** Next.js API Routes, TypeScript
- **Database:** PostgreSQL (Neon)
- **Email:** Email API Integration (Resend/SendGrid)
- **Deployment:** Vercel

## Setup

### Environment Variables

```env
DATABASE_URL=your_database_url
ADMIN_PASSWORD=your_secure_password
ADMIN_EMAIL=admin@example.com
RATE_LIMIT_ENABLED=true
```

### Database Setup

Run the SQL migration script:

```bash
# Execute scripts/init-database.sql
```

### Installation

```bash
npm install
npm run dev
```

## Project Structure

```
app/
├── page.tsx                 # Main donation page
├── list/page.tsx           # Public donation list
├── admin/page.tsx          # Admin dashboard
└── api/
    ├── donations/
    │   ├── route.ts        # Donation CRUD
    │   └── list/route.ts   # Public donation list
    ├── admin/
    │   ├── auth.ts         # Admin auth
    │   └── donations/route.ts
    └── email/
        └── send/route.ts   # Email sending

components/
├── donation-form.tsx       # Main form component
├── donation-list.tsx       # Donation display
└── admin-stats.tsx        # Statistics display

lib/
├── db.ts                   # Database functions
├── validation.ts           # Form validation
├── email.ts               # Email templates
└── auth.ts                # Admin auth utilities
```

## API Endpoints

### Public Endpoints
- `POST /api/donations` - Submit a new donation
- `GET /api/donations` - Get donation statistics
- `GET /api/donations/list` - Get confirmed donations

### Admin Endpoints
- `GET /api/admin/donations` - Get all donations (requires auth)
- `PUT /api/admin/donations` - Confirm a donation (requires auth)
- `POST /api/email/send` - Send emails

## Improvements Over v1.0

| Feature | v1.0 | v2.0 |
|---------|------|------|
| Frontend Framework | Vanilla JS | React + TypeScript |
| Type Safety | None | Full TypeScript |
| Input Validation | Basic | Comprehensive |
| Security | Vulnerable | Best Practices |
| Admin Panel | Database Only | Full Web UI |
| Email Integration | Simple | Template-based |
| Analytics | Basic | Comprehensive |
| Rate Limiting | Basic IP Check | Advanced |
| Error Handling | Minimal | Robust |
| Mobile Design | Basic | Fully Responsive |
| Code Organization | Mixed | Modular |

## Development

```bash
# Development server
npm run dev

# Build
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

## Deployment

Deploy to Vercel:

```bash
git push origin main
```

Or manually:

```bash
npm run build
npm start
```

## Security Notes

1. Always use HTTPS in production
2. Set strong ADMIN_PASSWORD
3. Configure CORS properly
4. Enable rate limiting
5. Use environment variables for sensitive data
6. Regular security audits recommended

## Future Enhancements

- [ ] WeChat Pay/Alipay SDK integration
- [ ] Automated payment verification
- [ ] Webhook support for payment confirmations
- [ ] More email templates
- [ ] SMS notifications
- [ ] Donation tiers/perks system
- [ ] Donation receipt generation
- [ ] Advanced analytics dashboard
- [ ] Export donation data
- [ ] Multi-language support

## License

MIT

## Credits

Based on original [Hexo-Donate](https://github.com/xingjiahui/Hexo-Donate) by xingjiahui

## Support

For issues, feature requests, or contributions, please open an issue on GitHub.
