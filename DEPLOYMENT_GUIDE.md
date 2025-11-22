# 🚀 Hexo-Donate v2.0 - Deployment Configuration Guide

[English](DEPLOYMENT_GUIDE.md) | [简体中文](DEPLOYMENT_GUIDE_CN.md)

## ✅ Completed Setup
- ✓ Database connected (Neon PostgreSQL)
- ✓ Data tables created (donations and donation_stats)
- ✓ Project structure established

## 🔧 Configuration Required

### 1️⃣ Basic Configuration - Required

Add the following variables in Vercel project **Settings > Environment Variables**:

#### Database Configuration (Connected, but needs verification)
```
DATABASE_URL=postgresql://...  # Automatically obtained from Neon integration
```

#### Admin Password (Required)
```
ADMIN_PASSWORD=your_secure_password  # Example: MySecurePass123!
```

**Setup Steps:**
- Open the sidebar **"Vars"** tab
- Click "Add Variable"
- Enter `ADMIN_PASSWORD` as key
- Enter your strong password as value
- Click save

---

### 2️⃣ Email Notification Configuration (Optional but Recommended)

Choose one of the following email service configurations:

#### Option A: Using Resend (Recommended)
```
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_xxxxx...  # Get from https://resend.com
EMAIL_FROM=noreply@yourdomain.com
```

#### Option B: Using SendGrid
```
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=SG.xxxxx...  # Get from https://sendgrid.com
EMAIL_FROM=noreply@yourdomain.com
```

#### Option C: Using SMTP (Any Email Service)
```
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

**Not configuring email?** The system will automatically use log mode in development environment, and email content will be displayed in the console.

---

### 3️⃣ Deploy to Vercel

1. **Login to Vercel Sidebar**
   - Open the top-right menu, click "Settings"
   - Connect your GitHub account (optional, for pushing code)

2. **Publish Project**
   - Click the **"Publish"** button in the top-right
   - Select deployment target (New Vercel Project or Existing)
   - Configure environment variables
   - Click Deploy

---

## 📝 Configuration Summary

### Quick Start (5 minutes)

1. **Open sidebar** → Click **"Vars"**
2. **Add `ADMIN_PASSWORD`** variable
3. **Click Publish** button
4. **Wait for deployment to complete**

### Full Experience (Including Email)

1. Complete the above 3 quick steps
2. Apply for API Key at Resend/SendGrid
3. Add EMAIL_* variables
4. Deploy updated version

---

## 🔐 Security Checklist

- ✓ Set strong password (`ADMIN_PASSWORD`)
- ✓ Don't hardcode sensitive information in code
- ✓ Regularly update passwords
- ✓ Enable Vercel environment variable encryption (automatic)

---

## 🧪 Test Deployment

### Access Pages
- Homepage: https://your-project.vercel.app/
- Donation List: https://your-project.vercel.app/list
- Admin Panel: https://your-project.vercel.app/admin
- Data Analytics: https://your-project.vercel.app/analytics

### Test Admin Panel
1. Go to /admin page
2. Enter your configured `ADMIN_PASSWORD`
3. Click login
4. View submitted donation records

---

## ❓ FAQ

**Q: What if I forget the admin password?**
A: Update the `ADMIN_PASSWORD` value in Vercel environment variables, then redeploy

**Q: Why aren't emails being received?**
A: Check if API Key is correct, check if `EMAIL_FROM` address is configured

**Q: How to change database?**
A: Database connection string is stored in `DATABASE_URL`, update this variable to switch databases

---

## 📞 Need Help?

If you have issues, please check:
1. Are environment variables set correctly
2. Is database connection valid
3. Are there error messages in browser console
4. Server logs (Vercel Dashboard → Logs)
