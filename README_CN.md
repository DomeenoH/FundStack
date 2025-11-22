# Hexo-Donate - 现代化赞助管理系统

[English](README.md) | [简体中文](README_CN.md)

基于现代Web技术构建的完整模块化赞助管理系统，具有安全的数据处理、自动邮件通知和综合管理功能。

## ✨ 功能特性

### 核心功能
- **现代赞助表单**：简洁、响应式界面，实时验证
- **安全数据处理**：输入清理、SQL注入防护、XSS防护
- **多种支付方式**：支持微信支付、支付宝、QQ支付等
- **邮件通知**：为赞助者和管理员提供自动通知
- **管理仪表板**：带有过滤和搜索的综合管理面板
- **动态配置**：基于Web的站点配置，无需修改代码
- **移动端优化**：完全响应式设计，触摸友好的交互

### 安全性
- TypeScript提供类型安全和代码质量保障
- 全面的输入验证和清理
- SQL注入和XSS攻击防护
- CORS安全配置
- 速率限制防止滥用
- 安全的管理员认证

### 用户体验
- 使用Tailwind CSS和Shadcn UI组件的现代界面
- 完全响应式的移动端优化布局
- 实时表单验证，提供有用的错误提示
- 加载状态和流畅过渡效果
- 可访问性设计模式（符合WCAG标准）
- 触摸友好的移动端交互

### 数据分析与报告
- 实时赞助统计仪表板
- 赞助者数量和总金额跟踪
- 支付方式分布图表
- 可自定义周期的趋势分析
- CSV导出功能用于报告
- 个人赞助者历史记录跟踪

## 🔧 技术栈

- **前端**: React 19, TypeScript, Tailwind CSS 4.1, Shadcn UI
- **后端**: Next.js 16 API Routes  
- **数据库**: PostgreSQL (Neon Serverless)
- **邮件**: Resend / SendGrid API集成
- **图表**: Recharts数据可视化
- **部署**: Vercel (推荐)

## 📦 快速开始

### 前置要求
- Node.js 18+ 
- PostgreSQL数据库或Neon账户
- 邮件服务API密钥（可选，用于通知）

### 安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/hexo-donate-refactor.git
cd hexo-donate-refactor

# 安装依赖
pnpm install

# 设置环境变量
cp .env.example .env.local
# 编辑.env.local填入您的配置

# 初始化数据库
# 在PostgreSQL实例中执行scripts/init-database.sql

# 运行开发服务器
pnpm dev
```

访问 `http://localhost:3000` 查看赞助页面。

## ⚙️ 配置

### 环境变量

创建`.env.local`文件并填入以下变量：

```env
# 数据库
DATABASE_URL=postgresql://user:password@host/database

# 管理员凭据
ADMIN_PASSWORD=your_secure_password_here
ADMIN_EMAIL=admin@example.com

# 邮件服务（可选）
EMAIL_PROVIDER=resend  # 或 sendgrid
EMAIL_API_KEY=your_api_key_here
EMAIL_FROM=noreply@yourdomain.com

# 站点URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3000/admin

# 安全
RATE_LIMIT_ENABLED=true
```

### 邮件服务设置

**推荐：Resend**
1. 在[resend.com](https://resend.com)注册
2. 添加并验证您的域名
3. 生成API密钥
4. 设置`EMAIL_PROVIDER=resend`和`EMAIL_API_KEY`

**备选：SendGrid**
1. 在[sendgrid.com](https://sendgrid.com)注册
2. 生成API密钥
3. 设置`EMAIL_PROVIDER=sendgrid`和`EMAIL_API_KEY`

## 📱 移动端优化

本项目针对移动设备进行了全面优化：

- **响应式布局**：适应所有屏幕尺寸
- **触摸友好**：按钮和表单控件符合44x44px最小标准
- **移动端优化**：虚拟键盘优化（`inputMode`属性）
- **横向滚动**：带有视觉指示器的表格
- **自适应网格**：统计和数据卡片布局
- **优化的字体大小**：和小屏幕间距

## 📚 文档

- **[安装指南](SETUP_GUIDE.md)**: 英文详细安装和配置说明
- **[安装指南(中文)](SETUP_GUIDE_CN.md)**: 中文详细安装配置指南
- **[部署指南](DEPLOYMENT_GUIDE.md)**: 生产环境部署说明
- **[API文档](#api-endpoints)**: API参考见下文

## 🔗 API 端点

### 公开端点

```
GET  /api/donations        # 获取赞助统计
POST /api/donations        # 提交新赞助
GET  /api/donations/list   # 获取公开赞助列表
GET  /api/donations/[id]   # 获取赞助者详情和历史
GET  /api/analytics        # 获取分析数据
GET  /api/config           # 获取站点配置
```

### 管理端点（需要认证）

```
GET   /api/admin/donations      # 列出所有赞助
PATCH /api/admin/donations      # 更新赞助状态
GET   /api/admin/config         # 获取当前配置
PATCH /api/admin/config         # 更新站点配置
```

## 🎯 主要改进

| 功能 | 之前 | 现在 |
|------|------|------|
| 框架 | 原生JS | React + TypeScript |
| 类型安全 | 无 | 完整TypeScript |
| 验证 | 基础 | 全面 |
| 安全性 | 基础 | 生产就绪 |
| 管理面板 | 无 | 完整Web界面 |
| 配置 | 硬编码 | 动态Web配置 |
| 邮件 | 简单 | 基于模板 |
| 数据分析 | 无 | 全面 |
| 移动端 | 基础 | 完全优化 |
| 代码质量 | 混杂 | 模块化测试 |

## 🚀 部署

### 部署到Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. 推送代码到GitHub
2. 在Vercel中导入仓库
3. 配置环境变量
4. 部署！

详细说明请参见 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)。

## 🔐 安全最佳实践

1. 生产环境始终使用HTTPS
2. 设置强壮的`ADMIN_PASSWORD`（20+字符）
3. 为您的域名正确配置CORS
4. 生产环境启用速率限制
5. 保持依赖更新：`pnpm audit`
6. 定期备份数据库
7. 使用环境专用的凭据

## 📄 许可证

MIT

## 🙏 致谢

受 xingjiahui 的 [Hexo-Donate](https://github.com/xingjiahui/Hexo-Donate) 启发

## 💬 支持

- **问题**: [GitHub Issues](https://github.com/yourusername/hexo-donate-refactor/issues)
- **讨论**: [GitHub Discussions](https://github.com/yourusername/hexo-donate-refactor/discussions)
- **邮件**: support@yourdomain.com

---

使用 Next.js 和 TypeScript 用 ❤️ 制作
