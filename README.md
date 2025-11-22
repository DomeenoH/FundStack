# Hexo-Donate - Modern Donation Management System

[English](README.md) | [简体中文](README_CN.md)

A complete modular donation management system built with modern web technologies, featuring secure data handling, automatic email notifications, and comprehensive admin controls.

## ✨ Features

### Core Features
- **Modern Donation Form**: Clean, responsive interface with real-time validation
- **Secure Data Handling**: Input sanitization, SQL inject protection, XSS防护
- **Multiple Payment Methods**: Support for WeChat Pay, Alipay, QQ Pay, and more
- **Email Notifications**: Automatic notifications for donors and administrators
- **Admin Dashboard**: Comprehensive management panel with filtering and search
- **Dynamic Configuration**: Web-based site configuration without code changes
- **Mobile Optimized**: Fully responsive design with touch-friendly interactions

### Security
- TypeScript for type safety and code quality
- Comprehensive input validation and sanitization  
- SQL injection and XSS protection
- CORS security configuration
- Rate limiting to prevent abuse
- Secure admin authentication

### User Experience
- Modern UI with Tailwind CSS and Shadcn UI components
- Fully responsive mobile-optimized layouts
- Real-time form validation with helpful error messages
- Loading states and smooth transitions
- Accessible design patterns (WCAG compliant)
- Touch-friendly mobile interactions

### Analytics & Reporting  
- Real-time donation statistics dashboard
- Donor count and total amount tracking  
- Payment method distribution charts
- Trend analysis with customizable periods
- CSV export functionality for reports
- Individual donor history tracking

## 🔧 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4.1, Shadcn UI
- **Backend**: Next.js 16 API Routes  
- **Database**: PostgreSQL (Neon Serverless)
- **Email**: Resend / SendGrid API integration
- **Charts**: Recharts for data visualization
- **Deployment**: Vercel (recommended)

## 📦 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database or Neon account
- Email service API key (optional, for notifications)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/hexo-donate-refactor.git
cd hexo-donate-refactor

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Initialize database
# Execute scripts/init-database.sql in your PostgreSQL instance

# Run development server
pnpm dev
```

Visit `http://localhost:3000` to see the donation page.

## ⚙️ Configuration

### Environment Variables

Create `.env.local` with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host/database

# Admin Credentials
ADMIN_PASSWORD=your_secure_password_here
ADMIN_EMAIL=admin@example.com

# Email Service (Optional)
EMAIL_PROVIDER=resend  # or sendgrid
EMAIL_API_KEY=your_api_key_here
EMAIL_FROM=noreply@yourdomain.com

# Site URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3000/admin

# Security
RATE_LIMIT_ENABLED=true
```

### Email Service Setup

**Recommended: Resend**
1. Sign up at [resend.com](https://resend.com)
2. Add and verify your domain
3. Generate API key
4. Set `EMAIL_PROVIDER=resend` and `EMAIL_API_KEY`

**Alternative: SendGrid**
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Generate API key
3. Set `EMAIL_PROVIDER=sendgrid` and `EMAIL_API_KEY`

## 📱 Mobile Optimization

This project is fully optimized for mobile devices with:

- **Responsive layouts** that adapt  to all screen sizes
- **Touch-friendly** buttons and form controls (44x44px minimum)
- **Mobile-optimized** virtual keyboards (`inputMode` attributes)
- **Horizontal scrolling** tables with visual indicators
- **Adaptive grid layouts** for statistics and data cards
- **Optimized font sizes** and spacing for small screens

## 📚 Documentation

- **[Setup Guide](SETUP_GUIDE.md)**: Detailed installation and configuration
- **[Setup Guide (CN)](SETUP_GUIDE_CN.md)**: 中文安装配置指南
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)**: Production deployment instructions
- **[API Documentation](#api-endpoints)**: API reference below

## 🔗 API Endpoints

### Public Endpoints

```
GET  /api/donations        # Get donation statistics
POST /api/donations        # Submit new donation
GET  /api/donations/list   # Get public donation list
GET  /api/donations/[id]   # Get donor details and history
GET  /api/analytics        # Get analytics data
GET  /api/config           # Get site configuration
```

### Admin Endpoints (Authentication Required)

```
GET   /api/admin/donations      # List all donations
PATCH /api/admin/donations      # Update donation status
GET   /api/admin/config         #Get current configuration
PATCH /api/admin/config         # Update site configuration
```

## 🎯 Key Improvements

| Feature | Previous | Current |
|---------|----------|---------|
| Framework | Vanilla JS | React + TypeScript |
| Type Safety | None | Full TypeScript |
| Validation | Basic | Comprehensive |
| Security | Basic | Production-ready |
| Admin Panel | None | Full Web UI |
| Configuration | Hardcoded | Dynamic Web-based |
| Email | Simple | Template-based |
| Analytics | None | Comprehensive |
| Mobile | Basic | Fully Optimized |
| Code Quality | Mixed | Modular & Tested |

## 🚀 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.co m/new)

1. Push code to GitHub
2. Import repository in Vercel
3. Configure environment variables
4. Deploy!

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🔐 Security Best Practices

1. Always use HTTPS in production
2. Set strong `ADMIN_PASSWORD` (20+ characters)
3. Configure CORS properly for your domain
4. Enable rate limiting in production
5. Keep dependencies updated: `pnpm audit`
6. Backup database regularly
7. Use environment-specific credentials

## 📄 License

MIT

## 🙏 Acknowledgments

Inspired by [Hexo-Donate](https://github.com/xingjiahui/Hexo-Donate) by xingjiahui

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/hexo-donate-refactor/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/hexo-donate-refactor/discussions)
- **Email**: Support@yourdomain.com

---

Made with ❤️ using Next.js and TypeScript
