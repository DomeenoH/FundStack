# 🚀 Hexo-Donate v2.0 - 部署配置指南

[English](DEPLOYMENT_GUIDE.md) | [简体中文](DEPLOYMENT_GUIDE_CN.md)

## ✅ 已完成的部分
- ✓ 数据库已连接（Neon PostgreSQL）
- ✓ 数据表已创建（donations 和 donation_stats）
- ✓ 项目结构已搭建完毕

## 🔧 还需要配置的环节

### 1️⃣ 基础配置 - 必需项

在 Vercel 项目的 **Settings > Environment Variables** 中添加以下变量：

#### 数据库配置（已连接，但需验证）
\`\`\`
DATABASE_URL=postgresql://...  # 从 Neon 集成自动获取
\`\`\`

#### 管理员密码（必需）
\`\`\`
ADMIN_PASSWORD=你的安全密码  # 例如：MySecurePass123!
\`\`\`

**设置步骤：**
- 打开侧边栏 **"Vars"** 标签
- 点击 "Add Variable"
- 输入 `ADMIN_PASSWORD` 作为 key
- 输入你的强密码作为 value
- 点击保存

---

### 2️⃣ 邮件通知配置（可选但推荐）

选择以下任一邮件服务配置：

#### 选项 A: 使用 Resend（推荐）
\`\`\`
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_xxxxx...  # 从 https://resend.com 获取
EMAIL_FROM=noreply@yourdomain.com
\`\`\`

#### 选项 B: 使用 SendGrid
\`\`\`
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=SG.xxxxx...  # 从 https://sendgrid.com 获取
EMAIL_FROM=noreply@yourdomain.com
\`\`\`

#### 选项 C: 使用 SMTP（任何邮件服务）
\`\`\`
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com
\`\`\`

**不配置邮件？** 系统会在开发环境自动使用日志模式，邮件内容会显示在控制台。

---

### 3️⃣ 部署到 Vercel

1. **登录 Vercel 侧边栏**
   - 打开右上角菜单，点击 "Settings"
   - 连接你的 GitHub 账户（可选，用于推送代码）

2. **发布项目**
   - 点击右上角的 **"Publish"** 按钮
   - 选择部署目标（New Vercel Project 或 Existing）
   - 配置环境变量
   - 点击 Deploy

---

## 📝 配置步骤总结

### 快速开始（5 分钟）

1. **打开侧边栏** → 点击 **"Vars"**
2. **添加 `ADMIN_PASSWORD`** 变量
3. **点击 Publish** 按钮
4. **等待部署完成**

### 完整体验（包含邮件）

1. 完成上述 3 个快速步骤
2. 在 Resend/SendGrid 申请 API Key
3. 添加 EMAIL_* 变量
4. 部署更新版本

---

## 🔐 安全检查清单

- ✓ 设置强密码（`ADMIN_PASSWORD`）
- ✓ 不要在代码中硬编码敏感信息
- ✓ 定期更新密码
- ✓ 启用 Vercel 的环境变量加密（自动）

---

## 🧪 测试部署

### 访问页面
- 主页：https://your-project.vercel.app/
- 捐赠列表：https://your-project.vercel.app/list
- 管理后台：https://your-project.vercel.app/admin
- 数据分析：https://your-project.vercel.app/analytics

### 测试管理后台
1. 进入 /admin 页面
2. 输入你设置的 `ADMIN_PASSWORD`
3. 点击登录
4. 查看已提交的捐赠记录

---

## ❓ 常见问题

**Q: 忘记管理员密码怎么办？**
A: 在 Vercel 环境变量中更新 `ADMIN_PASSWORD` 的值，然后重新部署

**Q: 为什么邮件收不到？**
A: 检查 API Key 是否正确，检查 `EMAIL_FROM` 地址是否配置

**Q: 如何更改数据库？**
A: 数据库连接字符串存储在 `DATABASE_URL`，更新此变量即可切换数据库

---

## 📞 需要帮助？

如有问题，请检查：
1. 环境变量是否正确设置
2. 数据库连接是否有效
3. 浏览器控制台是否有错误信息
4. 服务器日志（Vercel Dashboard → Logs）
